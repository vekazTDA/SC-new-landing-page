"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionBlend from "./SectionBlend";

const FRAME_COUNT = 120;

/** Sampled from the frames' own edges, used only when the frame cannot cover the canvas. */
const BACKDROP = "#A5978C";

/**
 * The extractor left a dark 1px column down each side of the landscape frames
 * (x0 is rgb(81,65,54) against rgb(175,161,152) two pixels in). Drawing from an
 * inset source rect drops it — otherwise it shows as a hairline at the section
 * edge, and the edge-stretch below smears it into a full band.
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
 * The bounding box of everything that actually matters in a frame — the box, the four
 * callouts and the CTA pill — measured from the busiest frame (0120) of each set.
 * Everything outside it is bare backdrop, which is what lets us crop to cover.
 */
const SAFE_BOX = {
  horz: { left: 0.063, top: 0.237, right: 0.915, bottom: 0.925 },
  vert: { left: 0.05, top: 0.129, right: 0.97, bottom: 0.841 },
};

/** Where the video's own "Explore Our Options" pill sits, as a fraction of the frame. */
const CTA_BOX = {
  horz: { top: 0.866, left: 0.5, width: 0.165, height: 0.06 },
  vert: { top: 0.795, left: 0.5, width: 0.46, height: 0.055 },
};

const framePath = (set: "horz" | "vert", index: number) =>
  `/frames/box-${set}/${String(index + 1).padStart(4, "0")}.jpg`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

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
  const linkRef = useRef<HTMLAnchorElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const drawnIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  const [frameSet, setFrameSet] = useState<"horz" | "vert" | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  // which set finished loading — compared against frameSet so a set switch resets readiness
  const [loadedSet, setLoadedSet] = useState<"horz" | "vert" | null>(null);
  const ready = loadedSet !== null && loadedSet === frameSet;

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

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      drawnIndexRef.current = index;

      // The pill lives inside the frame, so track the drawn rect rather than the canvas.
      const link = linkRef.current;
      if (link) {
        const box = CTA_BOX[frameSet ?? "horz"];
        link.style.left = `${offsetX + box.left * drawWidth}px`;
        link.style.top = `${offsetY + box.top * drawHeight}px`;
        link.style.width = `${box.width * drawWidth}px`;
        link.style.height = `${box.height * drawHeight}px`;
      }
    },
    [frameSet]
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
    let loaded = 0;

    for (let i = 0; i < FRAME_COUNT; i += 1) {
      const image = new Image();
      image.src = framePath(frameSet, i);
      image.onload = () => {
        if (cancelled) return;
        loaded += 1;
        // Repaint on arrival — after a set switch there may be no scroll event
        // to trigger one, which would leave the previous set's frame on screen.
        drawCurrent();
        if (loaded === FRAME_COUNT) setLoadedSet(frameSet);
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
      {/* sticky is itself a positioned ancestor, so the CTA hit area below anchors to
          this viewport-sized box rather than to the 250svh scroll track. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="A Signature gift box with callouts describing what makes the gifting service premium"
          className="h-full w-full"
        />

        {/* The pill in the video is only pixels — this gives it a real hit area.
            Position is set in drawFrame, from the frame's drawn rect. */}
        <a
          ref={linkRef}
          href="#contact"
          aria-label="Explore our packaging options"
          className="absolute -translate-x-1/2 rounded-full"
          style={{
            opacity: ready ? 1 : 0,
            pointerEvents: ready ? "auto" : "none",
          }}
        />

        <ul className="sr-only">
          {CALLOUTS.map((callout) => (
            <li key={callout.title}>
              <strong>{callout.title}</strong> — {callout.body}
            </li>
          ))}
        </ul>
      </div>

      {/* Runs the showcase into the near-black shop section. It sits outside the sticky
          box — and after it, so it paints over the canvas — because it belongs to the end
          of the 250svh track, not to the viewport the canvas is pinned to. At that point
          the canvas is bottom-aligned with the section and its last ~200px are flat
          backdrop (row stddev 0.4-1.2; content only starts around 240px), so nothing is
          covered. A plain alpha ramp is enough here: both ends are warm (#AEA096 and
          #241109 sit at r-b 24 and 27), so the fade stays brown instead of going grey the
          way the near-black to cream one did. */}
      <SectionBlend
        to="#241109"
        mid={{ at: "45%", alpha: 0.12 }}
        className="h-48 sm:h-64 lg:h-[320px]"
      />
    </section>
  );
}
