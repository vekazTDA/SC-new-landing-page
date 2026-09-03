"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_COUNT = 120;

/** Sampled from the frames' own edges, so contain-fit letterboxing is invisible. */
const BACKDROP = "#A5978C";

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

/** Where the video's own "Explore Our Options" pill sits, as a fraction of the frame. */
const CTA_BOX = {
  horz: { top: 0.885, left: 0.5, width: 0.19, height: 0.075 },
  vert: { top: 0.795, left: 0.5, width: 0.46, height: 0.055 },
};

const framePath = (set: "horz" | "vert", index: number) =>
  `/frames/box-${set}/${String(index + 1).padStart(4, "0")}.jpg`;

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
   * Paint a frame contain-fit, so no callout or the CTA pill can ever be cropped —
   * whatever is left over is filled with the frame's own backdrop colour, which makes
   * the letterboxing invisible. Also repositions the CTA hit area onto the drawn rect.
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

      const scale = Math.min(
        width / image.naturalWidth,
        height / image.naturalHeight
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = BACKDROP;
      context.fillRect(0, 0, width, height);

      // The frame's backdrop is subtly vignetted, so a flat fill leaves a seam at the
      // letterbox edge. Stretch the frame's outermost pixels into the bands instead.
      const iw = image.naturalWidth;
      const ih = image.naturalHeight;
      if (offsetX > 0.5) {
        context.drawImage(image, 0, 0, 1, ih, 0, offsetY, offsetX + 1, drawHeight);
        context.drawImage(
          image, iw - 1, 0, 1, ih,
          offsetX + drawWidth - 1, offsetY, offsetX + 1, drawHeight
        );
      }
      if (offsetY > 0.5) {
        context.drawImage(image, 0, 0, iw, 1, offsetX, 0, drawWidth, offsetY + 1);
        context.drawImage(
          image, 0, ih - 1, iw, 1,
          offsetX, offsetY + drawHeight - 1, drawWidth, offsetY + 1
        );
      }

      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
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
      const clamped = Math.min(Math.max(progress, 0), 1);
      index = Math.round(clamped * (FRAME_COUNT - 1));
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
        "relative bg-[#A5978C] " +
        (reducedMotion ? "h-screen" : "h-[250vh]")
      }
    >
      <div className="sticky top-0 h-screen overflow-hidden">
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
    </section>
  );
}
