"use client";

import { useState, useEffect } from "react";
import { getDishes } from "@/lib/api";
import type { ApiDish } from "@/types";

function DishCard({ dish }: { dish: ApiDish }) {
  return (
    <article className="group bg-surface-container-lowest rounded-2xl p-6 flex flex-col gap-4 border border-outline-variant/20 transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(147,0,30,0.1),0_8px_10px_-6px_rgba(147,0,30,0.1)] cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-4">
          <h3
            className="text-on-surface group-hover:text-primary transition-colors mb-1"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
            }}
          >
            {dish.item}
          </h3>
          {dish.place_name && (
            <p className="type-body-md text-secondary italic">{dish.place_name}</p>
          )}
        </div>
        {dish.item_rating != null && (
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
            <span
              className="text-primary font-extrabold text-xl leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {dish.item_rating.toFixed(1)}
            </span>
            <span
              className="material-symbols-outlined text-primary text-sm select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        )}
      </div>
      {dish.description && (
        <p className="type-body-md text-on-surface-variant text-sm line-clamp-2">
          {dish.description}
        </p>
      )}
      {dish.tags && (
        <div>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full type-label-sm text-[11px] uppercase tracking-wider">
            {dish.tags}
          </span>
        </div>
      )}
    </article>
  );
}

export function DishSearch() {
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { items, total } = await getDishes(query ? { q: query, limit: 50 } : { limit: 50 });
        if (alive) { setDishes(items); setTotal(total); }
      } finally {
        if (alive) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => { alive = false; clearTimeout(timer); };
  }, [query]);

  return (
    <>
      {/* Search & Filters */}
      <section className="mb-stack-lg space-y-stack-md">
        <div className="max-w-2xl">
          <h1 className="type-headline-lg mb-4">Discover Extraordinary Dishes</h1>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline select-none pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by dish, place, tag…"
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary transition-all type-body-md shadow-sm outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="type-label-sm text-secondary uppercase tracking-wider mr-2">Filters:</span>
          {["All", "Veg", "Non-veg"].map((f, i) => (
            <button
              key={f}
              className={`px-4 py-2 rounded-full type-label-sm ${
                i === 0
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="h-6 w-px bg-outline-variant mx-2" />
          <span className="type-label-sm text-secondary">
            {loading ? "…" : `${total} dishes`}
          </span>
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-container-low h-40 animate-pulse" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <p className="type-body-lg text-secondary py-stack-lg text-center">
          No dishes found{query ? ` for "${query}"` : ""}.
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {dishes.map((dish) => (
            <DishCard key={dish.item_id} dish={dish} />
          ))}
        </div>
      )}
    </>
  );
}
