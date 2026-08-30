export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-0">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-600 sm:px-6">
        <p className="font-semibold text-navy-800">UNA Mart</p>
        <p className="mt-1">Everything you need, in one place.</p>
        <p className="mt-4 text-neutral-500">
          &copy; {new Date().getFullYear()} UNA Mart. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
