"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/places", label: "Places" },
  { href: "/dishes", label: "Dishes" },
  { href: "/guides", label: "Guides" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="hidden lg:flex items-center gap-6">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={[
                "type-body-md transition-colors duration-200 relative pb-1",
                active
                  ? "text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
                  : "text-secondary hover:text-primary",
              ].join(" ")}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
