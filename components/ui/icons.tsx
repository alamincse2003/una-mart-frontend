// Icons come from lucide-react directly. This file only adds what lucide
// doesn't provide out of the box.
import { Star, type LucideProps } from "lucide-react";

// Star needs a `filled` toggle (outline vs solid) for rating displays.
export function StarIcon({
  filled,
  ...props
}: LucideProps & { filled?: boolean }) {
  return <Star fill={filled ? "currentColor" : "none"} {...props} />;
}
