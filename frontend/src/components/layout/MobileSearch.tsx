"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getDishes, getPlaces } from "@/lib/api";
import type { ApiDish, ApiPlace } from "@/types";

export function MobileSearch() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [visible, setVisible] = useState(false);   // drives CSS transition
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Open: mount first, then trigger transition on next frame
  useEffect(() => {
    if (overlayOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setVisible(false);
    }
  }, [overlayOpen]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [overlayOpen]);

  useEffect(() => {
    if (!query.trim()) { setDishes([]); setPlaces([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const [d, p] = await Promise.all([
          getDishes({ q: query, limit: 5 }),
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

  function open() { setOverlayOpen(true); }

  function close() {
    setVisible(false);
    setTimeout(() => {
      setOverlayOpen(false);
      setQuery("");
      setDishes([]);
      setPlaces([]);
    }, 220);
  }

  function navigate(href: string) {
    close();
    router.push(href);
  }

  const overlay = mounted ? createPortal(
    <div
      aria-hidden={!overlayOpen}
      className="fixed inset-0 z-[9999] lg:hidden flex flex-col"
      style={{
        pointerEvents: overlayOpen ? "auto" : "none",
      }}
    >
      {/* Backdrop — semi-transparent, not full white */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--color-surface)",
          opacity: visible ? 0.97 : 0,
          transition: "opacity 220ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Page peek — bottom 15% fades to transparent so site bleeds through */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[18%] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--color-surface))",
          opacity: visible ? 1 : 0,
          transition: "opacity 220ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* Content panel — slides down from top */}
      <div
        className="relative flex flex-col"
        style={{
          maxHeight: "85vh",
          transform: visible ? "translateY(0)" : "translateY(-12px)",
          opacity: visible ? 1 : 0,
          transition: "transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 200ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Search bar — mirrors navbar height */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-outline-variant/20 shrink-0 bg-surface/95 backdrop-blur-sm">
          <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 select-none">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, places…"
            className="flex-1 bg-transparent type-body-md text-on-surface placeholder:text-secondary/50 outline-none"
          />
          <button
            onClick={close}
            aria-label="Close search"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-secondary hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px] select-none">close</span>
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 56px)" }}>

          {/* Loading skeletons */}
          {loading && (
            <div className="px-4 pt-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-surface-container-high rounded w-2/3" />
                    <div className="h-3 bg-surface-container-high rounded w-1/3 opacity-60" />
                  </div>
                  <div className="h-4 w-6 bg-surface-container-high rounded opacity-40" />
                </div>
              ))}
            </div>
          )}

          {!loading && !query.trim() && (
            <p className="text-center py-14 type-body-md text-secondary/40">
              Start typing to search
            </p>
          )}

          {!loading && query.trim() && dishes.length === 0 && places.length === 0 && (
            <p className="text-center py-14 type-body-md text-secondary">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {!loading && dishes.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                  Dishes
                </span>
              </div>
              {dishes.map((dish) => (
                <button
                  key={dish.item_id}
                  onClick={() => navigate(`/dishes?q=${encodeURIComponent(query)}`)}
                  className="w-full text-left px-4 py-3.5 border-b border-outline-variant/10 active:bg-surface-container-low transition-colors flex justify-between items-center gap-3"
                >
                  <div>
                    <div className="type-body-md text-on-surface font-medium">{dish.item}</div>
                    {dish.place_name && (
                      <div className="type-body-sm text-secondary mt-0.5">{dish.place_name}</div>
                    )}
                  </div>
                  {dish.item_rating != null && (
                    <span className="type-label-sm text-primary font-bold shrink-0 tabular-nums">
                      {dish.item_rating.toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          {!loading && places.length > 0 && (
            <>
              <div className="px-4 pt-5 pb-2">
                <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest">
                  Places
                </span>
              </div>
              {places.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => navigate(`/places/${place.place_id}`)}
                  className="w-full text-left px-4 py-3.5 border-b border-outline-variant/10 active:bg-surface-container-low transition-colors"
                >
                  <div className="type-body-md text-on-surface font-medium">{place.place_name}</div>
                  {place.location && (
                    <div className="type-body-sm text-secondary mt-0.5">{place.location}</div>
                  )}
                </button>
              ))}
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={open}
        aria-label="Search"
        className="icon-btn lg:hidden text-secondary hover:text-primary hover:bg-surface-variant"
      >
        <span className="material-symbols-outlined text-[22px] select-none">search</span>
      </button>
      {overlay}
    </>
  );
}
