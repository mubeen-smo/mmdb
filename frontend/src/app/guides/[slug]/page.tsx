import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlog } from "@/lib/api";
import { blogHeroUrl } from "@/types";
import { BlogBody } from "./BlogBody";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getBlog(slug);
    if (!blog) return {};
    return { title: blog.title };
  } catch {
    return {};
  }
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  const formattedDate = formatDate(blog.published_at);

  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">

      {/* Back */}
      <Link
        href="/guides"
        className="inline-flex items-center gap-1 type-label-sm text-outline hover:text-primary transition-colors mb-8"
      >
        <span className="material-symbols-outlined text-[18px] select-none">arrow_back</span>
        Guides
      </Link>

      {/* Header */}
      <header className="mb-12 max-w-3xl">
        {blog.theme && (
          <span className="type-label-sm text-primary uppercase tracking-widest font-bold block mb-4">
            {blog.theme}
          </span>
        )}
        <h1 className="type-display-lg text-on-surface mb-4">{blog.title}</h1>
        {blog.subtitle && (
          <p className="type-body-lg text-secondary italic mb-6">{blog.subtitle}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 type-label-sm text-outline border-t border-outline/10 pt-6">
          {blog.author && <span>{blog.author}</span>}
          {formattedDate && <span>{formattedDate}</span>}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-container-high text-secondary px-3 py-1 rounded-full type-label-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Hero image — derived from blog_id, never stored as a URL */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden mb-12">
        <Image
          src={blogHeroUrl(blog.blog_id)}
          alt={blog.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Body */}
      <div className="max-w-3xl">
        <BlogBody content={blog.body_md} />
      </div>

    </div>
  );
}
