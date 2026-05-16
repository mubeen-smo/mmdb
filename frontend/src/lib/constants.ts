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
  "Best biryani in Hyderabad?",
  "Veg-friendly cafes in Banjara Hills",
  "Late-night food near Gachibowli",
  "Signature dishes worth trying",
];

export const GREETING_TEXT =
  "Hello. I know Hyderabad's food scene well — from old-city biryanis to hidden breakfast spots and late-night dhabas. Tell me what you're looking for.";

export const randomVerb = () =>
  LOADING_VERBS[Math.floor(Math.random() * LOADING_VERBS.length)];
