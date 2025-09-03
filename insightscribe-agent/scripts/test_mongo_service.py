import asyncio
import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
import uuid

# --- Setup Project Path ---
# This allows the script to import modules from the 'src' directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from src.services.mongo_service import MongoService
from src.models.db_models import AppRepo, SessionMemory, LongTermMemoryEntry, ConversationTurn

# --- Test Utilities ---
# For colorful console output
class TColors:
    OKGREEN = '\033[92m'
    FAIL = '\033[91m'
    WARNING = '\033[93m'
    ENDC = '\033[0m'

test_results = {"passed": 0, "failed": 0}

def print_test_header(name):
    print(f"\n{'='*20}\n Running Test: {name}\n{'='*20}")

def assert_test(condition, message):
    if condition:
        print(f"  {TColors.OKGREEN}[PASS]{TColors.ENDC} {message}")
        test_results["passed"] += 1
    else:
        print(f"  {TColors.FAIL}[FAIL]{TColors.ENDC} {message}")
        test_results["failed"] += 1

# --- Test Cases ---

async def test_read_app_repo(mongo: MongoService):
    """Tests reading an existing and a non-existing AppRepo config."""
    print_test_header("Read AppRepo")
    
    # Test 1: Read an existing AppRepo
    app_id_exists = "innovare-demo"
    print(f"  Attempting to read existing AppRepo: '{app_id_exists}'...")
    app_config = await mongo.get_app_config(app_id_exists)
    assert_test(app_config is not None, "AppRepo should be found.")
    assert_test(isinstance(app_config, AppRepo), "Result should be an AppRepo instance.")
    assert_test(app_config.app_id == app_id_exists, f"App ID should be '{app_id_exists}'.")

    # Test 2: Read a non-existing AppRepo
    app_id_missing = "non-existent-app"
    print(f"  Attempting to read non-existing AppRepo: '{app_id_missing}'...")
    app_config_missing = await mongo.get_app_config(app_id_missing)
    assert_test(app_config_missing is None, "Non-existing AppRepo should return None.")

async def test_session_lifecycle(mongo: MongoService):
    """Tests the full lifecycle of a short-term memory session."""
    print_test_header("Session Memory (STM) Lifecycle")
    
    test_session_id = f"test-session-{uuid.uuid4().hex}"
    test_user_id = "test-user-stm"
    test_app_id = "innovare-demo"
    
    try:
        # Step 1: Create a session
        print("  Step 1: Creating a new session...")
        # The create_or_update_session method is not in MongoService, so we'll use create_session and then update
        # For testing purposes, we'll create a dummy session object first
        now = datetime.utcnow()
        expires_at = now + timedelta(hours=1) # Dummy TTL for test
        session_to_create = SessionMemory(
            session_id=test_session_id,
            user_id=test_user_id,
            app_id=test_app_id,
            expires_at=expires_at
        )
        await mongo.create_session(session_to_create)
        session = await mongo.get_session(test_session_id) # Retrieve to confirm creation
        
        assert_test(session is not None, "Session object should be returned on creation.")
        assert_test(isinstance(session, SessionMemory), "Result should be a SessionMemory instance.")
        assert_test(session.session_id == test_session_id, "Session ID should match.")
        
        # Step 2: Append a message to the conversation
        print("  Step 2: Appending a message...")
        user_turn = ConversationTurn(role="user", text="Hello, agent!")
        await mongo.append_to_conversation(test_session_id, user_turn)
        
        # Step 3: Retrieve and verify the updated session
        print("  Step 3: Retrieving session to verify update...")
        updated_session = await mongo.get_session(test_session_id)
        assert_test(len(updated_session.conversation) == 1, "Conversation history should have 1 entry.")
        assert_test(updated_session.conversation[0].text == "Hello, agent!", "Message text should be correct.")
        
    finally:
        # Step 4: Cleanup
        print("  Step 4: Cleaning up created session...")
        deleted_count = await mongo.delete_session_by_id(test_session_id)
        assert_test(deleted_count == 1, "Cleanup should delete 1 session document.")

async def test_ltm_lifecycle(mongo: MongoService):
    """Tests the full lifecycle of a long-term memory entry."""
    print_test_header("Long-Term Memory (LTM) Lifecycle")
    
    test_user_id = "test-user-ltm"
    test_app_id = "innovare-demo"
    ltm_id_to_delete = None

    try:
        # Step 1: Create an LTM entry
        print("  Step 1: Creating a new LTM entry...")
        ltm_entry = LongTermMemoryEntry(
            user_id=test_user_id,
            app_id=test_app_id,
            type="preference",
            content={"summary_text": "User prefers bar charts for financial data."}
        )
        # The add_ltm_entry method does not return the ID directly, it inserts.
        # We need to retrieve it after insertion to get the ID for deletion.
        await mongo.add_ltm_entry(ltm_entry)
        
        # Retrieve the newly added LTM entry to get its ID
        # This is a simplified retrieval; in a real scenario, you might query by content or timestamp
        retrieved_ltm_entries = await mongo.get_ltm_for_user(test_user_id, app_id=test_app_id)
        new_ltm_entry = next((e for e in retrieved_ltm_entries if e.content.get("summary_text") == "User prefers bar charts for financial data."), None)
        
        assert_test(new_ltm_entry is not None, "Newly added LTM entry should be retrievable.")
        if new_ltm_entry:
            ltm_id_to_delete = str(new_ltm_entry.id)
            assert_test(ltm_id_to_delete is not None, "Adding an LTM entry should result in a retrievable ID.")
        
        # Step 2: Retrieve LTM for the user
        print("  Step 2: Retrieving LTM entries for the user...")
        user_memories = await mongo.get_ltm_for_user(test_user_id)
        assert_test(len(user_memories) > 0, "Should retrieve at least one memory entry.")
        
        found_memory = next((m for m in user_memories if str(m.id) == ltm_id_to_delete), None)
        assert_test(found_memory is not None, "The newly created memory should be found.")
        if found_memory:
            assert_test(
                found_memory.content.get("summary_text") == "User prefers bar charts for financial data.",
                "The memory summary text should match."
            )

    finally:
        # Step 3: Cleanup
        if ltm_id_to_delete:
            print("  Step 3: Cleaning up created LTM entry...")
            deleted_count = await mongo.delete_ltm_by_id(ltm_id_to_delete)
            assert_test(deleted_count == 1, "Cleanup should delete 1 LTM document.")


# --- Main Execution ---

async def main():
    """Main function to run all MongoService tests."""
    print("Starting MongoService Test Suite...")
    print("-" * 50)

    # Load .env file
    dotenv_path = os.path.join(project_root, '.env')
    load_dotenv(dotenv_path=dotenv_path)

    # Instantiate the service
    mongo_service = MongoService()

    # Run tests
    await test_read_app_repo(mongo_service)
    await test_session_lifecycle(mongo_service)
    await test_ltm_lifecycle(mongo_service)

    # Print summary
    print("\n" + "-" * 50)
    print("Test Suite Finished.")
    print(f"  {TColors.OKGREEN}Passed: {test_results['passed']}{TColors.ENDC}")
    print(f"  {TColors.FAIL}Failed: {test_results['failed']}{TColors.ENDC}")
    print("-" * 50)

    if test_results['failed'] > 0:
        sys.exit(1) # Exit with an error code if any tests failed

if __name__ == "__main__":
    asyncio.run(main())
