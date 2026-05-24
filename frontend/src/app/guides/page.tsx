import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogs, getPlaces } from "@/lib/api";
import { blogHeroUrl } from "@/types";
import type { ApiPlace, Article } from "@/types";

export const metadata: Metadata = { title: "Guides" };

const PLACEHOLDER_ARTICLES: Article[] = [
  {
    blog_id: -1,
    slug: "old-city-hyderabad-food-trail",
    title: "The Old City Food Trail",
    subtitle: "Twelve hours, one walled city, and the most opinionated biryani opinions you will ever encounter.",
    hero_image: null,
    author: "maven",
    theme: "Guide",
    tags: ["Hyderabad", "Biryani", "Old City", "Street Food"],
    status: "published",
    published_at: "2025-01-15T00:00:00",
  },
  {
    blog_id: -2,
    slug: "irani-chai-houses-of-hyderabad",
    title: "Irani Chai and the Art of Doing Nothing",
    subtitle: "The city's oldest cafes were never really about the tea.",
    hero_image: null,
    author: "maven",
    theme: "Essay",
    tags: ["Hyderabad", "Chai", "Irani Cafe", "Culture"],
    status: "published",
    published_at: "2025-03-08T00:00:00",
  },
  {
    blog_id: -3,
    slug: "hyderabad-haleem-season",
    title: "Haleem Season",
    subtitle: "A dish that takes eight hours to make and twenty minutes to disappear. An annual ritual, not a menu item.",
    hero_image: null,
    author: "maven",
    theme: "Seasonal",
    tags: ["Hyderabad", "Haleem", "Ramadan", "Tradition"],
    status: "published",
    published_at: "2025-03-28T00:00:00",
  },
];

const badgeClasses: Record<string, string> = {
  primary: "bg-primary text-on-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary",
};

const variants = ["primary", "secondary", "tertiary"] as const;

function deriveBadgeVariant(theme: string | null): "primary" | "secondary" | "tertiary" {
  if (!theme) return "primary";
  return variants[theme.charCodeAt(0) % 3];
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ArticleCard({ article }: { article: Article }) {
  const badgeVariant = deriveBadgeVariant(article.theme);
  const formattedDate = formatDate(article.published_at);
  // Derive hero URL from blog_id; placeholders have negative IDs so fall back to gradient
  const heroUrl = article.blog_id > 0 ? blogHeroUrl(article.blog_id) : null;

  return (
    <Link href={`/guides/${article.slug}`} className="block h-full">
      <article className="group bg-surface-container-lowest rounded-xl overflow-hidden border border-outline/10 shadow-sm flex flex-col h-full transition-all hover:shadow-md cursor-pointer">
        <div className="relative h-64 overflow-hidden">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-highest" />
          )}
          {article.theme && (
            <div
              className={`absolute top-4 left-4 px-3 py-1 rounded-full type-label-sm uppercase tracking-wider font-bold ${
                badgeClasses[badgeVariant] ?? badgeClasses.primary
              }`}
            >
              {article.theme}
            </div>
          )}
        </div>
        <div className="p-8 flex flex-col flex-grow">
          {article.author && (
            <p className="type-label-sm text-outline mb-2">{article.author}</p>
          )}
          <h2 className="type-headline-md mt-1 mb-3 text-on-surface group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {article.subtitle && (
            <p className="type-body-md text-secondary mb-6 line-clamp-3 italic">
              &ldquo;{article.subtitle}&rdquo;
            </p>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-outline/10 pt-6">
            <span className="type-label-sm text-outline">
              {[formattedDate, article.tags?.[0]].filter(Boolean).join(" · ")}
            </span>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform select-none">
              arrow_forward
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function PlaceCard({ place, featured }: { place: ApiPlace; featured?: boolean }) {
  const ambience = place.ambience_rating != null ? Number(place.ambience_rating) : null;
  const service = place.service_rating != null ? Number(place.service_rating) : null;
  const avgScore =
    ambience != null && service != null
      ? ((ambience + service) / 2).toFixed(1)
      : ambience?.toFixed(1) ?? null;

  return (
    <Link
      href={`/places/${place.place_id}`}
      className="block bg-surface-container-low rounded-xl p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-outline-variant h-full"
    >
      {place.type && (
        <span className="type-label-sm text-[10px] text-primary font-bold tracking-widest uppercase block mb-2">
          {place.type}
        </span>
      )}
      <div className="flex justify-between items-start gap-4">
        <h3
          className={`text-on-surface group-hover:text-primary transition-colors ${
            featured ? "type-headline-lg" : "type-headline-md"
          }`}
        >
          {place.place_name}
        </h3>
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
      {place.location && (
        <p className="type-label-sm text-primary font-bold tracking-wider uppercase mt-1">
          {place.location}
        </p>
      )}
      {place.description && (
        <p className="type-body-md text-secondary mt-3 line-clamp-3">
          {place.description}
        </p>
      )}
    </Link>
  );
}

export default async function GuidesPage() {
  const { items: places } = await getPlaces({ limit: 6 });

  let liveArticles: Article[] = [];
  try {
    liveArticles = await getBlogs({ limit: 20 });
  } catch {
    // Backend unavailable — page still renders with places section
  }

  const liveSlugs = new Set(liveArticles.map((a) => a.slug));
  const articles = [
    ...liveArticles,
    ...PLACEHOLDER_ARTICLES.filter((p) => !liveSlugs.has(p.slug)),
  ];

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

      {/* Places grid */}
      {places.length > 0 && (
        <section className="mb-stack-lg">
          <div className="flex items-center justify-between mb-8">
            <h2 className="type-headline-lg text-on-surface">The Maven&apos;s Places</h2>
            <Link
              href="/places"
              className="text-primary type-body-md hover:underline font-semibold flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-[18px] select-none">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {places[0] && (
              <div className="md:col-span-7">
                <PlaceCard place={places[0]} featured />
              </div>
            )}
            {places[1] && (
              <div className="md:col-span-5">
                <PlaceCard place={places[1]} />
              </div>
            )}
            {places.slice(2).map((p) => (
              <div key={p.place_id} className="md:col-span-4">
                <PlaceCard place={p} />
              </div>
            ))}
          </div>
        </section>
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
      {articles.length === 0 ? (
        <div className="py-16 text-center">
          <p className="type-body-lg text-secondary">No guides published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article) => (
            <ArticleCard key={article.blog_id} article={article} />
          ))}
        </div>
      )}

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
