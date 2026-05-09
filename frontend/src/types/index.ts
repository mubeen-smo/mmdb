export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  location: string;
  cuisine: string;
  priceRange: "$$" | "$$$" | "$$$$";
  score: number;
  ambienceScore: number;
  serviceScore: number;
  description: string;
  image: string;
  featured?: boolean;
}

export interface DishCourse {
  number: string;
  name: string;
  score: number;
  scoreIcon: "star" | "star_half";
  description: string;
  howToSavour: string;
  image: string;
}

export interface Dish {
  id: string;
  slug: string;
  name: string;
  restaurant: string;
  restaurantSlug?: string;
  cuisine: string;
  priceRange: "$$" | "$$$" | "$$$$";
  score: number;
  description?: string;
  image?: string;
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
