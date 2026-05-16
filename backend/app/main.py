import logging

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agent.routes import router as chat_router
from app.core.config import settings
from app.item.routes import router as item_router
from app.place.routes import router as place_router

app = FastAPI(title="MMDb API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(item_router, prefix="/api")
app.include_router(place_router, prefix="/api")
app.include_router(chat_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
