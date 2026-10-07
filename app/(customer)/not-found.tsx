import Link from "next/link";
import { getCategories } from "@/lib/catalog";
import { ButtonLink } from "@/components/ui/Button";
import { SearchForm } from "@/components/customer/SearchForm";

export default async function NotFound() {
  const topLevel = (await getCategories().catch(() => [])).filter((c) => !c.parentId);

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-coral-700">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-800 sm:text-3xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-neutral-600">
        The product may have sold out or the link may be outdated. Try a
        search, or pick a category.
      </p>
      <SearchForm className="mt-6 w-full" />
      <ul className="mt-5 flex flex-wrap justify-center gap-2">
        {topLevel.map((c) => (
          <li key={c.id}>
            <Link
              href={`/category/${c.slug}`}
              className="inline-flex min-h-10 items-center rounded-pill border border-neutral-300 bg-neutral-0 px-4 text-sm font-semibold text-neutral-700 hover:border-navy-800 hover:text-navy-800"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink href="/" className="mt-8">
        Back to homepage
      </ButtonLink>
    </section>
  );
}
