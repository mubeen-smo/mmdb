"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDishes, getPlaces } from "@/lib/api";
import type { ApiDish, ApiPlace } from "@/types";

export function NavSearch() {
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setOpen(false); return; }

    const timer = setTimeout(async () => {
      const [d, p] = await Promise.all([
        getDishes({ q: query, limit: 5 }),
        getPlaces({ q: query, limit: 4 }),
      ]);
      setDishes(d.items);
      setPlaces(p.items);
      setOpen(d.items.length > 0 || p.items.length > 0);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={ref} className="relative w-full">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] select-none pointer-events-none">
        search
      </span>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="Search dishes, places…"
        className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 type-body-md text-on-surface placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto">

          {dishes.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-surface-container-low sticky top-0">
                <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                  Dishes
                </span>
              </div>
              {dishes.map((dish) => (
                <button
                  key={dish.item_id}
                  onClick={() => navigate(`/dishes`)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0 flex justify-between items-start gap-3"
                >
                  <div>
                    <div className="type-body-md text-on-surface font-medium leading-snug">
                      {dish.item}
                    </div>
                    {dish.place_name && (
                      <div className="type-body-md text-secondary text-sm">{dish.place_name}</div>
                    )}
                  </div>
                  {dish.item_rating != null && (
                    <span className="type-label-sm text-primary font-bold shrink-0">
                      {dish.item_rating.toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {places.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-surface-container-low sticky top-0">
                <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                  Places
                </span>
              </div>
              {places.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => navigate(`/places/${place.place_id}`)}
                  className="w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
                >
                  <div className="type-body-md text-on-surface font-medium leading-snug">
                    {place.place_name}
                  </div>
                  {place.location && (
                    <div className="type-body-md text-secondary text-sm">{place.location}</div>
                  )}
                </button>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
