from fastapi import APIRouter, Depends
from src.services.session_service import session_manager
from typing import List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/apprepo")
async def get_app_repo():
    return {"message": "Get AppRepo"}

@router.get("/sessions/analytics")
async def get_session_analytics():
    sessions = session_manager.collection.find({})
    total_sessions = 0
    total_queries = 0
    total_tokens_used = 0
    session_durations = []
    query_counts = []

    for session_data in sessions:
        session = session_manager.get_session(session_data["session_id"])
        if session:
            total_sessions += 1
            total_queries += session.query_count
            total_tokens_used += session.total_tokens
            query_counts.append(session.query_count)

            if session.created_at and session.last_query_at:
                duration = (session.last_query_at - session.created_at).total_seconds()
                session_durations.append(duration)

    avg_queries_per_session = total_queries / total_sessions if total_sessions > 0 else 0
    avg_session_duration = sum(session_durations) / len(session_durations) if session_durations else 0

    return {
        "total_sessions": total_sessions,
        "total_queries": total_queries,
        "total_tokens_used": total_tokens_used,
        "average_queries_per_session": avg_queries_per_session,
        "average_session_duration_seconds": avg_session_duration,
        "max_queries_in_session": max(query_counts) if query_counts else 0,
        "min_queries_in_session": min(query_counts) if query_counts else 0,
    }

@router.post("/apprepo")
async def create_app_repo():
    return {"message": "Create AppRepo"}

@router.get("/ltm")
async def get_ltm():
    return {"message": "Get LTM"}

@router.post("/ltm")
async def create_ltm():
    return {"message": "Create LTM"}
