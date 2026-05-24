from datetime import datetime

from pydantic import BaseModel


class BlogSummary(BaseModel):
    blog_id: int
    slug: str
    title: str
    subtitle: str | None
    author: str | None
    theme: str | None
    tags: list[str] | None
    status: str | None
    published_at: datetime | None

    model_config = {"from_attributes": True}


class BlogDetail(BlogSummary):
    body_md: str
