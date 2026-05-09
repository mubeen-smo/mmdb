import Link from "next/link";
import { NavSearch } from "./NavSearch";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { MobileSearch } from "./MobileSearch";

export function Navbar() {
  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-40 w-full border-b border-outline-variant/30 transition-colors duration-300">
      <nav className="flex items-center justify-between px-margin-mobile md:px-margin-desktop py-4 w-full max-w-container-max mx-auto gap-3">

        {/* Left: hamburger (mobile) + logo + links (desktop) */}
        <div className="flex items-center gap-3 shrink-0">
          <MobileNav />
          <Link
            href="/"
            className="font-display text-xl font-extrabold text-primary tracking-tighter leading-none transition-opacity duration-200 hover:opacity-80"
          >
            MMDb
          </Link>
          <NavLinks />
        </div>

        {/* Center: search pill — desktop only */}
        <div className="hidden md:block flex-1 max-w-xs sm:max-w-sm md:max-w-md">
          <NavSearch />
        </div>

        {/* Right: mobile search + theme toggle + ask */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileSearch />
          <ThemeToggle />
          <Link
            href="/ask"
            aria-label="Ask MMDb"
            className="flex items-center gap-2 bg-primary text-on-primary rounded-full px-4 py-2 type-label-sm hover:bg-primary-container transition-all duration-200 active:scale-95"
          >
            <span
              className="material-symbols-outlined text-[18px] select-none"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="hidden sm:inline">Ask MMDb</span>
          </Link>
        </div>

      </nav>
    </header>
  );
}
