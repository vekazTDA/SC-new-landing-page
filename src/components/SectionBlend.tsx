/**
 * Fades a section's bottom edge into the colour of the section below it, so stacked
 * backgrounds change gradually as you scroll instead of meeting at a hard line.
 *
 * Render it as a positioned sibling *before* the section's content wrapper — the content
 * is itself positioned, so it paints over this. Colours come in as props rather than
 * arbitrary Tailwind classes; height stays a className so it keeps responsive utilities.
 */
export default function SectionBlend({
  to,
  className = "",
  mid,
  from,
  via,
}: {
  /** The colour of the section below — the gradient must land exactly on it. */
  to: string;
  className?: string;
  /**
   * Optional mid stop, e.g. `{ at: "80%", alpha: 0.15 }`. Holds the ramp almost invisible
   * for most of its length and concentrates the fade at the very bottom, so the blend can
   * run long without washing out copy that sits near the section's bottom edge.
   */
  mid?: { at: string; alpha: number };
  /**
   * The section's own colour. Passing it (with `via`) switches to an opaque ramp, which
   * is what a big luminance jump needs: alpha-fading a light colour over a dark one goes
   * through grey no matter what, and grey is off-palette here.
   */
  from?: string;
  /** Hand-picked intermediate stops for the opaque ramp, keeping the hue warm throughout. */
  via?: { at: string; color: string }[];
}) {
  const stops =
    via && from
      ? [
          `${from} 0%`,
          ...via.map((stop) => `${stop.color} ${stop.at}`),
          `${to} 100%`,
        ].join(", ")
      : mid
        ? `${withAlpha(to, 0)} 0%, ${withAlpha(to, mid.alpha)} ${mid.at}, ${to} 100%`
        : `${withAlpha(to, 0)}, ${to}`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}
      style={{ backgroundImage: `linear-gradient(to bottom, ${stops})` }}
    />
  );
}

/**
 * `#AC9D93` + 0.15 -> `#AC9D9326`. The zero-alpha start matters: CSS `transparent` is
 * `rgba(0,0,0,0)`, so a gradient from it drags every channel toward black on the way up
 * and dirties the ramp. Starting from the target colour at zero alpha interpolates alpha
 * only. Falls back to the raw value for non-hex colours.
 */
function withAlpha(colour: string, alpha: number) {
  if (!/^#[0-9a-f]{6}$/i.test(colour)) return colour;
  const byte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${colour}${byte.toString(16).padStart(2, "0")}`;
}
