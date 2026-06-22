"""
One-time script: create HNSW cosine indexes on the embeddings table.
Run once: python -m scripts.create_vector_index
"""
import asyncio
import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = os.environ["DATABASE_URL"]

async def main():
    engine = create_async_engine(
        DATABASE_URL,
        connect_args={"ssl": "require", "statement_cache_size": 0},
    )
    async with engine.begin() as conn:
        print("Creating HNSW index on embeddings.embedding ...")
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS embeddings_embedding_hnsw
            ON embeddings
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64)
        """))
        print("Done.")

        print("Running EXPLAIN ANALYZE to verify index use ...")
        # Use a zero-vector to probe — actual shape doesn't matter for plan
        dim_row = await conn.execute(text("SELECT vector_dims(embedding) FROM embeddings LIMIT 1"))
        dim = dim_row.scalar()
        if dim:
            zero_vec = "[" + ",".join(["0"] * dim) + "]"
            plan = await conn.execute(text(f"""
                EXPLAIN ANALYZE
                SELECT source_id FROM embeddings
                WHERE source_type = 'place'
                ORDER BY embedding <=> '{zero_vec}'::vector
                LIMIT 10
            """))
            for row in plan:
                print(row[0])

asyncio.run(main())
