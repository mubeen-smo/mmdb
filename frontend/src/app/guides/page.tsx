import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { restaurants, articles } from "@/lib/data";
import type { Article } from "@/types";

export const metadata: Metadata = { title: "Guides" };

const badgeClasses: Record<string, string> = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary",
};

function StarRow({ score }: { score: number }) {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-primary text-sm select-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
      {half && (
        <span
          className="material-symbols-outlined text-primary text-sm select-none"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star_half
        </span>
      )}
      <span className="ml-2 type-label-sm text-secondary">
        {score.toFixed(1)} Maven Score
      </span>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline/10 shadow-sm flex flex-col h-full transition-all hover:shadow-md cursor-pointer">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full type-label-sm uppercase tracking-wider font-bold ${
            badgeClasses[article.badgeVariant] ?? badgeClasses.primary
          }`}
        >
          {article.badge}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <StarRow score={article.mavenScore} />
        <h2 className="type-headline-md mt-3 mb-3 text-on-surface group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        <p className="type-body-md text-secondary mb-6 line-clamp-3 italic">
          &ldquo;{article.excerpt}&rdquo;
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-outline/10 pt-6">
          <span className="type-label-sm text-outline">
            {article.readTimeMinutes} min read · {article.topic}
          </span>
          <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform select-none">
            arrow_forward
          </span>
        </div>
      </div>
    </article>
  );
}

export default function GuidesPage() {
  const featured = restaurants.find((r) => r.featured);
  const rest = restaurants.filter((r) => !r.featured);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">

      {/* Hero */}
      <section className="mb-stack-lg">
        <h1 className="type-display-xl text-primary mb-2">Culinary Guides</h1>
        <p className="type-body-lg text-secondary max-w-2xl">
          Discover our strictly vetted editorial guides and in-depth reviews of
          exceptional dining establishments, where atmosphere meets unparalleled
          technical execution.
        </p>
      </section>

      {/* Bento restaurant grid */}
      {featured && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-stack-lg">

          {/* Hero card */}
          <div className="md:col-span-8 group cursor-pointer">
            <Link
              href={`/restaurants/${featured.slug}`}
              className="block bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(147,0,30,0.06)] hover:-translate-y-1"
            >
              <div className="aspect-[16/9] w-full relative">
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <span
                    className="material-symbols-outlined text-white text-[16px] select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span className="text-white font-bold type-label-sm">
                    {featured.score}
                  </span>
                </div>
              </div>
              <div className="p-stack-md">
                <span className="type-label-sm text-primary font-bold tracking-wider uppercase">
                  {featured.location}
                </span>
                <h3 className="type-headline-lg mt-1">{featured.name}</h3>
                <p className="type-body-md text-secondary line-clamp-2 max-w-2xl mt-2 mb-4">
                  {featured.description}
                </p>
                <div className="flex gap-2">
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full type-label-sm text-secondary">
                    {featured.cuisine}
                  </span>
                  <span className="bg-surface-container-highest px-3 py-1 rounded-full type-label-sm text-secondary">
                    {featured.priceRange}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Side card */}
          {rest[0] && (
            <div className="md:col-span-4 group cursor-pointer">
              <Link
                href={`/restaurants/${rest[0].slug}`}
                className="block bg-surface-container-low rounded-xl overflow-hidden h-full transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(147,0,30,0.06)] hover:-translate-y-1"
              >
                <div className="aspect-square w-full relative">
                  <Image
                    src={rest[0].image}
                    alt={rest[0].name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <span
                      className="material-symbols-outlined text-white text-[16px] select-none"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-white font-bold type-label-sm">
                      {rest[0].score}
                    </span>
                  </div>
                </div>
                <div className="p-stack-md">
                  <span className="type-label-sm text-primary font-bold tracking-wider uppercase">
                    {rest[0].location}
                  </span>
                  <h3 className="type-headline-md mt-1">{rest[0].name}</h3>
                  <p className="type-body-md text-secondary mt-2 line-clamp-3">
                    {rest[0].description}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Horizontal cards */}
          {rest.slice(1).map((r) => (
            <div key={r.id} className="md:col-span-6 group cursor-pointer">
              <Link
                href={`/restaurants/${r.slug}`}
                className="block bg-surface-container-low rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(147,0,30,0.06)] hover:-translate-y-1 flex flex-col md:flex-row"
              >
                <div className="md:w-1/2 relative min-h-[220px]">
                  <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-stack-md flex flex-col justify-center">
                  <div className="bg-primary-fixed w-fit px-2 py-0.5 rounded mb-2">
                    <span className="type-label-sm text-on-primary-fixed font-bold">
                      {r.score}
                    </span>
                  </div>
                  <span className="type-label-sm text-primary font-bold tracking-wider uppercase">
                    {r.location}
                  </span>
                  <h3 className="type-headline-md mt-1">{r.name}</h3>
                  <p className="type-body-md text-secondary mt-3 line-clamp-3">
                    {r.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Treatise divider */}
      <div className="flex items-center gap-4 mb-stack-lg">
        <div className="h-px flex-1 bg-surface-container-highest" />
        <h2 className="type-label-sm text-primary uppercase tracking-[0.2em]">
          The Maven&apos;s Treatise
        </h2>
        <div className="h-px flex-1 bg-surface-container-highest" />
      </div>

      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Newsletter CTA */}
      <section className="mt-stack-lg bg-surface-container-low border border-outline/10 rounded-2xl p-10 md:p-16 text-center">
        <h3 className="type-headline-lg mb-4 text-on-surface">
          The Weekly Dossier
        </h3>
        <p className="type-body-md text-secondary mb-10 max-w-xl mx-auto">
          Join 50,000 culinary professionals who receive our weekly breakdown of
          industry shifts and exclusive recipe previews.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Email address"
            className="bg-surface-container-lowest border border-outline/20 rounded-lg px-5 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none flex-grow type-body-md"
          />
          <button className="bg-primary text-on-primary px-8 py-3 rounded-lg type-label-sm uppercase tracking-widest font-bold hover:bg-primary/90 transition-colors shadow-md">
            Subscribe
          </button>
        </div>
      </section>

    </div>
  );
}
