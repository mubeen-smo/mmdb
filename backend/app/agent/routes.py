from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.loop import run_agent
from app.agent.schemas import ChatRequest, ChatResponse
from app.core.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    msgs = [{"role": m.role, "content": m.content} for m in request.messages]
    reply = await run_agent(msgs, db)
    return ChatResponse(reply=reply)
