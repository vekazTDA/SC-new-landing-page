import SectionBlend from "./SectionBlend";

export default function Hero() {
  return (
    <section
      id="top"
      // Desktop keeps its horizontal gradient. Mobile letterboxes the 16:9 video, so it
      // gets a vertical ramp between the video's own edge tones instead — see the video
      // element below.
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-[linear-gradient(91deg,#867971_29%,#6F625A_98%)] max-sm:bg-[linear-gradient(to_bottom,#7D6F66,#8F8178)]"
    >
      {/* reserves the space the fixed site header floats over (measured at runtime,
          with a per-breakpoint fallback for the first paint) */}
      <div className="h-[var(--header-height,84px)] shrink-0 sm:h-[var(--header-height,72px)] lg:h-[var(--header-height,84px)] 2xl:h-[var(--header-height,108px)]" />

      {/* fills whatever is left of the screen, so nothing below can peek in */}
      <div className="relative flex min-h-[380px] flex-1 flex-col justify-between">
        {/* Desktop: full-bleed, cover-cropped — unchanged.
            Mobile: the 16:9 source cannot cover a tall screen without cropping the box
            away, so the wrapper takes the video's own aspect and centres it. Colour
            matching the letterbox was not enough — the video's edge rows vary across the
            width (top row spans 136,121,113 to 103,90,84), so any single band colour
            still shows a line at the ends. Fading the video's own top and bottom edges
            out instead means there is no edge left to see. */}
        <div className="absolute inset-0 max-sm:inset-y-auto max-sm:top-1/2 max-sm:aspect-[16/9] max-sm:h-auto max-sm:-translate-y-1/2 max-sm:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)] max-sm:[mask-image:linear-gradient(to_bottom,transparent_0%,#000_14%,#000_86%,transparent_100%)]">
          <video
            className="h-full w-full bg-transparent object-cover"
            poster="/images/hero-box.png"
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
          >
            <source src="/videos/hero-box.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Runs the hero into the products section so the boundary disappears.
            The bottom copy sits close to the section edge (91px at 2xl, 24px at base),
            and a plain linear fade put 0.36 alpha behind the 16px line — 3.42:1, under
            the 4.5:1 AA floor. Measured budget is alpha <= 0.205 there, so the ramp is
            held at 0.15 for its first 80% and only finishes over the last fifth; the
            heights keep that 80% mark above the copy at every breakpoint. */}
        <SectionBlend
          to="#AC9D93"
          mid={{ at: "80%", alpha: 0.15 }}
          className="h-28 sm:h-36 lg:h-48 2xl:h-[420px]"
        />

        <div className="relative z-10 flex flex-col items-center px-6 pt-5 text-center sm:pt-6 lg:pt-6 2xl:pt-8">
          {/* One h1 carrying the whole phrase — the two lines are styled spans, so
              crawlers read "A Gift that Will Be Remembered." rather than half of it.
              The trailing space keeps the lines separate words in the text content. */}
          <h1 className="flex flex-col items-center">
            <span
              className="text-[13.606px] font-medium uppercase leading-[1.35] tracking-[2.721px] text-[#EFE9E0] sm:text-sm lg:text-base 2xl:text-2xl"
              style={{ fontFamily: "var(--font-sans-tight)" }}
            >
              A Gift that{" "}
            </span>
            <span
              className="mt-1 max-w-3xl text-[51.417px] font-normal capitalize italic leading-[0.99] text-[#EFE9E0] lg:max-w-3xl lg:text-5xl 2xl:max-w-6xl 2xl:text-[6.125rem]"
              style={{ fontFamily: "var(--font-serif-display)" }}
            >
              Will Be Remembered.
            </span>
          </h1>
        </div>

        {/* This copy sits over a moving, mostly light part of the video: measured 3.55:1
            at 1280 and 4.32:1 at 402 with no blend at all, both under the 4.5:1 AA floor.
            The shadow is a legibility mitigation, not a WCAG fix — the real fix is to
            reposition the copy or give it a scrim, tracked separately. */}
        <div
          className="relative z-10 flex flex-col items-center gap-2 px-6 pb-6 text-center sm:pb-8 lg:gap-3 lg:pb-10 2xl:gap-4 2xl:pb-[5.7rem]"
          style={{ textShadow: "0 1px 4px rgba(20, 13, 10, 0.6)" }}
        >
          <p
            className="max-w-md text-center text-[14.42px] font-normal capitalize leading-[1.15] text-[#EFE9E0] sm:max-w-xl sm:text-xl lg:max-w-2xl lg:text-2xl 2xl:max-w-[1175px] 2xl:text-[2.391rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            Premium Corporate Gifts In Stunning, Customizable Packaging.
          </p>
          <p
            className="text-center text-[12.69px] font-normal italic leading-[1.45] text-[#EFE9E0] sm:text-xs lg:text-sm 2xl:text-base"
            style={{ fontFamily: "var(--font-sans-tight)" }}
          >
            Fast Turnaround. White-Glove Service.
          </p>

          {/* Figma 36:952 — 201.84x44.6, radius 9, rgba(79,43,28,.86), Inter 600 10px at
              31% tracking. Mobile only; the design has no hero CTA from sm up. The 10px
              top margin plus the parent's 8px gap makes the 18.5px the node sits at.
              text-shadow is cleared: the parent sets one for copy over the video, and it
              only muddies a label on a solid fill. */}
          <a
            href="#corporate-gifting"
            className="mt-[10px] flex h-[44.6px] w-[201.84px] items-center justify-center rounded-[9px] bg-[#4F2B1C]/[0.86] text-[10px] font-semibold uppercase leading-[1.35] tracking-[3.1px] text-[#F0E7DE] transition-opacity hover:opacity-90 sm:hidden"
            style={{ fontFamily: "var(--font-sans)", textShadow: "none" }}
          >
            Explore options
          </a>
        </div>
      </div>
    </section>
  );
}
