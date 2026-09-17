"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reorderRows } from "../actions";
import Tooltip from "./Tooltip";
import type { CatalogKind } from "@/lib/catalog/types";

export type ListRow = {
  id: string;
  slug: string;
  label: string;
  image: string;
  isPublished: boolean;
};

const ORDER_HELP =
  "This is the order shoppers see on the page. 1 appears first, then 2, and so on. " +
  "Drag a row by the handle, or use the arrows, then press Save order.";

/**
 * Ordered list with drag-and-drop plus arrow buttons.
 *
 * Both, not one: drag is the obvious gesture but is unusable by keyboard and awkward on
 * touch, so the arrows are the accessible path rather than a lesser fallback. Native
 * HTML5 drag is used so this adds no dependency.
 *
 * The row is a div with a separate Edit link, not a big <Link> — a draggable anchor
 * fires a navigation on every drop.
 */
export default function ReorderableList({
  kind,
  rows: initial,
}: {
  kind: CatalogKind;
  rows: ListRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "error" | "saved"; text: string } | null>(null);

  const dirty = rows.some((row, index) => row.id !== initial[index]?.id);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setRows(next);
    setStatus(null);
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const result = await reorderRows(kind, rows.map((row) => row.id));
    setSaving(false);
    if (!result.ok) {
      setStatus({ kind: "error", text: result.error });
      return;
    }
    setStatus({ kind: "saved", text: "Order saved and live on the site." });
    router.refresh();
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">
          Order on the page
          <Tooltip id={`order-help-${kind}`} text={ORDER_HELP} />
        </span>
        {dirty && (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRows(initial);
                setStatus(null);
              }}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/60 transition-colors hover:border-white/40 hover:text-white"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-lg bg-[#C5A880] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save order"}
            </button>
          </div>
        )}
      </div>

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`mt-2 rounded-lg p-2.5 text-sm ${
            status.kind === "error" ? "bg-[#3a1b16] text-[#E8B4A0]" : "bg-[#1d2c1d] text-[#B5D8A8]"
          }`}
        >
          {status.text}
        </p>
      )}

      <ul className="mt-2 divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
        {rows.length === 0 && (
          <li className="p-5 text-sm text-white/45">
            Nothing here yet. Run the seed migration, or add one.
          </li>
        )}

        {rows.map((row, index) => (
          <li
            key={row.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragOver={(event) => {
              event.preventDefault(); // required, or onDrop never fires
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`flex items-center gap-3 bg-white/[0.03] p-3 transition-colors ${
              overIndex === index && dragIndex !== null ? "bg-[#C5A880]/15" : ""
            } ${dragIndex === index ? "opacity-40" : ""}`}
          >
            <span
              aria-hidden="true"
              title="Drag to reorder"
              className="cursor-grab select-none px-1 text-lg leading-none text-white/30 active:cursor-grabbing"
            >
              ⠿
            </span>

            <span className="w-7 shrink-0 text-center text-sm font-semibold tabular-nums text-[#C5A880]">
              {index + 1}
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary Storage or
                /public URLs at 48px; next/image adds nothing here. */}
            <img
              src={row.image}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg bg-black/40 object-cover"
            />

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">
                {row.label}
              </span>
              <span className="block truncate text-xs text-white/40">/{row.slug}</span>
            </span>

            {!row.isPublished && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-white/60">
                Draft
              </span>
            )}

            <span className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move ${row.label} earlier`}
                className="rounded border border-white/15 px-2 text-xs text-white/70 transition-colors hover:border-white/40 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === rows.length - 1}
                aria-label={`Move ${row.label} later`}
                className="rounded border border-white/15 px-2 text-xs text-white/70 transition-colors hover:border-white/40 disabled:opacity-25"
              >
                ↓
              </button>
            </span>

            <Link
              href={`/admin-product/${kind}/${row.id}`}
              className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white/75 transition-colors hover:border-[#C5A880] hover:text-[#C5A880]"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
