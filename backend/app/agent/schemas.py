from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    lat: float | None = None
    lng: float | None = None


class ChatResponse(BaseModel):
    reply: str
