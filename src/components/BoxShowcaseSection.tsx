"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_COUNT = 120;

/** Sampled from the frames' own edges, used only when the frame cannot cover the canvas. */
const BACKDROP = "#A5978C";

/**
 * The extractor leaves a dark 1px column down each side of the landscape frames — a
 * property of the AVFoundation resample, not of the output width or codec: at 2048 wide
 * x0 is still rgb(57,42,31) against rgb(173,159,148) one pixel in. Drawing from an inset
 * source rect drops it — otherwise it shows as a hairline at the section edge, and the
 * edge-stretch below smears it into a full band.
 */
const INSET = 2;

/** The four callouts baked into the video, as real text for screen readers and crawlers. */
const CALLOUTS = [
  {
    title: "Fully Customizable",
    body: "Your team's unique style: Your logo, your colors.",
  },
  {
    title: "Reliability & Speed",
    body: "Clear timelines. Honest communication. Delivery you can trust.",
  },
  {
    title: "Premium Presentation",
    body: "Luxury presentation: acrylic boxes, custom tins and other desired packaging.",
  },
  {
    title: "Inclusive & Clean",
    body: "Gluten-free options, Kosher, no artificial flavors or ingredients.",
  },
];

/**
 * The bounding box of everything that actually matters in a frame — the box and the four
 * callouts — measured across every frame of each set. Everything outside it is bare
 * backdrop, which is what lets us crop to cover.
 *
 * The bottoms used to be 0.925 / 0.841, which was the bottom edge of the "Explore Our
 * Options" pill baked into the video. scripts/build-frames.sh erases that pill, so the
 * lowest thing left is the dashed connector under the bottom-left callout, measured at
 * 0.7828 (horz) and 0.7231 (vert). Keeping the old values would centre a box that is 14%
 * dead space at the bottom, which pushed the whole composition upwards — 233px of empty
 * backdrop below the content against 59px above it at 1920x1080.
 */
const SAFE_BOX = {
  horz: { left: 0.063, top: 0.237, right: 0.915, bottom: 0.785 },
  vert: { left: 0.05, top: 0.129, right: 0.97, bottom: 0.725 },
};

const framePath = (set: "horz" | "vert", index: number) =>
  `/frames/box-${set}/${String(index + 1).padStart(4, "0")}.webp`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Where the tail fade starts, as a fraction of the scrub, and the colour it lands on —
 * the shop section's own background, so the two meet with nothing left to hide.
 */
const TAIL_START = 0.82;
const TAIL_COLOUR = "#241109";

/** Flat at both ends, so the fade has neither a visible start nor a visible finish. */
const smootherstep = (u: number) => u * u * u * (u * (u * 6 - 15) + 10);

/**
 * The fixed header sits over this section, so the top callout has to clear it.
 * SiteHeader publishes its measured height on the root element.
 */
const readHeaderHeight = () => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--header-height"
  );
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
};

