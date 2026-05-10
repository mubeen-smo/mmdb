"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/places", label: "Places" },
  { href: "/dishes", label: "Dishes" },
  { href: "/guides", label: "Guides" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const overlay = (
    <div
      className={`fixed inset-0 z-40 flex flex-col justify-center px-12 transition-all duration-500 lg:hidden ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(251, 249, 248, 0.95)", backdropFilter: "blur(20px)" }}
    >
      <div className="flex flex-col gap-8">

        {primaryLinks.map(({ href, label }, i) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <div
              key={href}
              className="transition-all duration-500"
              style={{
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(-20px)",
                transitionDelay: open ? `${(i + 1) * 100}ms` : "0ms",
              }}
            >
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`block leading-none text-primary font-extrabold hover:translate-x-2 transition-transform ${
                  active ? "opacity-60" : ""
                }`}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 10vw, 3rem)",
                }}
              >
                {label}
              </Link>
            </div>
          );
        })}

        <div
          className="transition-all duration-500 pt-8 border-t border-outline-variant/30"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-20px)",
            transitionDelay: open ? "400ms" : "0ms",
          }}
        >
          <Link
            href="/ask"
            onClick={() => setOpen(false)}
            className="w-full bg-primary text-on-primary px-8 py-5 rounded-full font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            <span
              className="material-symbols-outlined select-none"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              auto_awesome
            </span>
            Ask MMDb
          </Link>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Animated hamburger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="relative w-6 h-[18px] flex flex-col justify-between items-center lg:hidden shrink-0 z-[201]"
      >
        <span
          className="w-6 h-[2px] bg-primary block transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: open ? "translateY(8px) rotate(45deg)" : "none" }}
        />
        <span
          className="w-6 h-[2px] bg-primary block transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ opacity: open ? 0 : 1, transform: open ? "translateX(-10px)" : "none" }}
        />
        <span
          className="w-6 h-[2px] bg-primary block transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: open ? "translateY(-8px) rotate(-45deg)" : "none" }}
        />
      </button>

      {/* Portal — renders into document.body, bypasses navbar's backdrop-filter containing block */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
