import { StarIcon } from "./icons";

export function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  const full = Math.round(rating);

  return (
    <div className="flex items-center gap-1 text-xs text-neutral-500">
      <span className="flex text-warning">
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} width={13} height={13} filled={i < full} />
        ))}
      </span>
      <span>
        {rating.toFixed(1)}
        {reviewCount !== undefined && ` (${reviewCount})`}
      </span>
    </div>
  );
}
