import { Suspense } from "react";
import type { Metadata } from "next";
import { DishSearch } from "./DishSearch";

export const metadata: Metadata = { title: "Dishes" };

export default function DishesPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
      <Suspense>
        <DishSearch />
      </Suspense>
    </div>
  );
}
