import logging
from contextvars import ContextVar
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from .api import admin_router, agent_router # Assuming you move CRUD to admin_router

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(user_id)s - %(session_id)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ContextVars for request-specific data
request_user_id: ContextVar[str | None] = ContextVar("request_user_id", default=None)
request_session_id: ContextVar[str | None] = ContextVar("request_session_id", default=None)

class RequestContextMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        # Reset context vars for each request
        request_user_id.set(None)
        request_session_id.set(None)
        
        # Create a custom logger adapter to inject context vars
        # This allows us to use logger.info("message") and have user_id/session_id automatically added
        class ContextAdapter(logging.LoggerAdapter):
            def process(self, msg, kwargs):
                extra = kwargs.get('extra', {})
                extra['user_id'] = request_user_id.get() or 'N/A'
                extra['session_id'] = request_session_id.get() or 'N/A'
                kwargs['extra'] = extra
                return msg, kwargs
        
        # Apply the adapter to the root logger for this request
        # Note: This approach modifies the global logger for the duration of the request.
        # For more robust solutions in production, consider libraries like `loguru` or
        # passing a logger instance with bound context through dependencies.
        # For this task, we'll use a simpler approach.
        original_logger_class = logging.getLoggerClass()
        logging.setLoggerClass(ContextAdapter)
        
        response = await call_next(request)
        
        # Restore original logger class
        logging.setLoggerClass(original_logger_class)
        return response

app = FastAPI(
    title="InsightScribe Agent Service",
    description="Orchestrates AI agents, tools, and memory for BI tasks."
)

app.add_middleware(RequestContextMiddleware)

# Include the router for agent interactions (init, chat)
app.include_router(agent_router.router)

# Include the router for administrative tasks (AppRepo CRUD, LTM management)
app.include_router(admin_router.router, prefix="/admin", tags=["Admin"]) 

@app.get("/", tags=["Health Check"])
async def root():
    logger.info("Health check endpoint accessed.")
    return {"status": "ok", "message": "InsightScribe Agent Service is running."}
