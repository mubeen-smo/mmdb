"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlaces } from "@/lib/api";
import type { ApiPlace } from "@/types";

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-tertiary-fixed rounded-full w-24">
        <div className="h-full bg-primary rounded-full" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="type-label-sm font-bold text-xs">{value.toFixed(1)}</span>
    </div>
  );
}

function PlaceRow({ place }: { place: ApiPlace }) {
  const ambience = place.ambience_rating != null ? Number(place.ambience_rating) : null;
  const service = place.service_rating != null ? Number(place.service_rating) : null;
  const avgScore =
    ambience != null && service != null
      ? ((ambience + service) / 2).toFixed(1)
      : ambience?.toFixed(1) ?? null;

  return (
    <article className="group bg-surface-container-low rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(147,0,30,0.08)] transition-all duration-300 border border-transparent hover:border-outline-variant p-6">
      <div className="flex justify-between items-start mb-3">
        <div>
          {place.type && (
            <span className="type-label-sm text-[10px] text-primary uppercase tracking-widest block mb-1">
              {place.type}
            </span>
          )}
          <Link href={`/places/${place.place_id}`}>
            <h2 className="type-headline-md text-on-background hover:text-primary transition-colors">
              {place.place_name}
            </h2>
          </Link>
          {place.location && (
            <p className="type-body-md text-secondary text-sm mt-0.5">{place.location}</p>
          )}
        </div>
        {avgScore && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 flex items-center gap-1 shrink-0">
            <span className="font-display text-xl font-bold text-primary">{avgScore}</span>
            <span
              className="material-symbols-outlined text-primary text-[16px] select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        )}
      </div>
      {place.description && (
        <p className="type-body-md text-on-surface-variant my-3 line-clamp-2">
          {place.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-8">
        {ambience != null && (
          <div className="flex flex-col min-w-[120px]">
            <span className="type-label-sm text-[10px] text-secondary uppercase mb-1">Ambience</span>
            <ScoreBar value={ambience} />
          </div>
        )}
        {service != null && (
          <div className="flex flex-col min-w-[120px]">
            <span className="type-label-sm text-[10px] text-secondary uppercase mb-1">Service</span>
            <ScoreBar value={service} />
          </div>
        )}
      </div>
    </article>
  );
}

export function PlaceSearch() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<ApiPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { items, total } = await getPlaces(query ? { q: query } : undefined);
        if (alive) { setPlaces(items); setTotal(total); }
      } finally {
        if (alive) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => { alive = false; clearTimeout(timer); };
  }, [query]);

  return (
    <>
      {/* Hero */}
      <section className="pt-stack-lg pb-stack-md">
        <div className="max-w-3xl">
          <h1 className="type-display-xl text-on-background mb-4">The Maven&apos;s Places</h1>
          <p className="type-body-lg text-secondary max-w-2xl leading-relaxed">
            Every place we have eaten at, ranked and reviewed.{" "}
            {!loading && <span>{total} entries in the directory.</span>}
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="mb-stack-lg">
        <div className="relative max-w-xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[24px] select-none pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, tag…"
            className="bg-surface-container-low border-2 border-surface-variant rounded-xl pl-12 pr-4 py-4 type-body-md w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <section className="flex flex-col gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface-container-low h-32 animate-pulse" />
          ))}
        </section>
      ) : places.length === 0 ? (
        <p className="type-body-lg text-secondary py-stack-lg text-center">
          No places found{query ? ` for "${query}"` : ""}.
        </p>
      ) : (
        <section className="flex flex-col gap-6">
          {places.map((place) => (
            <PlaceRow key={place.place_id} place={place} />
          ))}
        </section>
      )}
    </>
  );
}
