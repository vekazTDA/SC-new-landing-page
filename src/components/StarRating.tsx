import { Star } from "lucide-react";

/**
 * Star row that actually reflects the rating.
 *
 * The modals used to hardcode five filled stars and print the number beside them, so a
 * 4.2 and a 5.0 looked identical. This clips a filled row over an outline row at
 * rating/5, giving real partial fill.
 */
export default function StarRating({
  rating,
  reviewCount,
  colour,
  starSize = "h-3.5 w-3.5",
  textClass = "text-[13px] text-[#76655A]",
}: {
  rating: number;
  reviewCount: number;
  /** Fill/stroke colour; differs per surface, so it is passed in rather than themed. */
  colour: string;
  starSize?: string;
  textClass?: string;
}) {
  const clamped = Math.max(0, Math.min(5, rating));
  const percent = (clamped / 5) * 100;

  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${clamped} out of 5 from ${reviewCount.toLocaleString()} reviews`}
    >
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className={`${starSize} ${colour} opacity-30`} />
          ))}
        </span>
        {/* w-max keeps the inner row at its natural width so the clip reveals it */}
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <span className="flex w-max">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={`${starSize} ${colour} fill-current`} />
            ))}
          </span>
        </span>
      </span>
      <span className={`ml-1 ${textClass}`}>
        {clamped} ({reviewCount.toLocaleString()} reviews)
      </span>
    </div>
  );
}
