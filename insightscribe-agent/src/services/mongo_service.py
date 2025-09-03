from pymongo import MongoClient, ASCENDING
from pymongo.errors import CollectionInvalid
from src.config import settings
from src.models.db_models import SessionMemory, AppRepo, ConversationTurn, LongTermMemoryEntry
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class MongoService:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]
        self._ensure_indexes()

    def _ensure_indexes(self):
        # Ensure TTL index for sessions
        try:
            self.db.sessions.create_index(
                "expires_at",
                expireAfterSeconds=0,
                background=True
            )
            logger.info("Ensured TTL index on 'sessions' collection.")
        except CollectionInvalid:
            logger.warning("Collection 'sessions' does not exist yet. Index will be created on first insert.")
        except Exception as e:
            logger.error(f"Error ensuring TTL index on sessions: {e}")

        # Ensure unique index for app_id in app_repo
        try:
            self.db.app_repo.create_index(
                "app_id",
                unique=True,
                background=True
            )
            logger.info("Ensured unique index on 'app_repo.app_id'.")
        except CollectionInvalid:
            logger.warning("Collection 'app_repo' does not exist yet. Index will be created on first insert.")
        except Exception as e:
            logger.error(f"Error ensuring unique index on app_repo: {e}")

    async def create_session(self, session: SessionMemory):
        """Inserts a new session document."""
        await self.db.sessions.insert_one(session.dict(by_alias=True))

    async def get_session(self, session_id: str) -> Optional[SessionMemory]:
        """Retrieves a session by session_id."""
        session_data = await self.db.sessions.find_one({"session_id": session_id})
        if session_data:
            return SessionMemory(**session_data)
        return None

    async def update_session_state(self, session_id: str, updates: dict):
        """Updates specific fields of a session."""
        await self.db.sessions.update_one(
            {"session_id": session_id},
            {"$set": updates}
        )

    async def append_to_conversation(self, session_id: str, turn: ConversationTurn):
        """Appends a conversation turn and updates the session's updated_at and expires_at."""
        now = datetime.utcnow()
        expires_at = now + timedelta(hours=settings.SESSION_TTL_HOURS)
        await self.db.sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"conversation": turn.dict()},
                "$set": {"updated_at": now, "expires_at": expires_at}
            }
        )

    async def get_app_config(self, app_id: str) -> Optional[AppRepo]:
        """Retrieves an AppRepo configuration by app_id."""
        app_data = await self.db.app_repo.find_one({"app_id": app_id})
        if app_data:
            return AppRepo(**app_data)
        return None

    async def add_ltm_entry(self, entry: LongTermMemoryEntry):
        """Adds a new long-term memory entry."""
        await self.db.long_term_memory.insert_one(entry.dict(by_alias=True))

    async def get_ltm_for_user(self, user_id: str, app_id: str = None, limit: int = 5) -> List[LongTermMemoryEntry]:
        """Retrieves relevant long-term memory entries for a user."""
        query = {"user_id": user_id}
        if app_id:
            query["app_id"] = app_id
        
        # In a real RAG system, this would involve vector search.
        # For now, it's a simple retrieval.
        cursor = self.db.long_term_memory.find(query).sort("created_at", ASCENDING).limit(limit)
        return [LongTermMemoryEntry(**doc) async for doc in cursor]

    async def delete_session_by_id(self, session_id: str) -> int:
        """Deletes a session document. Used for test cleanup."""
        result = await self.db.sessions.delete_one({"session_id": session_id})
        return result.deleted_count

    async def delete_ltm_by_id(self, ltm_id: str) -> int:
        """Deletes an LTM document by its _id. Used for test cleanup."""
        from bson import ObjectId
        result = await self.db.long_term_memory.delete_one({"_id": ObjectId(ltm_id)})
        return result.deleted_count

mongo_service = MongoService()
