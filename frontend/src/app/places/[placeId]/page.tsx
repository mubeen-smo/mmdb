import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlace } from "@/lib/api";
import type { ApiDish } from "@/types";

type Props = { params: Promise<{ placeId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { placeId } = await params;
  try {
    const place = await getPlace(Number(placeId));
    return { title: place.place_name };
  } catch {
    return {};
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl">
      <span className="type-label-sm text-[10px] text-secondary uppercase tracking-widest block mb-3">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="h-2 bg-surface-container-highest rounded-full flex-1">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${value * 10}%` }}
          />
        </div>
        <span className="type-label-sm font-bold text-xs w-6 shrink-0">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function DishRow({ dish }: { dish: ApiDish }) {
  return (
    <article className="flex justify-between items-start py-5 border-b border-outline-variant/20 last:border-0">
      <div className="flex-grow pr-4">
        <h3
          className="text-on-surface"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)",
            lineHeight: 1.2,
          }}
        >
          {dish.item}
        </h3>
        {dish.description && (
          <p className="type-body-md text-on-surface-variant mt-1 text-sm line-clamp-2">
            {dish.description}
          </p>
        )}
        {dish.tags && (
          <span className="inline-block mt-2 px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full type-label-sm text-[11px] uppercase tracking-wider">
            {dish.tags}
          </span>
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
    </article>
  );
}

export default async function PlaceDetailPage({ params }: Props) {
  const { placeId } = await params;

  let place;
  try {
    place = await getPlace(Number(placeId));
  } catch {
    notFound();
  }

  const ambience = place.ambience_rating != null ? Number(place.ambience_rating) : null;
  const service = place.service_rating != null ? Number(place.service_rating) : null;

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg">

      {/* Back navigation */}
      <div className="pt-stack-md pb-8">
        <Link
          href="/places"
          className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors type-body-md"
        >
          <span className="material-symbols-outlined text-[18px] select-none">arrow_back</span>
          All Places
        </Link>
      </div>

      {/* Header */}
      <section className="mb-stack-lg">
        {place.type && (
          <span className="type-label-sm text-primary font-bold tracking-widest uppercase block mb-2">
            {place.type}
          </span>
        )}
        <h1 className="type-display-xl text-on-background mb-3">{place.place_name}</h1>
        {place.location && (
          <p className="type-body-lg text-secondary mb-4">{place.location}</p>
        )}
        {place.description && (
          <p className="type-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            {place.description}
          </p>
        )}
        {place.open_time && (
          <p className="type-body-md text-secondary mt-3">
            <span className="font-semibold">Hours:</span> {place.open_time}
          </p>
        )}
      </section>

      {/* Scores */}
      {(ambience != null || service != null) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
          {ambience != null && <ScoreBar label="Ambience" value={ambience} />}
          {service != null && <ScoreBar label="Service" value={service} />}
        </section>
      )}

      {/* Dishes */}
      {place.dishes.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-stack-md">
            <div className="h-px flex-1 bg-surface-container-highest" />
            <h2 className="type-label-sm text-primary uppercase tracking-[0.2em]">
              Dishes Tried Here
            </h2>
            <div className="h-px flex-1 bg-surface-container-highest" />
          </div>
          <div>
            {place.dishes.map((dish) => (
              <DishRow key={dish.item_id} dish={dish} />
            ))}
          </div>
        </section>
      )}

      {place.dishes.length === 0 && (
        <p className="type-body-lg text-secondary text-center py-stack-lg">
          No dishes logged for this place yet.
        </p>
      )}

    </div>
  );
}
