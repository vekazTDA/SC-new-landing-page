"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

/** How far the card defocuses at either end of its pass through the viewport. */
const MAX_BLUR = 40;
const MIN_SCALE = 0.92;
const MIN_OPACITY = 0.5;

/**
 * Ramp lengths as a fraction of the viewport. The card is 815 of 900px tall, so with the
 * exit ramp used on both sides it would only be sharp for ~184px of scroll — it never
 * looks settled. A shorter entry ramp resolves it sooner and leaves ~455px sharp; the
 * blur, scale and opacity are identical in both directions.
 */
const ENTER_RAMP = 0.6;
const EXIT_RAMP = 0.9;

export default function CtaBannerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // The card arrives out of focus, sharpens as it rises into place, then pulls back out
  // of focus on its way past — so the footer arrives sharp.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | null = null;

    const apply = () => {
      frame = null;
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

      // How far the section has risen in (0 while still below the fold, 1 once settled)
      // and how far it has since climbed out of the top.
      const entered = clamp((viewport - rect.top) / (viewport * ENTER_RAMP));
      const left = clamp((viewport - rect.bottom) / (viewport * EXIT_RAMP));
      const defocus = Math.max(1 - entered, left);

      if (defocus === 0) {
        card.style.filter = "";
        card.style.transform = "";
        card.style.opacity = "";
        return;
      }

      card.style.filter = `blur(${(defocus * MAX_BLUR).toFixed(1)}px)`;
      card.style.transform = `scale(${(1 - defocus * (1 - MIN_SCALE)).toFixed(3)})`;
      card.style.opacity = `${(1 - defocus * (1 - MIN_OPACITY)).toFixed(3)}`;
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
    // deliberately no overflow-hidden — the blur has to bleed past the card edges
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-svh flex-col justify-center bg-[#EFE9E0] px-4 py-[min(2.5rem,4svh)] sm:px-8 lg:px-12 lg:py-[min(4rem,6svh)] 2xl:px-14"
    >
      <div
        ref={cardRef}
        className="relative mx-auto grid max-w-[1636px] items-center gap-8 overflow-hidden rounded-[18px] bg-[#EA9E39] px-6 py-[min(2.5rem,5svh)] will-change-[filter,transform,opacity] sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:px-14 lg:py-[min(4rem,7svh)] 2xl:px-[106px]"
      >
        <div>
          <h2
            className="text-4xl uppercase italic leading-[1.2] text-[#532402] sm:text-5xl lg:text-6xl 2xl:text-[5.125rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            Ready to Send a Gift That Stands Out?
          </h2>

          <p
            className="mt-6 max-w-lg text-base leading-snug text-[#281006] sm:text-lg 2xl:mt-10 2xl:text-[1.375rem]"
            style={{ fontFamily: "var(--font-display-body)" }}
          >
            Share your vision, and our team will handle the rest, from custom
            recommendations to flawless execution.
          </p>

          <p
            className="mt-8 text-xl font-bold uppercase leading-tight text-[#281006] sm:text-2xl 2xl:mt-14 2xl:text-[2.1875rem]"
            style={{ fontFamily: "var(--font-display-body)" }}
          >
            Receive 10% off your first order.
          </p>

          <a
            href="#contact"
            className="mt-6 inline-flex items-center gap-0.5 rounded-full bg-[#281006] px-7 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 sm:px-8 2xl:mt-8 2xl:text-xl"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Contact Us Today
            <ArrowUpRight className="h-5 w-5 shrink-0 2xl:h-6 2xl:w-6" />
          </a>
        </div>

        <div className="relative aspect-[774/641] w-full">
          <div
            aria-hidden="true"
            className="absolute inset-x-[3%] bottom-[6%] top-[33%] rounded-full bg-[#AA7125]/60 blur-[13px]"
          />
          <Image
            src="/images/cta/gift-box.png"
            alt="Signature magnetic gift box"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
