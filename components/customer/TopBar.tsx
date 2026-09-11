// Dark utility bar above the main header — contact info, a shipping
// announcement, and order-tracking, matching the approved Figma reference.
// Hidden on small screens; the main header carries all critical actions.
import { Mail, Phone } from "lucide-react";

const SUPPORT_PHONE = "+880 1XXX-XXXXXX";
const SUPPORT_EMAIL = "support@unamart.com";

export function TopBar() {
  return (
    <div className="hidden bg-navy-900 px-4 py-2 text-xs font-medium text-navy-100 sm:block sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s|-/g, "")}`}
            className="flex items-center gap-1.5 transition-colors hover:text-neutral-0"
          >
            <Phone width={13} height={13} />
            {SUPPORT_PHONE}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="hidden items-center gap-1.5 transition-colors hover:text-neutral-0 md:flex"
          >
            <Mail width={13} height={13} />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <span className="font-semibold tracking-wide">
          Free delivery inside Dhaka
        </span>

        <div className="flex items-center gap-4">
          <a href="#" className="transition-colors hover:text-neutral-0">
            Compare
          </a>
          <a
            href="/account/orders"
            className="transition-colors hover:text-neutral-0"
          >
            Track Order
          </a>
        </div>
      </div>
    </div>
  );
}
