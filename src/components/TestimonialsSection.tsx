"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import SectionBlend from "./SectionBlend";
import { TESTIMONIALS } from "@/data/testimonials";

const COLOR_DISABLED = "#4F2B1C";
const COLOR_ACTIVE = "#9E9E9E";
const COLOR_BOTH_ACTIVE = "#FFFFFF";

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="15"
      viewBox="0 0 28 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0.28105 7.74491C-0.0936756 7.37018 -0.0936756 6.76263 0.28105 6.38791L6.38754 0.281417C6.76226 -0.0933075 7.36981 -0.0933075 7.74454 0.281417C8.11926 0.656142 8.11926 1.26369 7.74454 1.63841L2.31655 7.06641L7.74454 12.4944C8.11926 12.8691 8.11926 13.4767 7.74454 13.8514C7.36981 14.2261 6.76226 14.2261 6.38754 13.8514L0.28105 7.74491ZM27.8267 7.06641V8.02595H0.959549V7.06641V6.10686H27.8267V7.06641Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="15"
      viewBox="0 0 28 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M27.5457 7.74491C27.9204 7.37018 27.9204 6.76263 27.5457 6.38791L21.4392 0.281417C21.0645 -0.0933075 20.4569 -0.0933075 20.0822 0.281417C19.7075 0.656142 19.7075 1.26369 20.0822 1.63841L25.5102 7.06641L20.0822 12.4944C19.7075 12.8691 19.7075 13.4767 20.0822 13.8514C20.4569 14.2261 21.0645 14.2261 21.4392 13.8514L27.5457 7.74491ZM0 7.06641V8.02595H26.8672V7.06641V6.10686H0V7.06641Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const hasOverflow = maxScroll > 1;
      setCanScrollLeft(hasOverflow && scroller.scrollLeft > 1);
      setCanScrollRight(hasOverflow && scroller.scrollLeft < maxScroll - 1);
    };

    update();
    const frame = requestAnimationFrame(update);

    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    for (const child of scroller.children) {
      observer.observe(child);
    }

    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector("article");
    const amount = (card?.clientWidth ?? 360) + 24;
    scroller.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  const canScroll = canScrollLeft || canScrollRight;
  const bothActive = canScrollLeft && canScrollRight;

  const leftColor = !canScrollLeft
    ? COLOR_DISABLED
    : bothActive
      ? COLOR_BOTH_ACTIVE
      : COLOR_ACTIVE;
  const rightColor = !canScrollRight
    ? COLOR_DISABLED
    : bothActive
      ? COLOR_BOTH_ACTIVE
      : COLOR_ACTIVE;

  return (
    <section className="relative isolate flex min-h-0 flex-col justify-center overflow-hidden bg-[#241109] lg:min-h-svh">
      {/* Near-black to cream is the biggest jump on the page, and an alpha fade through
          it lands on grey — off-palette, and it read as a stripe sitting in the dead
          space rather than a transition. This is an opaque ramp through the brand browns
          instead, held almost at the section colour for the first half so it can run long
          without reaching the cards (dead space below them measures 142px at 1280x700). */}
      <SectionBlend
        to="#F2EDE5"
        from="#241109"
        via={[
          { at: "50%", color: "#331B10" },
          { at: "72%", color: "#6E4A33" },
          { at: "88%", color: "#BBA48F" },
        ]}
        className="h-16 sm:h-56 lg:h-[280px]"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-[1728px] px-6 pb-6 pt-[min(3.5rem,6svh)] sm:px-10 sm:pb-[min(4rem,7svh)] lg:px-12 lg:pb-[min(7rem,10svh)] 2xl:px-14">
        <h2
          className="text-center text-3xl text-[#FCD5AD] sm:text-4xl lg:text-[2.5rem]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          What Our Client Says:
        </h2>

        <div
          ref={scrollerRef}
          className="mt-[min(2.5rem,4svh)] flex w-full min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 lg:mt-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex w-[300px] shrink-0 snap-start flex-col items-center gap-[min(1.5rem,3svh)] rounded-md bg-[#4F2B1C] px-5 py-[min(2.5rem,5svh)] sm:w-[320px] lg:w-[calc((100%-4.5rem)/4)] lg:min-w-0 lg:px-6"
            >
              <p
                className="text-center text-base leading-[min(2.125em,3.4svh)] text-white"
                style={{ fontFamily: "var(--font-display-body)" }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-[#E3A33B] text-[#E3A33B]" />
                ))}
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-white/60">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>

        {canScroll && (
          <div className="mt-[min(2rem,3svh)] mb-6 flex justify-center gap-3 sm:mb-8">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous testimonial"
              className="flex h-10 w-[4.5rem] items-center justify-center rounded-full border transition-colors disabled:cursor-default"
              style={{ borderColor: leftColor, color: leftColor }}
            >
              <ArrowLeftIcon className="h-[15px] w-7" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canScrollRight}
              aria-label="Next testimonial"
              className="flex h-10 w-[4.5rem] items-center justify-center rounded-full border transition-colors disabled:cursor-default"
              style={{ borderColor: rightColor, color: rightColor }}
            >
              <ArrowRightIcon className="h-[15px] w-7" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
