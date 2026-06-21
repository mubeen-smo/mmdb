"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { GREETING_TEXT, SUGGESTED_PROMPTS, randomVerb } from "@/lib/constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING_TEXT },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingVerb, setLoadingVerb] = useState(() => randomVerb());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const NEAR_ME_RE = /\b(near|around|close|closest|nearest)\s+me\b|\bmy\s+(area|location|vicinity)\b/i;

  function wantsUserLocation(text: string): boolean {
    return NEAR_ME_RE.test(text);
  }

  async function requestLocation(): Promise<{ lat: number; lng: number } | null> {
    if (location) return location;
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          resolve(loc);
        },
        () => resolve(null),
        { timeout: 5000 },
      );
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    let currentLocation = location;
    if (wantsUserLocation(trimmed)) {
      currentLocation = await requestLocation();
    }

    setLoadingVerb(randomVerb());

    const userMsg: Message = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          lat: currentLocation?.lat ?? null,
          lng: currentLocation?.lng ?? null,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);
      setMessages([...history, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...history,
        { role: "assistant", content: "Something went wrong. Make sure the backend is running." },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md">
      <div className="flex gap-gutter h-full overflow-hidden">

        <section className="flex-grow flex flex-col bg-surface-container-low/70 backdrop-blur-sm rounded-xl border border-outline-variant/30 overflow-hidden max-w-3xl">

          <div className="px-6 py-4 border-b border-surface-container-highest flex items-center gap-3 bg-surface-container-low/50 shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-on-primary-container select-none text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
            <div>
              <h1 className="type-title-md leading-tight">Maven</h1>
              <p className="type-label-sm text-secondary">Find what to eat, where to go</p>
            </div>
          </div>

          <div ref={scrollBoxRef} className="flex-grow overflow-y-auto px-6 py-5 flex flex-col gap-5">
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="flex gap-3 max-w-[88%]">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-container flex items-center justify-center mt-0.5">
                    <span
                      className="material-symbols-outlined text-on-primary-container select-none"
                      style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-2xl rounded-tl-sm px-4 py-3">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="type-body-md text-on-surface leading-relaxed mb-2 last:mb-0">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mt-2 mb-2 last:mb-0 space-y-1 pl-1">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="type-body-md text-on-surface flex gap-2">
                            <span className="text-primary mt-0.5 shrink-0">·</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-on-surface">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex gap-3 max-w-[88%] self-end flex-row-reverse">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center mt-0.5">
                    <span
                      className="material-symbols-outlined text-on-secondary-container select-none"
                      style={{ fontSize: 14 }}
                    >
                      person
                    </span>
                  </div>
                  <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="type-body-md text-on-surface">{msg.content}</p>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex gap-3 max-w-[88%]">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-container flex items-center justify-center mt-0.5">
                  <span
                    className="material-symbols-outlined text-on-primary-container select-none"
                    style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div className="bg-surface-container rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="type-body-md text-secondary animate-pulse">
                    {loadingVerb}
                  </span>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="mt-1">
                <p className="type-label-sm text-secondary/70 mb-3 uppercase tracking-widest text-xs">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="px-4 py-2 bg-surface-container border border-outline-variant rounded-full type-label-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div />
          </div>

          <div className="px-6 py-4 border-t border-surface-container-highest shrink-0">
            <div className="flex items-center gap-3 bg-surface-container rounded-full px-5 py-2.5 border border-outline-variant/40 focus-within:border-primary/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about biryani, cafes, late-night eats…"
                disabled={loading}
                className="flex-grow bg-transparent border-none focus:outline-none type-body-md py-1 disabled:opacity-50 placeholder:text-secondary/50"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 active:scale-95 transition-all shrink-0 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span
                  className="material-symbols-outlined select-none"
                  style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
            <p className="type-label-sm text-secondary/40 text-center mt-2.5 text-xs">
              Recommendations are from the MMDb database only
            </p>
          </div>
        </section>

        <aside className="hidden lg:flex flex-col w-[320px] gap-4 shrink-0">
          <h2 className="type-title-md">Maven Selections</h2>
          <div className="flex-grow flex flex-col items-center justify-center bg-surface-container-low/50 rounded-xl border border-outline-variant/20 border-dashed p-8 text-center">
            <span
              className="material-symbols-outlined text-outline/50 mb-4 select-none"
              style={{ fontSize: 40, fontVariationSettings: "'FILL' 0" }}
            >
              restaurant
            </span>
            <p className="type-body-sm text-secondary">
              Curated picks will appear here as you chat.
            </p>
            <p className="type-label-sm text-secondary/50 mt-1">
              Try &ldquo;Best biryani in the old city&rdquo;
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
