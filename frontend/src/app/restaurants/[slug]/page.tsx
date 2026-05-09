import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, getDishCourses, restaurants } from "@/lib/data";
import type { DishCourse } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) return {};
  return { title: restaurant.name };
}

function ScoreCard({
  label,
  description,
  score,
}: {
  label: string;
  description: string;
  score: number;
}) {
  return (
    <div className="bg-surface-container-low p-stack-md rounded-xl flex items-center justify-between border-l-4 border-primary shadow-sm">
      <div>
        <h3 className="type-headline-md text-on-surface">{label}</h3>
        <p className="type-body-md text-secondary">{description}</p>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="text-primary"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.5rem",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {score.toFixed(1)}
        </span>
        <span className="type-label-sm text-secondary">/ 10</span>
      </div>
    </div>
  );
}

function CourseArticle({ course }: { course: DishCourse }) {
  return (
    <article className="group">
      <div className="flex justify-between items-baseline border-b border-surface-container-highest pb-2 mb-4">
        <h3 className="type-headline-md text-on-surface group-hover:text-primary transition-colors">
          {course.number}. {course.name}
        </h3>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span
            className="material-symbols-outlined text-primary text-sm select-none"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {course.scoreIcon}
          </span>
          <span className="type-headline-md text-primary">{course.score}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">
        <div>
          <p className="type-body-md text-on-surface-variant mb-6 leading-relaxed">
            {course.description}
          </p>
          <div className="bg-secondary-container/30 p-4 rounded-lg">
            <span className="type-label-sm text-primary uppercase block mb-2">
              How to Savour
            </span>
            <p className="type-body-md text-on-secondary-container text-sm italic">
              &ldquo;{course.howToSavour}&rdquo;
            </p>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden h-40 lg:h-auto shadow-md relative">
          <Image
            src={course.image}
            alt={course.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </article>
  );
}

export default async function RestaurantPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const courses = getDishCourses(slug);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg">

      {/* Hero */}
      <section className="py-stack-lg flex flex-col items-center text-center">
        <span className="type-label-sm text-primary tracking-widest uppercase mb-2">
          Editorial Review
        </span>
        <h1 className="type-display-xl text-on-surface mb-6">
          {restaurant.name}
        </h1>
        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden mb-stack-md shadow-lg">
          <Image
            src={restaurant.image}
            alt={restaurant.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </section>

      {/* Scores */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-stack-lg">
        <ScoreCard
          label="Ambience"
          description="Celestial harmony & architectural grace."
          score={restaurant.ambienceScore}
        />
        <ScoreCard
          label="Service"
          description="Invisible, anticipatory, and flawless."
          score={restaurant.serviceScore}
        />
      </section>

      {/* Degustation */}
      {courses.length > 0 && (
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center gap-4 mb-stack-md">
            <div className="h-px flex-1 bg-surface-container-highest" />
            <h2 className="type-label-sm text-primary uppercase tracking-[0.2em]">
              The Degustation Journey
            </h2>
            <div className="h-px flex-1 bg-surface-container-highest" />
          </div>
          <div className="space-y-stack-lg">
            {courses.map((course) => (
              <CourseArticle key={course.number} course={course} />
            ))}
          </div>
        </div>
      )}

      {courses.length === 0 && (
        <div className="max-w-[800px] mx-auto text-center py-stack-lg">
          <p className="type-body-lg text-secondary">
            Full degustation notes coming soon.
          </p>
        </div>
      )}

    </div>
  );
}
