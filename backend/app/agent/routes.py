import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.pipeline import run_pipeline
from app.agent.schemas import ChatRequest, ChatResponse
from app.core.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    messages = [{"role": m.role, "content": m.content} for m in request.messages]

    # Generate a new conversation_id on first turn; reuse the client's on subsequent turns
    conversation_id = request.conversation_id or str(uuid.uuid4())

    reply, conversation_id = await run_pipeline(
        messages,
        db,
        request.lat,
        request.lng,
        conversation_id=conversation_id,
    )
    return ChatResponse(reply=reply, conversation_id=conversation_id)
