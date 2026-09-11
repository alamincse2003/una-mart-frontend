// Thin re-exports over lucide-react, kept under the names already used
// throughout the storefront (HeartIcon, CartIcon, etc.) so call sites
// didn't need to change when we switched from hand-rolled SVGs to
// lucide-react. New icons should be added here, not imported from
// "lucide-react" directly in components — this file is the single place
// that maps our icon names to the underlying library.
import {
  ArrowRight,
  Heart,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  User,
  X,
  type LucideProps,
} from "lucide-react";

export const SearchIcon = Search;
export const HeartIcon = Heart;
export const CartIcon = ShoppingCart;
export const ArrowRightIcon = ArrowRight;
export const TruckIcon = Truck;
export const ShieldIcon = ShieldCheck;
export const RefreshIcon = RefreshCw;
export const TrashIcon = Trash2;
export const CloseIcon = X;
export const MenuIcon = Menu;
export const UserIcon = User;

// Star needs a `filled` toggle (outline vs solid) for rating displays,
// which lucide's base Star doesn't provide on its own.
export function StarIcon({
  filled,
  ...props
}: LucideProps & { filled?: boolean }) {
  return <Star fill={filled ? "currentColor" : "none"} {...props} />;
}
