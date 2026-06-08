import Image from "next/image";
import Link from "next/link";
import { getDishes, getBlog } from "@/lib/api";

import type { ApiDish } from "@/types";
import { blogHeroUrl } from "@/types";

function DishCard({ dish }: { dish: ApiDish }) {
  return (
    <div className="group bg-surface-container-lowest card-border rounded-3xl overflow-hidden hover:-translate-y-2 dark:hover:translate-y-0 dark:hover:scale-[1.02] transition-all duration-500 cinematic-shadow flex flex-col cursor-pointer">

      {/* Image area — gradient placeholder (no images in DB) */}
      <div className="relative h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-highest group-hover:scale-110 transition-transform duration-700" />

        {/* Overlay: tag + score */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {dish.tags && (
            <span className="bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-lg text-[11px] font-bold text-on-surface-variant border border-outline-variant/10 uppercase tracking-wider">
              {dish.tags}
            </span>
          )}
          {dish.item_rating != null && (
            <div className="bg-primary px-3 py-1 rounded-lg flex items-center gap-1 shadow-md shadow-primary/20 ml-auto">
              <span
                className="material-symbols-outlined text-[14px] text-on-primary select-none"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                star
              </span>
              <span className="text-[12px] font-bold text-on-primary leading-none">
                {dish.item_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            className="text-on-surface group-hover:text-primary transition-colors mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {dish.item}
          </h3>
          {dish.place_name && (
            <p className="text-on-surface-variant flex items-center gap-2 type-body-md">
              <span className="material-symbols-outlined text-[18px] text-primary select-none">
                location_on
              </span>
              {dish.place_id != null ? (
                <Link
                  href={`/places/${dish.place_id}`}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {dish.place_name}
                </Link>
              ) : (
                dish.place_name
              )}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

export default async function LandingPage() {
  const [{ items: trendingDishes }, featuredBlog] = await Promise.all([
    getDishes({ limit: 3 }),
    getBlog("hyderabad-to-vijayawada-food-road-trip").catch(() => null),
  ]);

  const heroImage = featuredBlog
    ? blogHeroUrl(1)
    : "https://lh3.googleusercontent.com/aida-public/AB6AXuB09kl4TS7hevPeMWCf3nqt_H3nmnGWSrYzjCUWYocI27K73Jphv2LTz5H9OBuvMzbNa5hqEHiPtmtTsIDIOQMj1IoPP1_ginuP-J-5HHujFOWmZ0GgYKiLpdrsAuZ3WpD-JWHcabS4X2ujJC-IQ8270MmCiEFtDGdIuXBXSBTAnNFTfUEQhbDnFRHQnDDCraqV-AWIk5TzHzsY9OIEGyq8jnniRvzYiOo3OkZM2KvsK18yWNga8Nws_Con5J8hfS-McT2upl37R6s";
  const heroAlt = featuredBlog ? featuredBlog.title : "Seared sea bass on pea purée with edible flowers";

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-stack-lg py-12">

      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] w-full rounded-[32px] overflow-hidden group cinematic-shadow">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/40 via-transparent to-transparent z-10" />
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-1000"
          priority
        />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 max-w-2xl space-y-6">
          <span className="inline-block bg-primary text-on-primary text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
            {featuredBlog ? "Featured Guide" : "Editor’s Choice"}
          </span>
          <h1
            className="text-on-surface leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            {featuredBlog ? featuredBlog.title : "The Art of the Modern Omakase"}
          </h1>
          <p className="type-body-lg text-on-surface-variant opacity-90 max-w-lg">
            {featuredBlog?.subtitle ?? "Discover the hidden temples of Kyoto where tradition meets avant-garde technique in a symphony of seasonal purity."}
          </p>
          <Link
            href={featuredBlog ? `/guides/${featuredBlog.slug}` : "/guides"}
            className="inline-block bg-primary hover:bg-primary/90 text-on-primary font-bold px-10 py-4 rounded-xl transition-all active:scale-95 shadow-xl shadow-primary/20"
          >
            {featuredBlog ? "Read Guide" : "Read the Treatise"}
          </Link>
        </div>
      </section>

      {/* Trending Reviews */}
      <section className="space-y-gutter">
        <div className="flex justify-between items-end border-b border-outline-variant/10 pb-6">
          <div className="space-y-2">
            <h2 className="type-headline-lg text-on-surface">Trending Reviews</h2>
            <p className="type-body-md text-secondary">
              The latest critiques from our resident mavens.
            </p>
          </div>
          <Link
            href="/dishes"
            className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all type-body-md"
          >
            View All
            <span className="material-symbols-outlined text-[20px] select-none">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {trendingDishes.map((dish) => (
            <DishCard key={dish.item_id} dish={dish} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-container-low card-border rounded-[40px] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 cinematic-shadow">
        <div className="space-y-6 max-w-xl text-center md:text-left">
          <h2 className="type-headline-lg text-on-surface">Not sure what to order?</h2>
          <p className="type-body-lg text-secondary leading-relaxed">
            Ask MMDb — our AI concierge curates dish and restaurant
            recommendations from the full database, tailored to your palate.
          </p>
        </div>
        <Link
          href="/ask"
          className="shrink-0 flex items-center gap-4 bg-primary text-on-primary font-bold px-12 py-5 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 group"
        >
          <span
            className="material-symbols-outlined text-[28px] select-none group-hover:rotate-12 transition-transform"
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
