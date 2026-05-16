from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.pipeline import run_pipeline
from app.agent.schemas import ChatRequest, ChatResponse
from app.core.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    reply = await run_pipeline(messages, db, request.lat, request.lng)
    return ChatResponse(reply=reply)
