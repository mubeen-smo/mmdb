"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { GREETING_TEXT, SUGGESTED_PROMPTS, nextVerb, initialVerb } from "@/lib/constants";

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
  const [loadingVerb, setLoadingVerb] = useState(() => initialVerb());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollBoxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

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

    setLoadingVerb(prev => nextVerb(prev));

    const userMsg: Message = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
      textareaRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <>
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-in { animation: msgIn 0.15s ease-out forwards; }

        @keyframes waveDot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* h-[calc(100dvh-3.5rem)] = full viewport minus mobile navbar (h-14)
          md:h-[calc(100dvh-5rem)] = full viewport minus desktop navbar (h-20)
          dvh shrinks when soft keyboard appears, keeping input pinned */}
      <div className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-5rem)] max-h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-5rem)] overflow-hidden">

        {/* Chat header */}
        <header className="shrink-0 flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-outline-variant/20 bg-surface-container-low/30">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-on-primary-container select-none"
              style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h1 className="type-title-md leading-tight">Maven</h1>
            <p className="type-label-sm text-secondary">Find what to eat, where to go</p>
          </div>
        </header>

        {/* Scrollable message list */}
        <div
          ref={scrollBoxRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-6"
        >
          <div className="max-w-2xl mx-auto flex flex-col gap-3">

            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="msg-in self-start flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-container flex items-center justify-center mt-0.5">
                    <span
                      className="material-symbols-outlined text-on-primary-container select-none"
                      style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-sm leading-relaxed text-on-surface mb-2 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mt-2 mb-2 last:mb-0 space-y-1 pl-1">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm leading-relaxed text-on-surface flex gap-2">
                            <span className="text-primary mt-0.5 shrink-0">·</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-on-surface">{children}</strong>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={i} className="msg-in self-end max-w-[75%] sm:max-w-[60%]">
                  <div className="bg-primary/10 border border-primary/15 rounded-2xl rounded-br-sm px-4 py-2.5">
                    <p className="text-sm leading-relaxed text-on-surface">{msg.content}</p>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="self-start flex items-start gap-2.5 max-w-[85%]">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-container flex items-center justify-center mt-0.5">
                  <span
                    className="material-symbols-outlined text-on-primary-container select-none"
                    style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <div className="bg-surface-container rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-secondary/70 font-medium tracking-wide">
                    {loadingVerb}
                  </span>
                  <div className="flex items-center gap-[3px]">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="block w-1.5 h-1.5 rounded-full bg-primary/50"
                        style={{ animation: "waveDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="flex flex-col items-center gap-6 py-12 px-4">
                <p className="text-xs text-secondary/60 uppercase tracking-widest">Try asking</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTED_PROMPTS.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => send(prompt)}
                      className="px-4 py-2 bg-surface-container border border-outline-variant rounded-full text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div />
          </div>
        </div>

        {/* Input — always pinned to bottom */}
        <footer className="flex-none border-t border-outline-variant/20 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-surface-container rounded-2xl px-4 py-2.5 border border-outline-variant/40 focus-within:border-primary/40 transition-colors">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                onFocus={(e) => {
                  e.target.scrollIntoView = () => {};
                  if (scrollBoxRef.current) {
                    setTimeout(() => {
                      scrollBoxRef.current!.scrollTop = scrollBoxRef.current!.scrollHeight;
                    }, 50);
                  }
                }}
                placeholder="Ask about biryani, cafes, late-night eats…"
                disabled={loading}
                className="flex-1 bg-transparent resize-none overflow-y-auto text-sm leading-relaxed max-h-32 py-1 focus:outline-none disabled:opacity-50 placeholder:text-secondary/50"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:opacity-90 active:scale-95 transition-all shrink-0 disabled:opacity-25 disabled:pointer-events-none"
              >
                <span
                  className="material-symbols-outlined select-none"
                  style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
                >
                  send
                </span>
              </button>
            </div>
            <p className="text-xs text-secondary/40 text-center mt-2">
              Recommendations are from the MMDb database only
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
