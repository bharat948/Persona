import asyncio
import httpx
import os
import sys
import json
from dotenv import load_dotenv
import pymongo

# --- Setup Project Path & Constants ---
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Load environment variables
dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path=dotenv_path)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")
BASE_URL = "http://127.0.0.1:8000" # URL of your running FastAPI server

TEST_APP_ID = "innovare-demo"
TEST_USER_ID = "e2e-test-user"

# --- Test Utilities ---
class TColors:
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    WARNING = '\033[93m'
    ENDC = '\033[0m'

test_results = {"passed": 0, "failed": 0}

def print_test_header(name):
    print(f"\n{'='*20}\n Running Test Case: {name}\n{'='*20}")

def assert_test(condition, message):
    if condition:
        print(f"  {TColors.OKGREEN}[PASS]{TColors.ENDC} {message}")
        test_results["passed"] += 1
    else:
        print(f"  {TColors.FAIL}[FAIL]{TColors.ENDC} {message}")
        test_results["failed"] += 1

def parse_sse_event(line: str) -> dict | None:
    """Parses a single line from an SSE stream."""
    if line.strip().startswith("data:"):
        try:
            # The data part is a JSON string, remove "data:" prefix
            return json.loads(line.strip()[5:])
        except json.JSONDecodeError:
            return None
    return None

async def main():
    """Main function to run the end-to-end agent test."""
    print("Starting Agent End-to-End Test Suite...")
    print(f"Targeting FastAPI server at: {BASE_URL}")
    print("-" * 50)
    
    session_id = None
    mongo_client = None

    try:
        # --- STEP 1: Initialize Agent Session ---
        print_test_header("Agent Initialization via /agent/init")
        async with httpx.AsyncClient() as client:
            init_payload = {
                "user_id": TEST_USER_ID,
                "app_id": TEST_APP_ID,
                "enable_long_term_write": True
            }
            response = await client.post(f"{BASE_URL}/agent/init", json=init_payload)
            
            assert_test(response.status_code == 200, f"Init endpoint should return 200 OK (got {response.status_code})")
            if response.status_code != 200:
                print(f"{TColors.FAIL}Response body: {response.text}{TColors.ENDC}")
                raise Exception("Init failed, cannot continue.")

            init_data = response.json()
            session_id = init_data.get("session_id")
            assert_test(session_id and session_id.startswith("sess-"), "Response should contain a valid session_id.")
            assert_test("innovare-demo" in init_data.get("effective_config", {}).get("app_id", ""), "Response should contain the correct AppRepo config.")
            assert_test("ExecuteBIQuery" in init_data.get("allowed_tools", []), "Response should contain the list of allowed tools.")

        # --- STEP 2: Run a Chat Interaction and Process Stream ---
        print_test_header("Chat Interaction via /agent/chat/stream")
        async with httpx.AsyncClient() as client:
            chat_payload = {
                "user_id": TEST_USER_ID,
                "session_id": session_id,
                "message": "What are the top denial reasons?"
            }
            
            received_events = []
            print("  Connecting to stream...")
            async with client.stream("POST", f"{BASE_URL}/agent/chat/stream", json=chat_payload, timeout=30) as response:
                assert_test(response.status_code == 200, "Chat stream endpoint should return 200 OK.")
                
                async for line in response.aiter_lines():
                    event = parse_sse_event(line)
                    if event:
                        print(f"  ... Received event: {event.get('event')}")
                        received_events.append(event)
            
            print("  Stream closed.")
            
            # Verify the events received from our mocked orchestrator
            event_types = [e.get("event") for e in received_events]
            assert_test("status" in event_types, "Stream should contain 'status' events.")
            assert_test("tool_call" in event_types, "Stream should contain a 'tool_call' event.")
            assert_test("message_chunk" in event_types, "Stream should contain 'message_chunk' events.")
            assert_test("done" in event_types, "Stream should contain a final 'done' event.")

        # --- STEP 3: Test LTM Write and Verify Database State ---
        print_test_header("Database State Verification")
        print("  Connecting to MongoDB to verify results...")
        mongo_client = pymongo.MongoClient(MONGO_URI)
        db = mongo_client[MONGO_DB_NAME]
        
        # Verify Short-Term Memory
        stm_doc = db.session_memory.find_one({"session_id": session_id})
        assert_test(stm_doc is not None, "STM document for the session should exist.")
        if stm_doc:
            conversation = stm_doc.get("conversation", [])
            assert_test(len(conversation) > 0, "STM conversation history should not be empty.")
            assert_test(conversation[0].get("role") == "user", "First turn in STM should be from the user.")

        # Trigger and verify Long-Term Memory
        print("  Triggering LTM write with a new message...")
        async with httpx.AsyncClient() as client:
            ltm_payload = {
                "user_id": TEST_USER_ID,
                "session_id": session_id,
                "message": "This is my preference: always use bar charts."
            }
            async with client.stream("POST", f"{BASE_URL}/agent/chat/stream", json=ltm_payload, timeout=30) as response:
                async for _ in response.aiter_lines(): # Consume the stream
                    pass
        
        ltm_doc = db.long_term_memory.find_one({"user_id": TEST_USER_ID, "type": "preference"})
        assert_test(ltm_doc is not None, "LTM document for the preference should have been created.")
        if ltm_doc:
            assert_test("preference" in ltm_doc.get("content", {}).get("summary_text", ""), "LTM summary should contain the correct text.")

    except httpx.ConnectError as e:
        print(f"\n{TColors.FAIL}FATAL ERROR: Could not connect to the FastAPI server at {BASE_URL}{TColors.ENDC}")
        print("Please ensure the server is running before executing this test script.")
        test_results["failed"] += 1
    except Exception as e:
        print(f"\n{TColors.FAIL}An unexpected error occurred during the test: {e}{TColors.ENDC}")
        test_results["failed"] += 1
        
    finally:
        # --- STEP 4: Cleanup ---
        print("\n" + "-" * 20 + "\n Test Cleanup\n" + "-" * 20)
        if session_id and mongo_client:
            db = mongo_client[MONGO_DB_NAME]
            print(f"  Deleting test session: {session_id}")
            db.sessions.delete_one({"session_id": session_id})
            print(f"  Deleting LTM entries for user: {TEST_USER_ID}")
            db.long_term_memory.delete_many({"user_id": TEST_USER_ID})
        elif not session_id:
            print("  Skipping cleanup: session_id was not created.")
        
        if mongo_client:
            mongo_client.close()

        # Print summary
        print("\n" + "-" * 50)
        print("Agent E2E Test Suite Finished.")
        print(f"  {TColors.OKGREEN}Passed: {test_results['passed']}{TColors.ENDC}")
        print(f"  {TColors.FAIL}Failed: {test_results['failed']}{TColors.ENDC}")
        print("-" * 50)

        if test_results['failed'] > 0:
            sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
