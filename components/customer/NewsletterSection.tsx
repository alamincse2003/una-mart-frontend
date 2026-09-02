export function NewsletterSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="rounded-lg bg-navy-800 px-6 py-12 text-center sm:px-10">
        <h2 className="text-2xl font-bold text-neutral-0">
          Get exclusive offers
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy-100">
          Subscribe for new arrivals, deals and member-only pricing.
        </p>
        <form className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            className="w-full flex-1 rounded-md border border-neutral-0/20 bg-neutral-0/10 px-4 py-3 text-sm text-neutral-0 outline-none placeholder:text-navy-200 focus:border-coral-400"
          />
          <button type="submit" className="btn-cta whitespace-nowrap">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
