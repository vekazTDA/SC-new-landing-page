"use client";

import { useEffect, useRef } from "react";

/**
 * Carries the page from the testimonials section (#241109) to the cream section after
 * it, with no gradient anywhere.
 *
 * A gradient cannot do this without showing itself: any ramp is a visible strip of
 * shading, and placed inside the card section it shades the ground beside the cards.
 * So this is a flat fill whose colour changes as you scroll — the same move the box
 * showcase makes into the shop section. A flat fill has no edge, so there is nothing
 * to see.
 *
 * It has to be taller than the viewport, which is the part that is easy to miss. The
 * colour only changes during the stretch where this block covers the whole screen —
 * neither the testimonials edge above nor the cream edge below is in view, so there is
 * no boundary anywhere for a partly-changed colour to step against. Before that stretch
 * it is exactly #241109 and sits invisibly against the cards; after it, exactly the
 * colour of the section below.
 *
 * That makes the height load-bearing, not a taste call: the change can only happen over
 * (height - viewport), so 100svh is a hard floor — at or under it both edges are on
 * screen at once and the steps this exists to remove come straight back. 115svh is
 * about as short as it goes while the change still reads as smooth rather than a snap.
 */
const FROM = "#241109";
/** AppreciationSection (#EFE9E0) is lg:hidden, so from lg up ContactSection follows. */
const TO_MOBILE = "#EFE9E0";
const TO_DESKTOP = "#F2EDE5";

const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const mix = (from: string, to: string, t: number) => {
  const a = [1, 3, 5].map((i) => parseInt(from.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(to.slice(i, i + 2), 16));
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(", ")})`;
};

export default function SectionHandoff() {
  const ref = useRef<HTMLDivElement>(null);

  // Not gated on prefers-reduced-motion: a colour crossfade is not vestibular motion,
  // and switching it off would put the hard dark-to-cream edge back.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame: number | null = null;

    const apply = () => {
      frame = null;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const t = smootherstep(clamp01(travel > 0 ? -rect.top / travel : 0));
      const to = window.matchMedia("(min-width: 1024px)").matches
        ? TO_DESKTOP
        : TO_MOBILE;
      el.style.backgroundColor = mix(FROM, to, t);
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      // #241109 as the served value, so it matches the cards section before hydration
      className="h-[115svh] w-full bg-[#241109]"
    />
  );
}
