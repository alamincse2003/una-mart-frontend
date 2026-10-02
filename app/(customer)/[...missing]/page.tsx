import { notFound } from "next/navigation";

// Any URL no other route matches renders the storefront's own 404 (with
// header, search and footer) instead of Next's bare root 404.
export default function CatchAllNotFound() {
  notFound();
}
