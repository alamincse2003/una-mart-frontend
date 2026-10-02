"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";

// Route-level error boundary for the storefront. Keeps header/footer, so
// shoppers can still navigate; "Try again" re-renders the failed segment.
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook an error tracker (e.g. Sentry) in here before launch.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <h1 className="text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        Something went wrong on our side
      </h1>
      <p className="mt-3 text-neutral-600">
        Please try again. If it keeps happening, call us at{" "}
        <a href={SUPPORT_PHONE_HREF} className="font-semibold text-navy-600 underline">
          {SUPPORT_PHONE}
        </a>{" "}
        and we&apos;ll take your order by phone.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw aria-hidden width={16} height={16} />
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary">
          Go to homepage
        </ButtonLink>
      </div>
    </section>
  );
}
