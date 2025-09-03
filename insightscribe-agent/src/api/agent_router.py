import logging
from fastapi import APIRouter, HTTPException, Depends
from sse_starlette.sse import EventSourceResponse
import json

from ..models.api_models import InitRequest, InitResponse, ChatRequest
from ..services.session_service import session_manager
from ..services.agent_orchestrator import AgentOrchestrator
from ..services.mongo_service import mongo_service
from ..main import request_user_id, request_session_id # Import ContextVars

router = APIRouter(prefix="/agent", tags=["Agent"])
logger = logging.getLogger(__name__)

@router.post("/init", response_model=InitResponse)
async def init_agent_session(req: InitRequest):
    """Initializes a new agent session."""
    request_user_id.set(req.user_id) # Set user_id in context
    logger.info(f"Initializing session for user: {req.user_id}, app: {req.app_id}")
    try:
        session = await session_manager.init_session(
            user_id=req.user_id,
            app_id=req.app_id,
            enable_ltm_write=req.enable_long_term_write,
            short_term_window=req.short_term_window
        )
        request_session_id.set(session.session_id) # Set session_id in context after creation
        logger.info(f"Session initialized: {session.session_id}")
        
        app_config = await mongo_service.get_app_config(req.app_id)
        if not app_config:
            logger.error(f"App config not found for app_id: {req.app_id}")
            raise HTTPException(status_code=404, detail=f"App config for {req.app_id} not found.")
        
        return InitResponse(
            session_id=session.session_id,
            effective_config=app_config.dict(exclude={"id"}),
            allowed_tools=app_config.allowed_tools
        )
    except ValueError as e:
        logger.error(f"Error initializing session: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.exception("An unexpected error occurred during session initialization.")
        raise HTTPException(status_code=500, detail="Internal server error.")

@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Handles a user message and streams back the agent's response."""
    request_user_id.set(req.user_id) # Set user_id in context
    request_session_id.set(req.session_id) # Set session_id in context
    logger.info(f"Received chat message: '{req.message}'")

    session = await session_manager.get_session(req.session_id)
    if not session or session.user_id != req.user_id:
        logger.warning(f"Session not found or user mismatch for session_id: {req.session_id}, user_id: {req.user_id}")
        raise HTTPException(status_code=404, detail="Session not found or user mismatch.")
    
    app_config = await mongo_service.get_app_config(session.app_id)
    if not app_config:
        logger.error(f"App config for session {req.session_id} not found for app_id: {session.app_id}")
        raise HTTPException(status_code=404, detail="App config for session not found.")

    # Append user message to history before starting orchestration
    await session_manager.append_message(req.session_id, "user", req.message)
    logger.debug("User message appended to session history.")
    
    orchestrator = AgentOrchestrator(session, app_config)

    async def event_generator():
        async for event in orchestrator.run(req.message):
            yield json.dumps(event)
    
    return EventSourceResponse(event_generator())
