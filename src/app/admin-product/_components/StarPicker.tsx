"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) / 2); // 0.5 … 5.0

/**
 * Click-to-set rating, in half-star steps.
 *
 * Each star is two hit areas — left half sets x.5, right half sets x.0 — which is how
 * every rating widget people already know behaves. Hovering previews the value without
 * committing, so an accidental mouse-over never edits the product.
 */
export default function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        Rating
      </span>

      <div className="flex items-center gap-2">
        <div
          className="relative flex"
          onMouseLeave={() => setHover(null)}
          role="group"
          aria-label="Star rating"
        >
          {[0, 1, 2, 3, 4].map((index) => {
            const fill = Math.max(0, Math.min(1, shown - index));
            return (
              <span key={index} className="relative h-7 w-7">
                <Star className="absolute inset-0 m-auto h-6 w-6 text-[#C5A880] opacity-25" />
                <span
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="absolute inset-y-0 left-0 my-auto h-6 w-6 w-max fill-[#C5A880] text-[#C5A880]" />
                </span>
                {/* two hit areas per star: left half = .5, right half = .0 */}
                {[0.5, 1].map((offset) => (
                  <button
                    key={offset}
                    type="button"
                    aria-label={`Set rating to ${index + offset}`}
                    onMouseEnter={() => setHover(index + offset)}
                    onFocus={() => setHover(index + offset)}
                    onClick={() => onChange(index + offset)}
                    className="absolute inset-y-0 w-1/2 cursor-pointer"
                    style={{ left: offset === 0.5 ? 0 : "50%" }}
                  />
                ))}
              </span>
            );
          })}
        </div>

        <select
          value={value}
          onChange={(event) => onChange(Number.parseFloat(event.target.value))}
          aria-label="Rating value"
          className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-sm text-white outline-none focus:border-[#C5A880]"
        >
          {STEPS.map((step) => (
            <option key={step} value={step} className="bg-[#171010]">
              {step.toFixed(1)}
            </option>
          ))}
        </select>
      </div>

      <span className="text-[11px] leading-snug text-white/35">
        Click a star&rsquo;s left or right half for half steps. The card shows a partly
        filled star, so 4.5 and 5.0 look different.
      </span>
    </div>
  );
}
