"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getDishes, getPlaces } from "@/lib/api";
import type { ApiDish, ApiPlace } from "@/types";

export function MobileSearch() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (overlayOpen) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  useEffect(() => {
    if (!query.trim()) { setDishes([]); setPlaces([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const [d, p] = await Promise.all([
          getDishes({ q: query, limit: 6 }),
          getPlaces({ q: query, limit: 4 }),
        ]);
        setDishes(d.items);
        setPlaces(p.items);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  function close() {
    setVisible(false);
    setTimeout(() => {
      setOverlayOpen(false);
      setQuery("");
      setDishes([]);
      setPlaces([]);
    }, 200);
  }

  function navigate(href: string) {
    close();
    router.push(href);
  }

  const hasResults = dishes.length > 0 || places.length > 0;

  const overlay = mounted ? createPortal(
    <div
      style={{ pointerEvents: overlayOpen ? "auto" : "none" }}
      className="fixed inset-0 z-[9999] lg:hidden"
    >
      {/* Full opaque background — fades in */}
      <div
        className="absolute inset-0 bg-surface"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease",
        }}
      />

      {/* Content — slides up slightly as it fades in */}
      <div
        className="relative flex flex-col h-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-outline-variant/20 bg-surface shrink-0">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 select-none">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dishes, places, areas…"
            className="flex-1 bg-transparent type-body-md text-on-surface placeholder:text-secondary/40 outline-none"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); setDishes([]); setPlaces([]); }}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high text-secondary"
            >
              <span className="material-symbols-outlined text-[18px] select-none">close</span>
            </button>
          ) : (
            <button
              onClick={close}
              className="shrink-0 text-secondary type-label-sm font-medium tracking-wide"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto">

          {/* Empty — no query */}
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <span
                className="material-symbols-outlined text-outline/30 select-none"
                style={{ fontSize: 48 }}
              >
                search
              </span>
              <p className="type-body-md text-secondary/40">Search dishes, places, areas</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="px-4 pt-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-surface-container-high rounded-full w-1/2" />
                    <div className="h-3 bg-surface-container-high rounded-full w-1/3 opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && !hasResults && (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <p className="type-body-md text-on-surface">No results for &ldquo;{query}&rdquo;</p>
              <p className="type-body-sm text-secondary/50">Try a dish name, place, or area</p>
            </div>
          )}

          {/* Dishes */}
          {!loading && dishes.length > 0 && (
            <div className="pt-4">
              <p className="px-4 pb-2 type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                Dishes
              </p>
              {dishes.map((dish) => (
                <button
                  key={dish.item_id}
                  onClick={() => navigate(`/dishes?q=${encodeURIComponent(query)}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-surface-container-low transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-primary select-none"
                      style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
                    >
                      restaurant
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="type-body-md text-on-surface font-medium truncate">{dish.item}</div>
                    {dish.place_name && (
                      <div className="type-body-sm text-secondary truncate">{dish.place_name}</div>
                    )}
                  </div>
                  {dish.item_rating != null && (
                    <span className="type-label-sm text-primary font-bold shrink-0 tabular-nums">
                      {dish.item_rating.toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Places */}
          {!loading && places.length > 0 && (
            <div className="pt-4 pb-8">
              <p className="px-4 pb-2 type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                Places
              </p>
              {places.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => navigate(`/places/${place.place_id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-surface-container-low transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                    <span
                      className="material-symbols-outlined text-secondary select-none"
                      style={{ fontSize: 18 }}
                    >
                      location_on
                    </span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="type-body-md text-on-surface font-medium truncate">{place.place_name}</div>
                    {place.location && (
                      <div className="type-body-sm text-secondary truncate">{place.location}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setOverlayOpen(true)}
        aria-label="Search"
        className="icon-btn lg:hidden text-secondary hover:text-primary hover:bg-surface-variant"
      >
        <span className="material-symbols-outlined text-[22px] select-none">search</span>
      </button>
      {overlay}
    </>
  );
}
