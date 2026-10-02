"use client";

import { Suspense } from "react";
import Form from "next/form";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface SearchFormProps {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
}

// GET form to /search?q=… — works before hydration (plain HTML form) and
// uses client-side navigation after (next/form). Used in the header,
// mobile menu, and 404 page.
export function SearchForm(props: SearchFormProps) {
  // useSearchParams needs a Suspense boundary or every static page using
  // the header would bail out of prerendering.
  return (
    <Suspense fallback={<SearchFormView {...props} current="" />}>
      <SearchFormWithQuery {...props} />
    </Suspense>
  );
}

function SearchFormWithQuery(props: SearchFormProps) {
  const current = useSearchParams().get("q") ?? "";
  return <SearchFormView {...props} current={current} />;
}

function SearchFormView({
  className = "",
  autoFocus = false,
  onSubmitted,
  current,
}: SearchFormProps & { current: string }) {
  return (
    <Form
      action="/search"
      role="search"
      onSubmit={onSubmitted}
      className={`flex items-center rounded-pill border border-neutral-300 bg-neutral-0 pl-4 pr-1 transition-[border-color,box-shadow] focus-within:border-navy-400 focus-within:ring-3 focus-within:ring-navy-400/20 ${className}`}
    >
      <input
        // key resets the uncontrolled value when the URL query changes
        key={current}
        type="search"
        name="q"
        defaultValue={current}
        autoFocus={autoFocus}
        enterKeyHint="search"
        autoComplete="off"
        aria-label="Search products"
        placeholder="Search products, brands and categories"
        className="h-10 w-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500 focus-visible:outline-none sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-navy-800 text-neutral-0 transition-colors hover:bg-navy-600"
      >
        <Search aria-hidden width={16} height={16} />
      </button>
    </Form>
  );
}
