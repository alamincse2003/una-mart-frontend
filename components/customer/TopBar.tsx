// Dark utility bar above the main header — support contact, the delivery
// promise, and quick help links. Hidden on small screens; the main header
// and mobile menu carry all critical actions.
import Link from "next/link";
import { Phone, Truck } from "lucide-react";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/site";

export function TopBar() {
  return (
    <div className="hidden bg-navy-900 text-xs font-medium text-navy-100 md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href={SUPPORT_PHONE_HREF}
          className="flex items-center gap-1.5 transition-colors hover:text-neutral-0"
        >
          <Phone aria-hidden width={13} height={13} />
          Order by phone: {SUPPORT_PHONE}
        </a>

        <p className="flex items-center gap-1.5">
          <Truck aria-hidden width={14} height={14} className="text-coral-200" />
          Free delivery inside Dhaka · Cash on Delivery nationwide
        </p>

        <div className="flex items-center gap-5">
          <Link href="/track-order" className="transition-colors hover:text-neutral-0">
            Track Order
          </Link>
          <Link href="/contact" className="transition-colors hover:text-neutral-0">
            Help
          </Link>
        </div>
      </div>
    </div>
  );
}
