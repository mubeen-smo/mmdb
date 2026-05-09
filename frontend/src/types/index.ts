
export interface ApiDish {
  item_id: number;
  item: string;
  place_name: string | null;
  place_id: number | null;
  item_rating: number | null;
  description: string | null;
  tags: string | null;
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

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  badge: string;
  badgeVariant: "primary" | "secondary" | "tertiary";
  mavenScore: number;
  readTimeMinutes: number;
  topic: string;
  image: string;
}
