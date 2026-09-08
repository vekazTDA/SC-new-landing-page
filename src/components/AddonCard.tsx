import Image from "next/image";
import { Check, Plus } from "lucide-react";
import type { Addon } from "@/data/addons";

export default function AddonCard({
  addon,
  selected,
  onToggle,
}: {
  addon: Addon;
  selected: boolean;
  onToggle: (slug: string) => void;
}) {
  return (
    <div className="group flex w-full flex-col overflow-hidden rounded-[20px] border border-[#C5A880]/40 bg-[#221712] shadow-[0px_16px_32px_0px_rgba(0,0,0,0.38)]">
      <div className="relative h-[min(170px,20svh)] w-full sm:h-[min(190px,21svh)]">
        <Image
          src={addon.image}
          alt={addon.title}
          fill
          sizes="(min-width: 1280px) 24vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,13,10,0)_50%,rgba(20,13,10,0.8)_100%)]" />

        {selected && (
          <span className="absolute left-4 top-4 rounded-full bg-[#C5A880] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#140D0A]">
            Selected
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[min(0.75rem,1.6svh)] p-[min(1rem,2.2svh)] sm:p-[min(1.25rem,2.4svh)]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#EFE9E0] sm:text-base">
            {addon.title}
          </h3>
          <span className="shrink-0 text-sm font-semibold text-[#C5A880]">
            ${addon.price.toFixed(2)}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-white/80">
          {addon.description}
        </p>

        <button
          type="button"
          onClick={() => onToggle(addon.slug)}
          className={
            "mt-auto flex items-center justify-center gap-2 rounded-lg border px-4 py-[min(0.625rem,1.3svh)] text-xs font-semibold uppercase tracking-[0.08em] transition-colors " +
            (selected
              ? "border-[#C5A880] bg-[#2E211A] text-[#C5A880] hover:bg-[#3A2A20]"
              : "border-[#7E7469] bg-transparent text-[#EFE9E0] hover:border-[#C5A880] hover:text-[#C5A880]")
          }
        >
          {selected ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Added to Order
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add Option
            </>
          )}
        </button>
      </div>
    </div>
  );
}
