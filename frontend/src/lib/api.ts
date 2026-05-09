import type { ApiDish, ApiDishList, ApiPlace, ApiPlaceDetail, ApiPlaceList } from "@/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const REST = `${SUPABASE_URL}/rest/v1`;

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
