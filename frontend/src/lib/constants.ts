export const LOADING_VERBS = [
  "Cooking…",
  "Brewing…",
  "Simmering…",
  "Mixing…",
  "Blending…",
  "Whisking…",
  "Kneading…",
  "Chopping…",
  "Grilling…",
  "Baking…",
  "Roasting…",
  "Steaming…",
  "Seasoning…",
  "Marinating…",
  "Infusing…",
  "Tasting…",
  "Savoring…",
  "Foraging…",
  "Scouting…",
  "Sifting…",
  "Curating…",
  "Plating…",
  "Garnishing…",
  "Drizzling…",
  "Serving…",
  "Uncovering…",
  "Preheating…",
  "Caramelizing…",
  "Reducing…",
  "Shaking…",
  "Pouring…",
  "Flipping…",
  "Searing…",
  "Chilling…",
  "Toasting…",
  "Scooping…",
];

export const SUGGESTED_PROMPTS = [
  "Best biryani in Hyderabad",
  "Suggest some good desserts",
  "Top Hyderabadi dishes",
  "Best street food places to try",
];

export const GREETING_TEXT = "What are you in the mood for today?";

export const randomVerb = () =>
  LOADING_VERBS[Math.floor(Math.random() * LOADING_VERBS.length)];
