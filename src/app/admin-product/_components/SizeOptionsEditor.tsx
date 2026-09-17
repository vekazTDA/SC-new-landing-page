"use client";

import { inputClass } from "./fields";
import { useState } from "react";
import type { SizeOptionRow } from "@/lib/catalog/types";

const BADGES = ["", "Popular", "Best Value"] as const;

/** Same free-typing behaviour as NumberField, sized for the inline size-option row. */
function PriceInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(() => String(value));
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={`${inputClass} w-24`}
      value={text}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const cleaned = event.target.value.replace(/[^\d.]/g, "");
        setText(cleaned);
        const parsed = Number.parseFloat(cleaned);
        if (Number.isFinite(parsed)) onChange(Math.max(0, parsed));
      }}
      onBlur={() => {
        const parsed = Number.parseFloat(text);
        const next = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
        setText(String(next));
        onChange(next);
      }}
    />
  );
}

/**
 * Size/pack tiers for a shop product. Order is load-bearing: the modal renders them
 * left to right and pre-selects the one badged "Popular".
 */
export default function SizeOptionsEditor({
  options,
  onChange,
}: {
  options: SizeOptionRow[] | null;
  onChange: (options: SizeOptionRow[] | null) => void;
}) {
  const list = options ?? [];

  const update = (index: number, patch: Partial<SizeOptionRow>) => {
    const next = list.map((option, i) => (i === index ? { ...option, ...patch } : option));
    onChange(next);
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        Size options
      </p>
      <p className="mb-2 text-[11px] text-white/35">
        Optional. Leave empty and the shop shows the single price above.
      </p>

      <ul className="flex flex-col gap-2">
        {list.map((option, index) => (
          <li
            key={index}
            className="flex flex-wrap items-end gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-2"
          >
            <input
              className={`${inputClass} min-w-0 flex-1`}
              placeholder="Label, e.g. 2 Pack"
              value={option.label}
              onChange={(event) => update(index, { label: event.target.value })}
            />
            <PriceInput
              value={option.price}
              onChange={(price) => update(index, { price })}
            />
            <select
              className={`${inputClass} w-32`}
              value={option.badge ?? ""}
              onChange={(event) =>
                update(index, {
                  badge: (event.target.value || null) as SizeOptionRow["badge"],
                })
              }
            >
              {BADGES.map((badge) => (
                <option key={badge} value={badge} className="bg-[#171010]">
                  {badge || "No badge"}
                </option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded border border-white/15 px-2 py-1 text-xs text-white/70 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === list.length - 1}
                aria-label="Move down"
                className="rounded border border-white/15 px-2 py-1 text-xs text-white/70 disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = list.filter((_, i) => i !== index);
                  onChange(next.length ? next : null);
                }}
                aria-label="Remove size"
                className="rounded border border-white/15 px-2 py-1 text-xs text-[#E8B4A0]"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange([...list, { label: "", price: 0, badge: null }])}
        className="mt-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-white/50"
      >
        Add size
      </button>
    </div>
  );
}
