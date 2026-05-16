import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agent.routes import router as chat_router
from app.core.config import settings
from app.item.routes import router as item_router
from app.place.routes import router as place_router
from app.tasks.embed import run_embedding_job

logging.basicConfig(level=logging.INFO)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run every Sunday at 2am — embeds only the delta, skips unchanged content
    scheduler.add_job(
        run_embedding_job,
        CronTrigger(day_of_week="sun", hour=2, minute=0),
        id="weekly_embeddings",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="MMDb API", version="0.1.0", lifespan=lifespan)

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
