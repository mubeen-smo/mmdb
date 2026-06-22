"use client";

import { usePathname } from "next/navigation";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // /ask uses position:fixed for the chat UI — transform on an ancestor breaks fixed positioning,
  // so we skip the page-enter animation on that route
  const isChat = pathname === "/ask";
  return (
    <div key={pathname} className={isChat ? "" : "animate-page-enter"}>
      {children}
    </div>
  );
}
