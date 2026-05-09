from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.dish.routes import router as dish_router
from app.place.routes import router as place_router

app = FastAPI(title="MMDb API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dish_router, prefix="/api")
app.include_router(place_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