export default function BoxShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  const [frameSet, setFrameSet] = useState<"horz" | "vert" | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // Landscape frames on tablet and up, the portrait cut on phones.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      setFrameSet(wide.matches ? "horz" : "vert");
      setReducedMotion(motion.matches);
    };

    sync();
    wide.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  // Start fetching one viewport before the section scrolls into view.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoad]);

  /**
   * Paint a frame so it fills the whole section — no letterbox bands at the edges.
   *
   * The frame is 1.55:1 but laptops are nearer 1.9:1, so a plain contain-fit leaves wide
   * empty strips. Instead we scale up to cover, and only ever crop into the bare backdrop
   * around SAFE_BOX. Where even that is impossible (ultrawide, tablet portrait) we fall
   * back to the largest scale that keeps the content clear of the fixed header and on
   * screen, filling the leftover with the frame's own edge pixels.
   */
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const image = framesRef.current[index];
      if (!canvas || !image?.complete || image.naturalWidth === 0) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      const safe = SAFE_BOX[frameSet ?? "horz"];
      const safeWidth = (safe.right - safe.left) * iw;
      const safeHeight = (safe.bottom - safe.top) * ih;

      // Everything below the fixed header is what the content actually gets to use.
      const headerHeight = readHeaderHeight();
      const usableHeight = Math.max(height - headerHeight, 1);

      const cover = Math.max(width / iw, height / ih);
      const safeMax = Math.min(width / safeWidth, usableHeight / safeHeight);
      const scale = Math.min(cover, safeMax);

      const drawWidth = iw * scale;
      const drawHeight = ih * scale;

      // Centre the *content*, not the frame — horizontally in the canvas, vertically in
      // the space under the header — then keep the frame edge from pulling inside.
      const offsetX = clamp(
        (width - (safe.right - safe.left) * drawWidth) / 2 - safe.left * drawWidth,
        Math.min(width - drawWidth, 0),
        Math.max(width - drawWidth, 0)
      );
      const offsetY = clamp(
        headerHeight +
          (usableHeight - (safe.bottom - safe.top) * drawHeight) / 2 -
          safe.top * drawHeight,
        Math.min(height - drawHeight, 0),
        Math.max(height - drawHeight, 0)
      );

      // Assigning canvas.width/height above resets every 2D context property — the
      // transform, fillStyle and the smoothing settings included, and even a same-value
      // assignment does it. So these are re-applied on every draw rather than once.
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = BACKDROP;
      context.fillRect(0, 0, width, height);

      // Only reachable in the fallback branch. The frame's backdrop is subtly vignetted,
      // so a flat fill leaves a seam — stretch its outermost pixels into the band instead.
      const srcWidth = iw - INSET * 2;
      const srcHeight = ih - INSET * 2;

      if (offsetX > 0.5) {
        context.drawImage(
          image, INSET, INSET, 1, srcHeight,
          0, offsetY, offsetX + 1, drawHeight
        );
        context.drawImage(
          image, iw - 1 - INSET, INSET, 1, srcHeight,
          offsetX + drawWidth - 1, offsetY, offsetX + 1, drawHeight
        );
      }
      if (offsetY > 0.5) {
        context.drawImage(
          image, INSET, INSET, srcWidth, 1,
          offsetX, 0, drawWidth, offsetY + 1
        );
        context.drawImage(
          image, INSET, ih - 1 - INSET, srcWidth, 1,
          offsetX, offsetY + drawHeight - 1, drawWidth, offsetY + 1
        );
      }

      context.drawImage(
        image, INSET, INSET, srcWidth, srcHeight,
        offsetX, offsetY, drawWidth, drawHeight
      );

      // The shop section below is near-black. A gradient band at the section's bottom
      // edge cannot solve that seam: the band sits on the 250svh track while the canvas
      // is pinned, so it slides *across* a stationary image, which is read as a shadow
      // wiping over the box — and the taller the band, the longer the wipe. Tinting the
      // frame instead moves with the canvas, so nothing slides; and because the tint is
      // flat rather than a ramp, there is no edge anywhere on screen to notice. By the
      // last frame the whole viewport is already the shop's colour.
      // Skipped under reduced motion, which pins the final frame — it would render the
      // section as a solid black rectangle.
      if (!reducedMotion) {
        const progress = index / (FRAME_COUNT - 1);
        const tail = clamp((progress - TAIL_START) / (1 - TAIL_START), 0, 1);
        if (tail > 0) {
          context.globalAlpha = smootherstep(tail);
          context.fillStyle = TAIL_COLOUR;
          context.fillRect(0, 0, width, height);
          context.globalAlpha = 1;
        }
      }

      drawnIndexRef.current = index;
    },
    [frameSet, reducedMotion]
  );

  /** Work out which frame belongs at the current scroll position and paint it. */
  const drawCurrent = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    let index = FRAME_COUNT - 1;

    if (!reducedMotion) {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const progress = travel > 0 ? -rect.top / travel : 0;
      index = Math.round(clamp(progress, 0, 1) * (FRAME_COUNT - 1));
    }

    // drawFrame bails if that frame hasn't downloaded yet, leaving drawnIndex
    // stale so a later call retries.
    if (index !== drawnIndexRef.current) drawFrame(index);
  }, [drawFrame, reducedMotion]);

  // Load the chosen frame set; repaint as frames arrive.
  useEffect(() => {
    if (!frameSet || !shouldLoad) return;

    let cancelled = false;
    framesRef.current = [];
    drawnIndexRef.current = -1;

    const images: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const image = new Image();
      image.src = framePath(frameSet, i);
      image.onload = () => {
        if (cancelled) return;
        // Repaint on arrival — after a set switch there may be no scroll event
        // to trigger one, which would leave the previous set's frame on screen.
        drawCurrent();
      };
      images[i] = image;
    }

    framesRef.current = images;
    return () => {
      cancelled = true;
    };
  }, [frameSet, shouldLoad, drawCurrent]);

  // Map scroll position through the section onto a frame index.
  useEffect(() => {
    if (!frameSet || !shouldLoad) return;

    const update = () => {
      rafRef.current = null;
      drawCurrent();
    };

    const onScroll = () => {
      if (rafRef.current === null) rafRef.current = requestAnimationFrame(update);
    };

    const onResize = () => {
      drawnIndexRef.current = -1;
      onScroll();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [frameSet, shouldLoad, drawCurrent]);

  return (
    <section
      ref={sectionRef}
      className={
        "relative bg-[#A5978C] " + (reducedMotion ? "h-svh" : "h-[250svh]")
      }
    >
      {/* The handoff into the shop section is painted into the frame itself (see the
          tail fade in drawFrame), not laid over this track — anything positioned on the
          250svh track slides across the pinned canvas as you scroll. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A Signature gift box with callouts describing what makes the gifting service premium"
          className="h-full w-full"
        />

        <ul className="sr-only">
          {CALLOUTS.map((callout) => (
            <li key={callout.title}>
              <strong>{callout.title}</strong> — {callout.body}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
