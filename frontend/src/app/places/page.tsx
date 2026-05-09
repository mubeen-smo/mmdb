import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { restaurants } from "@/lib/data";
import type { Restaurant } from "@/types";

export const metadata: Metadata = { title: "Places" };

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-tertiary-fixed rounded-full w-24">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${value * 10}%` }}
        />
      </div>
      <span className="type-label-sm font-bold text-xs">{value.toFixed(1)}</span>
    </div>
  );
}

function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  return (
    <article className="group bg-surface-container-low rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(147,0,30,0.08)] transition-all duration-300 border border-transparent hover:border-outline-variant flex flex-col md:flex-row md:h-64">
      <div className="w-full md:w-80 h-48 md:h-full shrink-0 overflow-hidden relative">
        <Image
          src={restaurant.image}
          alt={restaurant.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <span className="type-label-sm text-[10px] text-primary uppercase tracking-widest block mb-1">
              {restaurant.cuisine}
            </span>
            <Link href={`/restaurants/${restaurant.slug}`}>
              <h2 className="type-headline-md text-on-background hover:text-primary transition-colors">
                {restaurant.name}
              </h2>
            </Link>
            <p className="type-body-md text-secondary text-sm">
              {restaurant.location}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 flex items-center gap-1 shrink-0">
            <span className="font-display text-xl font-bold text-primary">
              {restaurant.score}
            </span>
            <span
              className="material-symbols-outlined text-primary text-[16px] select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        </div>

        <p className="type-body-md text-on-surface-variant my-4 line-clamp-2 md:line-clamp-3">
          {restaurant.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-8">
          <div className="flex flex-col min-w-[120px]">
            <span className="type-label-sm text-[10px] text-secondary uppercase mb-1">
              Ambience
            </span>
            <ScoreBar value={restaurant.ambienceScore} />
          </div>
          <div className="flex flex-col min-w-[120px]">
            <span className="type-label-sm text-[10px] text-secondary uppercase mb-1">
              Service
            </span>
            <ScoreBar value={restaurant.serviceScore} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PlacesPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg">

      {/* Hero */}
      <section className="pt-stack-lg pb-stack-md">
        <div className="max-w-3xl">
          <h1 className="type-display-xl text-on-background mb-4">
            The Maven&apos;s Places
          </h1>
          <p className="type-body-lg text-secondary max-w-2xl leading-relaxed">
            Our editors traverse the globe to identify dining establishments
            that transcend mere sustenance. Each entry represents an apex of
            technique, hospitality, and atmosphere.
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
            placeholder="Search the directory of culinary excellence…"
            className="bg-surface-container-low border-2 border-surface-variant rounded-xl pl-12 pr-4 py-4 type-body-md w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </section>

      {/* Restaurant list */}
      <section className="flex flex-col gap-6">
        {restaurants.map((r) => (
          <RestaurantRow key={r.id} restaurant={r} />
        ))}
      </section>

    </div>
  );
}
