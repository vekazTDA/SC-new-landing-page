"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

/** How far the card defocuses once the footer starts arriving. */
const MAX_BLUR = 40;
const MIN_SCALE = 0.92;
const MIN_OPACITY = 0.5;

export default function CtaBannerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // The card pulls out of focus as it scrolls away, letting the footer arrive sharp.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | null = null;

    const apply = () => {
      frame = null;
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;

      const rect = section.getBoundingClientRect();
      const ramp = window.innerHeight * 0.9;
      const progress = Math.min(
        Math.max((window.innerHeight - rect.bottom) / ramp, 0),
        1
      );

      if (progress === 0) {
        card.style.filter = "";
        card.style.transform = "";
        card.style.opacity = "";
        return;
      }

      card.style.filter = `blur(${(progress * MAX_BLUR).toFixed(1)}px)`;
      card.style.transform = `scale(${(1 - progress * (1 - MIN_SCALE)).toFixed(3)})`;
      card.style.opacity = `${(1 - progress * (1 - MIN_OPACITY)).toFixed(3)}`;
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
      className="relative isolate bg-[#EFE9E0] px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 2xl:px-14"
    >
      <div
        ref={cardRef}
        className="relative mx-auto grid max-w-[1636px] items-center gap-8 overflow-hidden rounded-[18px] bg-[#EA9E39] px-6 py-10 will-change-[filter,transform,opacity] sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 lg:px-14 lg:py-16 2xl:px-[106px] 2xl:py-20"
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
