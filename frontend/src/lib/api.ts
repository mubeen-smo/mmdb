import type { ApiDish, ApiDishList, ApiPlace, ApiPlaceDetail, ApiPlaceList, Article, ArticleDetail } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const REST = `${SUPABASE_URL}/rest/v1`;

export const dishImageUrl = (itemId: number) =>
  `${SUPABASE_URL}/storage/v1/object/public/media/items/${itemId}.png`;

async function pgFetch<T>(
  table: string,
  qs: URLSearchParams,
  wantCount = false,
): Promise<{ data: T[]; total: number }> {
  const headers: Record<string, string> = {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  };
  if (wantCount) headers["Prefer"] = "count=exact";

  const res = await fetch(`${REST}/${table}?${qs}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`Supabase ${res.status}: ${table}`);

  const data = (await res.json()) as T[];

  let total = data.length;
  if (wantCount) {
    const cr = res.headers.get("Content-Range");
    const m = cr?.match(/\/(\d+)$/);
    if (m) total = parseInt(m[1], 10);
  }

  return { data, total };
}

export async function getDishes(params?: {
  q?: string;
  tags?: string;
  place_id?: number;
  dietFilter?: "veg" | "non_veg";
  limit?: number;
  offset?: number;
}): Promise<ApiDishList> {
  const qs = new URLSearchParams({ select: "*" });
  if (params?.q) {
    const q = params.q;
    qs.set("or", `(item.ilike.*${q}*,place_name.ilike.*${q}*,tags.ilike.*${q}*,description.ilike.*${q}*)`);
  }
  if (params?.tags) qs.set("tags", `eq.${params.tags}`);
  if (params?.place_id != null) qs.set("place_id", `eq.${params.place_id}`);
  if (params?.dietFilter === "veg") qs.set("diet", "in.(veg,vegan)");
  if (params?.dietFilter === "non_veg") qs.set("diet", "in.(non_veg,egg)");
  qs.set("order", "item_rating.desc.nullslast,item.asc");
  qs.set("limit", String(params?.limit ?? 50));
  qs.set("offset", String(params?.offset ?? 0));

  const { data, total } = await pgFetch<ApiDish>("items_table", qs, true);
  return { total, items: data };
}

export async function getDish(itemId: number): Promise<ApiDish> {
  const qs = new URLSearchParams({ select: "*", item_id: `eq.${itemId}` });
  const { data } = await pgFetch<ApiDish>("items_table", qs);
  if (!data[0]) throw new Error(`Dish ${itemId} not found`);
  return data[0];
}

export async function getPlaces(params?: {
  q?: string;
  type?: string;
  limit?: number;
  offset?: number;
}): Promise<ApiPlaceList> {
  const qs = new URLSearchParams({ select: "*" });
  if (params?.q) {
    const q = params.q;
    qs.set("or", `(place_name.ilike.*${q}*,location.ilike.*${q}*,tags.ilike.*${q}*,area_tags.ilike.*${q}*)`);
  }
  if (params?.type) qs.set("type", `eq.${params.type}`);
  qs.set("order", "place_name.asc");
  qs.set("limit", String(params?.limit ?? 100));
  qs.set("offset", String(params?.offset ?? 0));

  const { data, total } = await pgFetch<ApiPlace>("places_table", qs, true);
  return { total, items: data };
}

export async function getBlogs(params?: {
  theme?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const qs = new URLSearchParams({ select: "*", status: "eq.published" });
  if (params?.theme) qs.set("theme", `eq.${params.theme}`);
  if (params?.tag) qs.set("tags", `cs.{${params.tag}}`);
  qs.set("order", "published_at.desc");
  qs.set("limit", String(params?.limit ?? 20));
  if (params?.offset) qs.set("offset", String(params.offset));

  const { data } = await pgFetch<Article>("blogs", qs);
  return data;
}

export async function getBlog(slug: string): Promise<ArticleDetail | null> {
  const qs = new URLSearchParams({
    select: "*",
    slug: `eq.${slug}`,
    status: "eq.published",
    limit: "1",
  });
  const { data } = await pgFetch<ArticleDetail>("blogs", qs);
  return data[0] ?? null;
}

export async function getPlace(placeId: number): Promise<ApiPlaceDetail> {
  const placeQs = new URLSearchParams({ select: "*", place_id: `eq.${placeId}` });
  const { data: places } = await pgFetch<ApiPlace>("places_table", placeQs);
  if (!places[0]) throw new Error(`Place ${placeId} not found`);

  const dishQs = new URLSearchParams({
    select: "*",
    place_id: `eq.${placeId}`,
    order: "item_rating.desc.nullslast",
  });
  const { data: dishes } = await pgFetch<ApiDish>("items_table", dishQs);

  return { ...places[0], dishes };
}
