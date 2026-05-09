import type { Metadata } from "next";
import { PlaceSearch } from "./PlaceSearch";

export const metadata: Metadata = { title: "Places" };

export default function PlacesPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-stack-lg">
      <PlaceSearch />
    </div>
  );
}
