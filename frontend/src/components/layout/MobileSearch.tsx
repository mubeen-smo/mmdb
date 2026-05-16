"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getDishes, getPlaces } from "@/lib/api";
import type { ApiDish, ApiPlace } from "@/types";

export function MobileSearch() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (overlayOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [overlayOpen]);

  useEffect(() => {
    if (!query.trim()) { setDishes([]); setPlaces([]); return; }
    const t = setTimeout(async () => {
      const [d, p] = await Promise.all([
        getDishes({ q: query, limit: 5 }),
        getPlaces({ q: query, limit: 4 }),
      ]);
      setDishes(d.items);
      setPlaces(p.items);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function close() { setOverlayOpen(false); setQuery(""); setDishes([]); setPlaces([]); }

  function navigate(href: string) { close(); router.push(href); }

  return (
    <>
      <button
        onClick={() => setOverlayOpen(true)}
        aria-label="Search"
        className="icon-btn lg:hidden text-secondary hover:text-primary hover:bg-surface-variant"
      >
        <span className="material-symbols-outlined text-[22px] select-none">search</span>
      </button>

      {overlayOpen && (
        <div className="fixed inset-0 z-[60] bg-surface-container-lowest flex flex-col lg:hidden">
          {/* Search bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/30 shrink-0">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 select-none">
              search
            </span>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent type-body-md text-on-surface placeholder:text-secondary/60 outline-none"
            />
            <button onClick={close} className="shrink-0 text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px] select-none">close</span>
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto bg-surface-container-lowest">
            {dishes.length > 0 && (
              <>
                <div className="px-4 py-2 bg-surface-container-low sticky top-0">
                  <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">Dishes</span>
                </div>
                {dishes.map((dish) => (
                  <button
                    key={dish.item_id}
                    onClick={() => navigate("/dishes")}
                    className="w-full text-left px-4 py-4 border-b border-outline-variant/10 bg-surface-container-lowest active:bg-surface-container-low transition-colors flex justify-between items-start gap-3"
                  >
                    <div>
                      <div className="type-body-md text-on-surface font-medium">{dish.item}</div>
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
              </>
            )}

            {places.length > 0 && (
              <>
                <div className="px-4 py-2 bg-surface-container-low sticky top-0">
                  <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">Places</span>
                </div>
                {places.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => navigate(`/places/${place.place_id}`)}
                    className="w-full text-left px-4 py-4 border-b border-outline-variant/10 bg-surface-container-lowest active:bg-surface-container-low transition-colors"
                  >
                    <div className="type-body-md text-on-surface font-medium">{place.place_name}</div>
                    {place.location && (
                      <div className="type-body-md text-secondary text-sm">{place.location}</div>
                    )}
                  </button>
                ))}
              </>
            )}

            {query.trim() && dishes.length === 0 && places.length === 0 && (
              <p className="text-center py-16 type-body-md text-secondary">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
