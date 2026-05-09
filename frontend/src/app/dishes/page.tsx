import type { Metadata } from "next";
import Image from "next/image";
import { dishes } from "@/lib/data";
import type { Dish } from "@/types";

export const metadata: Metadata = { title: "Dishes" };

function DishCard({ dish }: { dish: Dish }) {
  return (
    <article className="group bg-surface-container-lowest rounded-2xl p-6 flex flex-col md:flex-row gap-6 border border-outline-variant/20 transition-all duration-300 hover:shadow-[0_20px_25px_-5px_rgba(147,0,30,0.1),0_8px_10px_-6px_rgba(147,0,30,0.1)] cursor-pointer">

      {/* Left: info */}
      <div className="flex-grow flex flex-col justify-between">
        {/* Top: name + score */}
        <div className="flex justify-between items-start mb-4">
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
              {dish.name}
            </h3>
            <p className="type-body-md text-secondary italic">{dish.restaurant}</p>
          </div>
          {/* Score badge */}
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg shrink-0">
            <span
              className="text-primary font-extrabold text-xl leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {dish.score.toFixed(1)}
            </span>
            <span
              className="material-symbols-outlined text-primary text-sm select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        </div>

        {/* Bottom: tags */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full type-label-sm text-[11px] uppercase tracking-wider">
            {dish.cuisine}
          </span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full type-label-sm text-[11px] uppercase tracking-wider">
            {dish.priceRange}
          </span>
        </div>
      </div>

      {/* Right: image */}
      {dish.image && (
        <div className="md:w-48 md:h-48 aspect-square flex-shrink-0 overflow-hidden rounded-xl bg-surface-container relative">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </article>
  );
}

export default function DishesPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">

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
              placeholder="Search for a dish, cuisine, or restaurant…"
              className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary transition-all type-body-md shadow-sm outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="type-label-sm text-secondary uppercase tracking-wider mr-2">Filters:</span>
          <button className="px-4 py-2 rounded-full bg-primary text-on-primary type-label-sm flex items-center gap-2">
            Cuisine
            <span className="material-symbols-outlined text-sm select-none">keyboard_arrow_down</span>
          </button>
          {["Price", "Rating", "Dietary"].map((f) => (
            <button
              key={f}
              className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant type-label-sm flex items-center gap-2 hover:bg-surface-variant"
            >
              {f}
              <span className="material-symbols-outlined text-sm select-none">keyboard_arrow_down</span>
            </button>
          ))}
          <div className="h-6 w-px bg-outline-variant mx-2" />
          <button className="text-primary type-label-sm hover:underline">Clear all</button>
        </div>
      </section>

      {/* Dish cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {dishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} />
        ))}
      </div>

      {/* Load more */}
      <div className="mt-stack-lg flex justify-center">
        <button className="px-12 py-4 bg-primary text-on-primary rounded-full type-label-sm uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 shadow-md">
          Load More Discoveries
        </button>
      </div>

    </div>
  );
}
