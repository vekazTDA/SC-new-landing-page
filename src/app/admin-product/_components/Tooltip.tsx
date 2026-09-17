"use client";

/**
 * Small hover/focus tooltip. Focusable so it is reachable by keyboard, and it uses
 * aria-describedby rather than `title` so screen readers announce it reliably.
 */
export default function Tooltip({ id, text }: { id: string; text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="What does this do?"
        aria-describedby={id}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-white/25 text-[10px] font-bold text-white/60 transition-colors hover:border-[#C5A880] hover:text-[#C5A880] focus:border-[#C5A880] focus:text-[#C5A880] focus:outline-none"
      >
        i
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg border border-white/15 bg-[#241a16] p-2.5 text-[11px] leading-relaxed text-white/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
