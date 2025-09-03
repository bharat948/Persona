from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class ConversationTurn(BaseModel):
    role: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SessionMemory(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    session_id: str = Field(...)
    user_id: str = Field(...)
    app_id: str = Field(...)
    conversation: List[ConversationTurn] = Field(default_factory=list)
    ephemeral_state: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(...)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "session_id": "sess-12345",
                "user_id": "user-abc",
                "app_id": "app-bi-dashboard",
                "conversation": [
                    {"role": "user", "text": "Show me sales for Q1"},
                    {"role": "agent", "text": "Here are the sales figures..."}
                ],
                "ephemeral_state": {"openai_thread_id": "thread_xyz"},
                "expires_at": "2025-01-01T00:00:00Z"
            }
        }

class AppRepo(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    app_id: str = Field(...)
    name: str = Field(...)
    description: str = Field(...)
    assistant_id: Optional[str] = None # For OpenAI Assistants API
    allowed_tools: List[str] = Field(default_factory=list)
    config: Dict[str, Any] = Field(default_factory=dict) # General app configuration
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "app_id": "app-bi-dashboard",
                "name": "BI Dashboard Agent",
                "description": "Agent for querying BI dashboards.",
                "assistant_id": "asst_abc123",
                "allowed_tools": ["GetCubeMetadataTool", "ExecuteBIQueryTool"],
                "config": {"default_cube": "SalesCube"}
            }
        }

class LongTermMemoryEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(...)
    app_id: str = Field(...)
    type: str = Field(...) # e.g., "summary", "insight", "user_preference"
    content: Dict[str, Any] = Field(...) # The actual memory content
    embedding: Optional[List[float]] = None # For RAG
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        schema_extra = {
            "example": {
                "user_id": "user-abc",
                "app_id": "app-bi-dashboard",
                "type": "summary",
                "content": {"text": "User frequently asks about Q1 sales trends."},
                "embedding": [0.1, 0.2, 0.3],
                "created_at": "2025-01-01T00:00:00Z"
            }
        }
