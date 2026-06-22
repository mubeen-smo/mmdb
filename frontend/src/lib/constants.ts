export const SUGGESTED_PROMPTS = [
  "Best biryani in Hyderabad",
  "Suggest some good desserts",
  "Top Hyderabadi dishes",
  "Best street food places to try",
];

export const GREETING_TEXT = "What are you in the mood for today?";

const FOOD_VERBS = [
  "Simmering", "Plating", "Tasting", "Marinating", "Garnishing",
  "Foraging", "Whisking", "Sourcing", "Seasoning", "Curating",
  "Reducing", "Sampling",
];

export function nextVerb(current: string): string {
  const pool = FOOD_VERBS.filter(v => v !== current);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function initialVerb(): string {
  return FOOD_VERBS[Math.floor(Math.random() * FOOD_VERBS.length)];
}
