import type { Metadata } from "next";
import { PageBanner } from "@/components/customer/PageBanner";
import { WishlistView } from "@/components/customer/WishlistView";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false },
};

export default function WishlistPage() {
  return (
    <>
      <PageBanner
        title="Wishlist"
        description="Items you've saved on this device. Add them to your cart whenever you're ready."
      />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <WishlistView />
      </section>
    </>
  );
}
