
export interface ApiDish {
  item_id: number;
  item: string;
  place_name: string | null;
  place_id: number | null;
  item_rating: number | null;
  description: string | null;
  tags: string | null;
  diet: string | null;
}

export interface ApiPlace {
  place_id: number;
  place_name: string;
  location: string | null;
  description: string | null;
  ambience_rating: number | null;
  service_rating: number | null;
  type: string | null;
  open_time: string | null;
  tags: string | null;
  area_tags: string | null;
}

export interface ApiPlaceDetail extends ApiPlace {
  dishes: ApiDish[];
}

export interface ApiDishList {
  total: number;
  items: ApiDish[];
}

export interface ApiPlaceList {
  total: number;
  items: ApiPlace[];
}

// Hero images are derived from blog_id — never stored as a URL.
// Pattern: {NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/blogs/{blog_id}.jpg
export const SUPABASE_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export function blogHeroUrl(blog_id: number): string {
  return `${SUPABASE_BASE_URL}/storage/v1/object/public/media/blogs/${blog_id}.jpg`;
}

export interface Article {
  blog_id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  hero_image?: string | null;
  author: string | null;
  theme: string | null;
  tags: string[] | null;
  status: string | null;
  published_at: string | null;
}

export interface ArticleDetail extends Article {
  body_md: string;
}
