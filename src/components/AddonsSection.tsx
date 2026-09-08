"use client";

import { useState } from "react";
import { ArrowRight, NotebookPen } from "lucide-react";
import AddonCard from "./AddonCard";
import { ADDONS } from "@/data/addons";

export default function AddonsSection() {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(ADDONS.filter((addon) => addon.defaultSelected).map((a) => a.slug))
  );
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectedAddons = ADDONS.filter((addon) => selected.has(addon.slug));
  const total = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-[#A5968C]">

      <div className="relative mx-auto max-w-[1728px] px-6 pb-[min(2.5rem,4svh)] pt-[min(2.5rem,4svh)] sm:px-10 lg:px-12 lg:pb-[min(3rem,5svh)] lg:pt-[min(3rem,5svh)] 2xl:px-14">
        <h2
          className="text-3xl leading-[1.2] text-black [@media(max-height:720px)]:text-2xl sm:text-4xl lg:text-4xl 2xl:text-5xl"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          Add-ons:
          <br />
          <em className="italic">The Finishing Touch</em>
        </h2>

        <div className="mt-[min(1.5rem,3svh)] grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 lg:mt-8">
          {ADDONS.map((addon) => (
            <AddonCard
              key={addon.slug}
              addon={addon}
              selected={selected.has(addon.slug)}
              onToggle={toggle}
            />
          ))}
        </div>

        <div className="mt-[min(1.25rem,2.5svh)] flex flex-col gap-4 rounded-2xl border border-[#33231B] bg-[#2E211A] p-[min(1.25rem,2.4svh)] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:justify-between lg:mt-8">
          <div>
            <button
              type="button"
              onClick={() => setNoteOpen((open) => !open)}
              className="flex items-center gap-2 text-sm font-semibold text-[#EFE9E0] transition-colors hover:text-[#C5A880]"
            >
              <NotebookPen className="h-4 w-4 shrink-0" />
              Add Note or Special Instruction to Order
            </button>

            {noteOpen && (
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Please add my logo to the boxes and send them to this address"
                autoFocus
                className="mt-3 w-full max-w-md rounded-lg border border-[#7E7469] bg-transparent px-3 py-2 text-sm text-[#EFE9E0] placeholder:text-[#AFA599] focus:border-[#C5A880] focus:outline-none sm:w-96"
              />
            )}
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            {!noteOpen && (
              <p className="max-w-xs text-right text-[13px] uppercase leading-snug text-[#AFA599] sm:text-left">
                {selectedAddons.length > 0
                  ? `${selectedAddons.length} add-on${selectedAddons.length > 1 ? "s" : ""} selected — +$${total.toFixed(2)}`
                  : "No add-ons selected"}
              </p>
            )}

            <a
              href="#contact"
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C5A880] px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992]"
            >
              Submit
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
