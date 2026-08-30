const LINK_COLUMNS: { title: string; links: string[] }[] = [
  { title: "About", links: ["About Us", "Contact", "Careers"] },
  { title: "Help", links: ["FAQ", "Shipping Info", "Returns"] },
  { title: "Legal", links: ["Privacy Policy", "Terms & Conditions"] },
];

const PAYMENT_METHODS = ["bKash", "Nagad", "Cash on Delivery"];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-extrabold text-neutral-0">
              UNA <span className="text-coral-400">Mart</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-200">
              Everything you need, in one place — gadgets, groceries and more,
              delivered across Bangladesh.
            </p>
          </div>

          {LINK_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-neutral-0">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-navy-200 transition-colors hover:text-neutral-0"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-navy-700 pt-6 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} UNA Mart. All rights reserved.
          </span>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-md bg-navy-800 px-2.5 py-1 font-semibold text-navy-100"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
