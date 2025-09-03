from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class InitRequest(BaseModel):
    user_id: str
    app_id: str
    enable_long_term_write: bool = Field(default=True)
    short_term_window: int = Field(default=3, ge=1, le=10)

class InitResponse(BaseModel):
    session_id: str
    effective_config: Dict[str, Any]
    allowed_tools: List[str]

class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
