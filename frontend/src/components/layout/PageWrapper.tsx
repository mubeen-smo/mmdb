"use client";

import { usePathname } from "next/navigation";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // key change forces remount → CSS animation replays on every navigation
  return (
    <div key={pathname} className="animate-page-enter">
      {children}
    </div>
  );
}
