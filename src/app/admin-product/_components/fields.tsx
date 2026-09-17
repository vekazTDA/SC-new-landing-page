"use client";

import { useState } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] leading-snug text-white/35">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#C5A880]";

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#C5A880]"
      />
      <span className="min-w-0">
        <span className="block text-sm text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-white/40">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * Numeric input that does not fight you while typing.
 *
 * `type="number"` was the original approach and it is hostile for editing an existing
 * value: parsing on every keystroke means clearing the box snaps it to 0, so you cannot
 * select-all and retype; `step` makes the browser reject partial values like "2." before
 * you have finished; and the scroll wheel silently changes the number when you scroll
 * the form past it.
 *
 * So the raw string is held locally and only committed once it parses. No effect syncing
 * it back from props — nothing else writes these fields while they are mounted, and an
 * effect would clobber half-typed input anyway.
 */
export function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  integer = false,
  prefix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  integer?: boolean;
  prefix?: string;
}) {
  const [text, setText] = useState(() => (Number.isFinite(value) ? String(value) : ""));

  const clamp = (n: number) => {
    let out = n;
    if (min !== undefined) out = Math.max(min, out);
    if (max !== undefined) out = Math.min(max, out);
    return out;
  };

  const parse = (raw: string) =>
    integer ? Number.parseInt(raw, 10) : Number.parseFloat(raw);

  const handleChange = (raw: string) => {
    // Keep only characters that can appear in a number, but allow the intermediate
    // states — "", "2.", "." — that a strict parser would reject mid-word.
    const cleaned = integer ? raw.replace(/[^\d]/g, "") : raw.replace(/[^\d.]/g, "");
    setText(cleaned);
    const parsed = parse(cleaned);
    if (Number.isFinite(parsed)) onChange(clamp(parsed));
  };

  // Tidy up only when focus leaves, so nothing reformats under the cursor.
  const handleBlur = () => {
    const parsed = parse(text);
    const next = Number.isFinite(parsed) ? clamp(parsed) : min ?? 0;
    setText(String(next));
    onChange(next);
  };

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        {label}
      </span>
      <span className="relative flex items-center">
        {prefix && (
          <span className="pointer-events-none absolute left-3 text-sm text-white/40">
            {prefix}
          </span>
        )}
        <input
          type="text"
          // decimal/numeric gives phones the right keypad without the desktop spinners
          inputMode={integer ? "numeric" : "decimal"}
          autoComplete="off"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          onFocus={(event) => event.currentTarget.select()}
          className={`${inputClass} ${prefix ? "pl-7" : ""}`}
        />
      </span>
      {hint && <span className="text-[11px] leading-snug text-white/35">{hint}</span>}
    </label>
  );
}
