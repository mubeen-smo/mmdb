import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPlaces } from "@/lib/api";
import type { ApiPlace, Article } from "@/types";

export const metadata: Metadata = { title: "Guides" };

const articles: Article[] = [
  {
    id: "1",
    slug: "modernist-fermentation",
    title: "Modernist Fermentation: The New Frontier",
    excerpt:
      "Complexity born from patience. This guide explores the intersection of ancient preservation and contemporary flavour architecture.",
    badge: "Mastery",
    badgeVariant: "primary",
    mavenScore: 5.0,
    readTimeMinutes: 12,
    topic: "Technique",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9GX71Ijhaj9JdxBJcLhHy7osZl6ZN6OeenM1MUDUZ7_6M4TtJO3-z8JVbagh3_hEEyZKqOndgkgGXbkB8QJnKGIi9aj-4_N3WU--GKxCCxUufdH9F0v-r9QJkPlQ15eLiJYWrzFsa44uC98zwDXikHtsFUlGr-UsxZMHvnsHCpNy4kfz6hyLphu3u9-YXj-8ekQBkxh6y2bnKyR7qgrfD9-QIwRuY6513pz3ULUur6kgAqwVSugxKtiC-PLXCCT_gDtQT94pXn1Y",
  },
  {
    id: "2",
    slug: "tokyo-underground",
    title: "The Tokyo Underground: Edomae Secrets",
    excerpt:
      "Beyond the neon of Ginza lies a world of purists. We reveal the hidden ateliers where centuries-old traditions are whispered across Hinoki counters.",
    badge: "Heritage",
    badgeVariant: "tertiary",
    mavenScore: 4.8,
    readTimeMinutes: 18,
    topic: "Regional",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUKsTVisEHwAgl3jlT4d876mHIYo4M9J-wTKJD90IqeovTfB2FhZ2MNxIrvgNaTv0zlXviHScyrgYEEO6ZiypgWwAtNnNDoTIJLb5nbEef1lxnC7hVMh9T5uJDBI6-pZtywYLczME96IE3KeRWrsjw7-lBym-APQvY7fROY8kcEz5hl9xn8BMQhi4MZFggh1DrF6K9nTChHV6ZJa3V05FAZVot2_54jNxb2t_V4n52R232xTbDCRFydTkqgT-WduP04B91YCqKE44",
  },
  {
    id: "3",
    slug: "charcoal-manifesto",
    title: "The Charcoal Manifesto: Fire Mastery",
    excerpt:
      "Taming the elemental. A deep dive into the specific thermal properties of Binchotan and the art of the perfect Maillard reaction.",
    badge: "Editorial",
    badgeVariant: "primary",
    mavenScore: 4.9,
    readTimeMinutes: 15,
    topic: "Theory",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-PxSAQQhnl7AD34VRUQCH7F24eA4CED51tcZHUlgIWRAPlr9BSPjOgIwdRnxq_a8Bk1-frUcbVpZWC_JfafS9Z9mwoq5xKi42DV-Z3jPHO9GmP-1dg4k3OjEcNCrtZbvK8abj1DYjrFQqDZkmbQE4YKijD1ihp2Ipge675_3h4QzS5Ct6azf6o3Kp4zq5NOhk_YJG6ZSPd8vvweJmPKgyIGV-XjWWlSrZs6TDMs8tqCzpJztFXiaWiwoWTbpGXRK5U0Buss25u4E",
  },
  {
    id: "4",
    slug: "alchemy-of-the-bitter",
    title: "The Alchemy of the Bitter",
    excerpt:
      "A journey through the botanical landscapes of Italy. Understanding the delicate balance of wormwood, gentian, and citrus zest.",
    badge: "Libations",
    badgeVariant: "secondary",
    mavenScore: 4.7,
    readTimeMinutes: 10,
    topic: "Spirits",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzkDW2kqr_jj9hPl-QD4K-vJFD9_cUSO6HGRzXPogxBLZ0u1vzsIF9aqH7dIcDNwgIx17Ki_bwXxyb7t22-c_1X7ts2h6YzVCobdB4i2X9mJsqs8ZhRw5sOgQdzv6714vi2u585e_NbxI5p5d254MxYiQgiAH9P2nIpGBhX2GYgIGHVZJ_q35qomeKka--px2uJIzfb3M5c8_gQ5C3HXY31eSxb_xBX_F2x1xnfRW1Kl3-NNOKeMgOp4eVFbN0gN5ROFf-djjpC2M",
  },
  {
    id: "5",
    slug: "professional-atelier",
    title: "The Professional Atelier",
    excerpt:
      "We audition the tools that define the modern kitchen. From bespoke Japanese steel to the precise thermal control of induction technology.",
    badge: "Curation",
    badgeVariant: "primary",
    mavenScore: 5.0,
    readTimeMinutes: 22,
    topic: "Equipment",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAGYu7ETAGF5rLm7jcSSknBilpaUXlpU7oDu_FnWEtiUEFRDugXv1XOn1DDhB9-383JWdfgfwFiGZ30LV2-PU2SXkrKzxHm0avzJPL2GbjKTyzXivggsPZB2FUg3diGoFsS8G4eWqLty7p_O0Yr53GG0l4s4_pe4TnNW66IQ3hQhjSrsIKK1s137U6RCDOy4GJLWAScQq5xM-G28H_kZ5edC3eFbVv3e-fMiqpbxdI7xG1xV7TPdOcFxiE0kbMNfkr25D7odGM_-Q8",
  },
  {
    id: "6",
    slug: "architecture-of-patisserie",
    title: "The Architecture of Pâtisserie",
    excerpt:
      "Form following function in the world of sweets. We analyse the structural integrity and flavour profiles of contemporary Parisian icons.",
    badge: "Precision",
    badgeVariant: "tertiary",
    mavenScore: 4.6,
    readTimeMinutes: 14,
    topic: "Pastry",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAgvm6_7YOa5e8Da_qHxErMIpcsQy8wLPcPkK7oN6Im1No5TCySxeJ6rkZDrSTDR8GO-mh3iq2XNI0CBAyCOL6AsbpqF1HVLDyDhDXzHSDkly7Tuzs68yq0t_B-xmcgNvUYvOcaF0AeAZJDcDTEQSh_QAnK7P82tkYLYN4hpZTv-u4Zuao7E97WJBSo-rhTQiby7n17M5spQ2GUmPWCddpSafIEu90jYvEJiPaZXnH0NJBCtZcN8jlluXyhQ0Ly8QQU0eZf3qnGhws",
  },
];

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
