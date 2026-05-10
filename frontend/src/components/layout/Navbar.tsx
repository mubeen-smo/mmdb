import Link from "next/link";
import { NavSearch } from "./NavSearch";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { MobileSearch } from "./MobileSearch";

export function Navbar() {
  return (
    <header className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
      <nav className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-14 md:h-20 w-full max-w-container-max mx-auto">

        {/* Left: hamburger (mobile) + logo + links (lg+) */}
        <div className="flex items-center gap-3 lg:gap-8 shrink-0">
          <MobileNav />
          <Link
            href="/"
            className="font-display text-xl font-extrabold text-primary tracking-tighter leading-none transition-opacity duration-200 hover:opacity-80 relative z-[201]"
          >
            MMDb
          </Link>
          <NavLinks />
        </div>

        {/* Center: search pill — lg+ only */}
        <div className="hidden lg:block flex-1 max-w-md mx-6">
          <NavSearch />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 lg:gap-4 shrink-0">

          {/* Mobile search icon */}
          <MobileSearch />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Ask MMDb — circular button on all breakpoints */}
          <Link
            href="/ask"
            aria-label="Ask MMDb"
            className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-lg shrink-0"
          >
            <span
              className="material-symbols-outlined select-none"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "20px" }}
            >
              chat_bubble
            </span>
          </Link>

        </div>

      </nav>
    </header>
  );
}
