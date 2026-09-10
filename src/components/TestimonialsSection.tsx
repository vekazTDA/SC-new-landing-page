"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/data/testimonials";

export default function TestimonialsSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      // Compare content width vs visible width; allow 1px subpixel tolerance.
      setCanScroll(scroller.scrollWidth - scroller.clientWidth > 1);
    };

    update();
    const frame = requestAnimationFrame(update);

    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    for (const child of scroller.children) {
      observer.observe(child);
    }

    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-[#241109]">
      {/* Fills what used to be dead space below the arrows, softening the hard
          near-black to cream edge where the contact section begins. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#F2EDE5] sm:h-20 lg:h-28"
      />

      <div className="relative mx-auto w-full min-w-0 max-w-[1728px] px-6 pb-[min(4rem,7svh)] pt-[min(3.5rem,6svh)] sm:px-10 lg:px-12 lg:pb-[min(7rem,10svh)] 2xl:px-14">
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
          <div className="mt-[min(2rem,3svh)] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8C7E74] text-[#F0E7DE] transition-colors hover:border-[#FCD5AD] hover:text-[#FCD5AD]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#8C7E74] text-[#F0E7DE] transition-colors hover:border-[#FCD5AD] hover:text-[#FCD5AD]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
