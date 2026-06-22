const VERB_MAP: Array<[RegExp, string]> = [
  [/ice.?cream|gelato|kulfi|sorbet/i, "Scooping something good"],
  [/dessert|sweet|cake|pastry|halwa|kheer/i, "Finding something sweet"],
  [/coffee|cafe|chai|tea|brew/i, "Brewing something up"],
  [/biryani|rice|pulao/i, "Stirring the pot"],
  [/street.?food|chaat|snack/i, "Hitting the streets"],
  [/breakfast|morning/i, "Starting the day right"],
  [/haleem|marag|nihari/i, "Slow-cooking the answer"],
  [/veg|vegetarian/i, "Checking the green options"],
  [/near me|around me|close by/i, "Checking what's nearby"],
];

const GENERIC_VERBS = [
  "Checking the kitchen",
  "Scouting the city",
  "Asking around",
  "Looking it up",
  "On it",
];

export const SUGGESTED_PROMPTS = [
  "Best biryani in Hyderabad",
  "Suggest some good desserts",
  "Top Hyderabadi dishes",
  "Best street food places to try",
];

export const GREETING_TEXT = "What are you in the mood for today?";

export function pickVerb(text: string): string {
  for (const [pattern, verb] of VERB_MAP) {
    if (pattern.test(text)) return verb;
  }
  return GENERIC_VERBS[Math.floor(Math.random() * GENERIC_VERBS.length)];
}
