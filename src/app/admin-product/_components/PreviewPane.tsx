"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PREVIEW_ORIGIN_TAG,
  isPreviewMessage,
  type PreviewDraft,
  type PreviewView,
} from "@/lib/admin/preview-protocol";

const DEVICES = {
  mobile: { label: "Mobile", width: 390, height: 844 },
  desktop: { label: "Desktop", width: 1440, height: 900 },
} as const;

type DeviceKey = keyof typeof DEVICES;

/**
 * Live preview of the product being edited, rendered by the real site components.
 *
 * The iframe is required rather than preferred: the cards are laid out by Tailwind
 * `sm:`/`xl:` variants (viewport media queries), `svh` units, and JS that reads
 * window.innerHeight. A narrow <div> would still evaluate desktop breakpoints, so only a
 * nested browsing context shows the true mobile layout.
 *
 * `transform: scale()` — never `zoom` — fits it on screen: transform runs at paint time
 * and leaves the iframe's layout viewport at its real width, which is the whole point.
 */
export default function PreviewPane({
  payload,
  view,
  onViewChange,
}: {
  payload: PreviewDraft;
  view: PreviewView;
  onViewChange: (view: PreviewView) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(1);

  const { width, height } = DEVICES[device];

  const post = useCallback(() => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(
      { tag: PREVIEW_ORIGIN_TAG, type: "draft", view, ...payload },
      window.location.origin
    );
  }, [payload, view]);

  // The frame announces itself when it mounts; until then postMessage would be dropped.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isPreviewMessage(event.data) || event.data.type !== "ready") return;
      setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) post();
  }, [ready, post]);

  // Fit the fixed-width frame into whatever space the panel actually has.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const fit = () => setScale(Math.min(1, shell.clientWidth / width));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [width]);

  const supportsDetail = payload.kind !== "addons";

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-white/15">
          {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setDevice(key)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                device === key ? "bg-[#C5A880] text-[#140D0A]" : "text-white/60 hover:text-white"
              }`}
            >
              {DEVICES[key].label}
            </button>
          ))}
        </div>

        {supportsDetail && (
          <div className="flex overflow-hidden rounded-lg border border-white/15">
            {(["card", "detail"] as PreviewView[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onViewChange(key)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                  view === key ? "bg-[#C5A880] text-[#140D0A]" : "text-white/60 hover:text-white"
                }`}
              >
                {key === "card" ? "In grid" : "Detail"}
              </button>
            ))}
          </div>
        )}

        <span className="ml-auto text-[11px] text-white/35">
          {width}×{height} · {Math.round(scale * 100)}%
        </span>
      </div>

      <div ref={shellRef} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <div style={{ height: height * scale }}>
          {/* Mounted once and never re-keyed: remounting reloads the document, which
              white-flashes and replays the grid's entrance animation on every keystroke. */}
          <iframe
            ref={frameRef}
            src="/admin-preview"
            title="Live preview"
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: 0,
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}
