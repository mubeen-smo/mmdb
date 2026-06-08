"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { getDishes, getPlaces } from "@/lib/api";
import type { ApiDish, ApiPlace } from "@/types";

export function MobileSearch() {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [dishes, setDishes] = useState<ApiDish[]>([]);
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Portal needs document — only available client-side
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (overlayOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [overlayOpen]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = overlayOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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

  function close() {
    setOverlayOpen(false);
    setQuery("");
    setDishes([]);
    setPlaces([]);
  }

  function navigate(href: string) {
    close();
    router.push(href);
  }

  const overlay = overlayOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999] bg-surface flex flex-col lg:hidden">
      {/* Header row — mirrors navbar height */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-outline-variant/20 shrink-0 bg-surface">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 select-none">
          search
        </span>
        <input
          ref={inputRef}
          type="search"
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
      <div className="flex-1 overflow-y-auto">
        {dishes.length === 0 && places.length === 0 && query.trim() && (
          <p className="text-center py-16 type-body-md text-secondary">
            No results for &ldquo;{query}&rdquo;
          </p>
        )}

        {!query.trim() && (
          <p className="text-center py-16 type-body-md text-secondary/50">
            Start typing to search
          </p>
        )}

        {dishes.length > 0 && (
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

        {places.length > 0 && (
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
                  <div className="type-body-sm text-secondary 