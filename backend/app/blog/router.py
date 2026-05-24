from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.blog.models import Blog
from app.blog.schemas import BlogDetail, BlogSummary
from app.core.database import get_db

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("", response_model=list[BlogSummary])
async def list_blogs(
    theme: str | None = Query(None),
    tag: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    base = select(Blog).where(Blog.status == "published")

    if theme:
        base = base.where(Blog.theme == theme)
    if tag:
        base = base.where(Blog.tags.contains([tag]))

    base = base.order_by(Blog.published_at.desc()).offset(offset).limit(limit)
    result = await db.execute(base)
    return result.scalars().all()


@router.get("/{slug}", response_model=BlogDetail)
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Blog).where(Blog.slug == slug, Blog.status == "published")
    )
    blog = result.scalar_one_or_none()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog
