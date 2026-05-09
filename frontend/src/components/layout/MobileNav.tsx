"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/places", label: "Places" },
  { href: "/dishes", label: "Dishes" },
  { href: "/guides", label: "Guides" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="md:hidden p-1 text-secondary hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[26px] select-none">menu</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30">
          <span
            className="text-xl font-extrabold text-primary tracking-tighter leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MMDb
          </span>
          <button
            onClick={() => setOpen(false)}
            className="text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px] select-none">close</span>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl type-body-lg transition-colors ${
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
