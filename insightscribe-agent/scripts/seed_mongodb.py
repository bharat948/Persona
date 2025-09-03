import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import pymongo
from pymongo.errors import ConnectionFailure

# --- Configuration ---
# Load environment variables from the .env file in the project root
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# --- Seed Data Definition ---
# Define the AppRepo configurations you want to ensure exist in the database.
# This is the single source of truth for your test configurations.
SEED_DATA = [
    {
        "app_id": "innovare-demo",
        "name": "Innovare BI Demo Agent",
        "system_instructions": (
            "You are InsightScribe, a world-class AI companion for healthcare BI. "
            "Your goal is to assist users by breaking down complex requests, "
            "delegating to specialized agents, and utilizing available BI tools. "
            "Always prioritize patient privacy and HIPAA compliance."
        ),
        "allowed_agents": [
            "QueryGeneratorAgent",
            "DashboardBuilderAgent"
        ],
        "allowed_tools": [
            "GetCubeMetadata",
            "ExecuteBIQuery"
        ],
        "persona": {
            "tone": "professional",
            "language": "en-US"
        }
    },
    {
        "app_id": "claims-manager-restricted",
        "name": "Claims Manager Assistant",
        "system_instructions": (
            "You are a specialized assistant for Claims Managers. "
            "Focus on claim denial trends, appeals, and provider performance. "
            "Do not perform administrative tasks."
        ),
        "allowed_agents": [
            "QueryGeneratorAgent"
        ],
        "allowed_tools": [
            "ExecuteBIQuery"
        ],
        "persona": {
            "tone": "concise",
            "language": "en-US"
        }
    }
]

def seed_database():
    """
    Connects to MongoDB and upserts the defined AppRepo configurations.
    This function is idempotent.
    """
    if not MONGO_URI or not MONGO_DB_NAME:
        print("Error: MONGO_URI and MONGO_DB_NAME must be set in your .env file.", file=sys.stderr)
        sys.exit(1)

    client = None
    try:
        print(f"Connecting to MongoDB at {MONGO_URI.split('@')[-1]}...")
        client = pymongo.MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        apprepo_collection = db["apprepo"]
        print("Connection successful.")
        
        print("\nStarting to seed 'apprepo' collection...")
        for app_repo_config in SEED_DATA:
            app_id = app_repo_config["app_id"]
            print(f"  -> Processing AppRepo: '{app_id}'")
            
            # Use update_one with upsert=True to make the script idempotent.
            # It will insert if not found, or update if found.
            query = {"app_id": app_id}
            
            update_data = {
                "$set": {
                    **app_repo_config,
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            }
            
            result = apprepo_collection.update_one(query, update_data, upsert=True)
            
            if result.upserted_id:
                print(f"     ... CREATED new document.")
            elif result.modified_count > 0:
                print(f"     ... UPDATED existing document.")
            else:
                 print(f"     ... Document is already up-to-date.")

        print("\nSeeding complete.")

    except ConnectionFailure as e:
        print(f"Error: Could not connect to MongoDB. Please check your MONGO_URI.", file=sys.stderr)
        print(e, file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if client:
            client.close()
            print("\nMongoDB connection closed.")


if __name__ == "__main__":
    seed_database()
