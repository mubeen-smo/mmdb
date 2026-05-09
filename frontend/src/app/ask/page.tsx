import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Ask MMDb" };

const suggestedPrompts = [
  "I want somewhere quiet in Paris with an exceptional wine list.",
  "What's the best dish for someone who loves umami?",
  "Recommend a tasting menu under €150.",
  "I'm plant-based — what are the standout dishes this season?",
];

const placeholderMessages = [
  {
    role: "assistant" as const,
    text: "Bonjour. I am your MMDb Concierge. I can recommend dishes, curate a restaurant shortlist, or guide you through a degustation menu. What are you looking for tonight?",
  },
];

export default function AskPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">

      <div className="flex gap-gutter h-full overflow-hidden">

        {/* Chat panel */}
        <section className="flex-grow flex flex-col bg-surface-container-low/70 backdrop-blur-sm rounded-xl border border-outline-variant/30 overflow-hidden max-w-3xl">

          {/* Header */}
          <div className="px-stack-md py-4 border-b border-surface-container-highest flex items-center gap-3 bg-surface-container-low/50">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-on-primary-container select-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <h1 className="type-headline-md leading-tight">
                Culinary Assistant
              </h1>
              <p className="type-label-sm text-secondary">
                Powered by MMDb Maven AI
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-stack-md flex flex-col gap-stack-md">
            {placeholderMessages.map((msg, i) => (
              <div key={i} className="flex gap-4 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-on-primary-container text-sm select-none"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div className="bg-surface-container-high rounded-xl p-4">
                  <p className="type-body-md text-on-surface">{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Suggested prompts */}
            <div className="mt-2">
              <p className="type-label-sm text-secondary mb-3 uppercase tracking-wider">
                Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full type-label-sm text-on-surface hover:border-primary hover:text-primary transition-colors text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-stack-md border-t border-surface-container-highest">
            <div className="flex items-center gap-3 bg-surface-container-low rounded-full px-4 py-2 border border-outline-variant/30 focus-within:border-primary-container transition-all">
              <span className="material-symbols-outlined text-secondary select-none">
                mic
              </span>
              <input
                type="text"
                placeholder="Ask for a table, a recipe, or a wine pairing…"
                className="flex-grow bg-transparent border-none focus:outline-none type-body-md py-2"
              />
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-all shrink-0">
                <span
                  className="material-symbols-outlined select-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
            <p className="type-label-sm text-secondary/60 text-center mt-3">
              AI responses are based on the MMDb database only. No hallucinated
              recommendations.
            </p>
          </div>
        </section>

        {/* Selections panel — visible on desktop */}
        <aside className="hidden lg:flex flex-col w-[360px] gap-stack-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="type-headline-md">Maven Selections</h2>
            <span className="type-label-sm text-primary px-2 py-1 bg-primary/10 rounded-full">
              Ask to populate
            </span>
          </div>

          <div className="flex-grow flex flex-col items-center justify-center bg-surface-container-low/50 rounded-xl border border-outline-variant/20 border-dashed p-8 text-center">
            <span
              className="material-symbols-outlined text-outline text-[48px] mb-4 select-none"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              restaurant
            </span>
            <p className="type-body-md text-secondary">
              Your curated selections will appear here once you ask a question.
            </p>
            <p className="type-label-sm text-secondary/60 mt-2">
              Try &ldquo;Find me a tasting menu in Paris&rdquo;
            </p>
          </div>

          <div className="bg-primary/5 border-l-2 border-primary rounded-r-xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[18px] select-none">
                lightbulb
              </span>
              <span className="type-label-sm text-primary font-bold">
                Phase 3 Feature
              </span>
            </div>
            <p className="type-label-sm text-on-surface-variant">
              The full agentic concierge — tool use, memory, and inline dish
              cards — arrives in Phase 3.
            </p>
            <Link
              href="/guides"
              className="type-label-sm text-primary hover:underline mt-2 block"
            >
              Browse manually →
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
