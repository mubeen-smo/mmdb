"""
Request/response shapes for the POST /api/chat endpoint.

The frontend sends the full conversation history each time (stateless backend).
The backend runs the agent loop and returns a single reply string.
"""

from pydantic import BaseModel


class Message(BaseModel):
    # "user" for human turns, "assistant" for previous bot turns
    role: str
    content: str


class ChatRequest(BaseModel):
    # Full conversation history — frontend owns the state and sends it every request
    messages: list[Message]


class ChatResponse(BaseModel):
    reply: str
