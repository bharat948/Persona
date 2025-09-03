import logging
import uuid
from datetime import datetime, timedelta
from typing import List

from ..models.db_models import SessionMemory, ConversationTurn
from ..services.mongo_service import mongo_service
from ..config import settings

logger = logging.getLogger(__name__)

class SessionManager:
    """Manages the lifecycle of conversation sessions."""

    async def init_session(self, user_id: str, app_id: str, enable_ltm_write: bool, short_term_window: int) -> SessionMemory:
        """
        Creates a new session document in MongoDB.
        Validates that the app_id exists in the AppRepo.
        """
        logger.info(f"Attempting to initialize session for app_id: {app_id}")
        app_config = await mongo_service.get_app_config(app_id)
        if not app_config:
            logger.error(f"AppRepo with app_id '{app_id}' not found during session init.")
            raise ValueError(f"AppRepo with app_id '{app_id}' not found.")

        session_id = f"sess-{uuid.uuid4().hex}"
        now = datetime.utcnow()
        expires_at = now + timedelta(hours=settings.SESSION_TTL_HOURS)

        session = SessionMemory(
            session_id=session_id,
            user_id=user_id,
            app_id=app_id,
            ephemeral_state={
                "enable_ltm_write": enable_ltm_write,
                "short_term_window": short_term_window
            },
            expires_at=expires_at
        )
        
        await mongo_service.create_session(session)
        logger.info(f"Successfully created session: {session_id}")
        return session

    async def get_session(self, session_id: str) -> SessionMemory | None:
        """Retrieves a session from MongoDB."""
        logger.debug(f"Retrieving session: {session_id}")
        session = await mongo_service.get_session(session_id)
        if not session:
            logger.warning(f"Session not found: {session_id}")
        return session

    async def append_message(self, session_id: str, role: str, text: str) -> None:
        """Appends a message to the conversation and refreshes the TTL."""
        # Note: For HIPAA compliance, consider redacting PHI from `text` before logging.
        # For this task, we will log the first 50 characters for context.
        log_text = text[:50] + '...' if len(text) > 50 else text
        logger.info(f"Appending message for role '{role}': '{log_text}'")
        turn = ConversationTurn(role=role, text=text)
        await mongo_service.append_to_conversation(session_id, turn)
        logger.debug("Message appended and TTL refreshed.")

    async def get_conversation_history(self, session_id: str, window_size: int) -> List[ConversationTurn]:
        """Gets the last N turns of a conversation for the context window."""
        logger.debug(f"Getting conversation history for session: {session_id}, window: {window_size}")
        session = await self.get_session(session_id)
        if not session:
            return []
        
        # Return the last N turns from the conversation array
        return session.conversation[-window_size:]

# Singleton instance
session_manager = SessionManager()
