"use client";

export function NavSearch() {
  return (
    <div className="relative w-full">
      <span
        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px] select-none pointer-events-none"
      >
        search
      </span>
      <input
        type="search"
        placeholder="Search culinary treatises…"
        className="
          w-full bg-surface-container-low border-none rounded-full
          py-2 pl-10 pr-4
          type-body-md text-on-surface placeholder:text-secondary/60
          focus:outline-none focus:ring-2 focus:ring-primary/20
          transition-all
        "
      />
    </div>
  );
}
