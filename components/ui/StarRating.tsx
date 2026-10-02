import { StarIcon } from "./icons";

export function StarRating({
  rating,
  reviewCount,
  size = 13,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
}) {
  const full = Math.round(rating);

  return (
    <div className="flex items-center gap-1 text-xs text-neutral-600">
      <span
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
        className="flex text-warning"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <StarIcon key={i} aria-hidden width={size} height={size} filled={i < full} />
        ))}
      </span>
      <span aria-hidden className="font-medium text-neutral-700">
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span>
          ({reviewCount.toLocaleString("en-US")}
          <span className="sr-only"> reviews</span>)
        </span>
      )}
    </div>
  );
}
