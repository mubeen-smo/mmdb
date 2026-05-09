import Image from "next/image";
import Link from "next/link";
import { getDishes } from "@/lib/api";
import type { ApiDish } from "@/types";

function DishCard({ dish }: { dish: ApiDish }) {
  return (
    <div className="group cursor-pointer bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_rgba(147,0,30,0.06)] hover:-translate-y-2 p-6">
      <div className="flex justify-between items-start mb-3">
        {dish.tags ? (
          <span className="type-label-sm text-primary uppercase tracking-wider">
            {dish.tags}
          </span>
        ) : (
          <span />
        )}
        {dish.item_rating != null && (
          <div className="flex items-center gap-1 px-2 py-1 bg-surface-bright rounded-full">
            <span
              className="material-symbols-outlined text-primary text-[14px] select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="type-label-sm text-on-surface">
              {dish.item_rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <h3 className="type-headline-md text-on-surface group-hover:text-primary transition-colors">
        {dish.item}
      </h3>
      {dish.place_name && (
        <p className="type-body-md text-secondary mt-1">{dish.place_name}</p>
      )}
      {dish.description && (
        <p className="type-body-md text-on-surface-variant mt-2 line-clamp-2 text-sm">
          {dish.description}
        </p>
      )}
    </div>
  );
}

export default async function LandingPage() {
  const { items: trendingDishes } = await getDishes({ limit: 3 });

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg">

      {/* Hero */}
      <section className="py-stack-lg">
        <div className="relative overflow-hidden rounded-xl bg-surface-container h-[420px] md:h-[500px] flex items-center">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB09kl4TS7hevPeMWCf3nqt_H3nmnGWSrYzjCUWYocI27K73Jphv2LTz5H9OBuvMzbNa5hqEHiPtmtTsIDIOQMj1IoPP1_ginuP-J-5HHujFOWmZ0GgYKiLpdrsAuZ3WpD-JWHcabS4X2ujJC-IQ8270MmCiEFtDGdIuXBXSBTAnNFTfUEQhbDnFRHQnDDCraqV-AWIk5TzHzsY9OIEGyq8jnniRvzYiOo3OkZM2KvsK18yWNga8Nws_Con5J8hfS-McT2upl37R6s"
            alt="Seared sea bass on pea purée with edible flowers"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-on-surface/60 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 max-w-2xl text-surface-bright">
            <span className="inline-block px-3 py-1 bg-primary text-on-primary type-label-sm rounded-full mb-4 uppercase tracking-widest">
              Editor&apos;s Choice
            </span>
            <h1 className="type-display-xl mb-6">
              The Art of the Modern Omakase
            </h1>
            <p className="type-body-lg opacity-90 mb-8">
              Discover the hidden temples of Kyoto where tradition meets
              avant-garde technique in a symphony of seasonal purity.
            </p>
            <Link
              href="/guides"
              className="inline-block bg-primary hover:bg-primary/90 text-on-primary type-body-md px-8 py-3 rounded-lg transition-all hover:-translate-y-1"
            >
              Read the Treatise
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Reviews */}
      <section className="py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="type-headline-lg text-on-surface">
              Trending Reviews
            </h2>
            <p className="type-body-md text-secondary">
              The latest critiques from our resident mavens.
            </p>
          </div>
          <Link
            href="/dishes"
            className="text-primary type-body-md hover:underline font-semibold flex items-center gap-1"
          >
            View All
            <span className="material-symbols-outlined text-[18px] select-none">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingDishes.map((dish) => (
            <DishCard key={dish.item_id} dish={dish} />
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mt-stack-lg rounded-xl bg-surface-container-low border border-outline-variant/30 px-8 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="type-headline-md text-on-surface mb-2">
            Not sure what to order?
          </h2>
          <p className="type-body-md text-secondary max-w-sm">
            Ask MMDb — our AI concierge curates dish and restaurant
            recommendations from the full database, tailored to your palate.
          </p>
        </div>
        <Link
          href="/ask"
          className="shrink-0 flex items-center gap-3 bg-primary text-on-primary rounded-full px-6 h-14 type-body-md font-semibold hover:bg-primary/90 transition-all hover:shadow-lg active:scale-95"
        >
          <span
            className="material-symbols-outlined text-[20px] select-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          Ask MMDb
        </Link>
      </section>

    </div>
  );
}
