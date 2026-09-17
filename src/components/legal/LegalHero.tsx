import Link from "next/link";

import { LEGAL_META } from "@/data/legal";

/** Figma 362:2050 / 362:2246 — the segment track and its two pills. */
const TAB_BASE =
  "flex-1 rounded-full py-[10px] text-center text-sm transition-colors";

const META_ITEMS = [
  { label: "Version:", value: LEGAL_META.version },
  { label: "Published:", value: LEGAL_META.published },
  { label: "Effective Date:", value: LEGAL_META.effective },
];

export type LegalTab = { label: string; href: string; active: boolean };

/**
 * Figma 362:2037 / 362:2233 — breadcrumbs, title, meta row, segment control,
 * bottom rule. Shared by both legal pages; only the copy and the active pill
 * differ between them.
 */
export default function LegalHero({
  title,
  crumb,
  tabs,
}: {
  title: string;
  crumb: string;
  tabs: LegalTab[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* the trailing crumb is the current page, so it is not a link */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.02em] text-[#A1A1AA] transition-colors hover:text-[#111111]"
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              Sugar Coated
            </Link>
          </li>
          <li
            aria-hidden="true"
            className="text-xs text-[#A1A1AA]"
            style={{ fontFamily: "var(--font-geist)" }}
          >
            /
          </li>
          <li
            aria-current="page"
            className="text-xs uppercase tracking-[0.02em] text-[#111111]"
            style={{ fontFamily: "var(--font-inter-tight)" }}
          >
            {crumb}
          </li>
        </ol>
      </nav>

      <div className="flex flex-col gap-4">
        <h1
          className="text-[40px] leading-none text-[#111111] sm:text-5xl lg:text-[64px]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          {title}
        </h1>

        {/* 24px gap with 4px dots between entries. The dots are decorative, so they
            wrap with the row rather than anchoring to a fixed position, and drop
            entirely once the row stacks on a phone. */}
        <div
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#52525B]"
          style={{ fontFamily: "var(--font-geist)" }}
        >
          {META_ITEMS.map((item, index) => (
            <div key={item.label} className="flex items-center gap-x-6">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 rounded-[2px] bg-[#A1A1AA] max-sm:hidden"
                />
              )}
              <p>
                <span className="font-bold text-[#111111]">{item.label}</span>{" "}
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Both routes exist, so the pills are real links — the inactive one carries
          the reader to the other document. */}
      <div className="flex w-full max-w-[360px] gap-1 rounded-full bg-[#F4F4F5] p-1">
        {tabs.map((tab) =>
          tab.active ? (
            <span
              key={tab.href}
              aria-current="page"
              className={`${TAB_BASE} bg-[#FAFAFA] font-semibold text-[#111111] shadow-[0_2px_4px_0_rgba(0,0,0,0.04)]`}
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              {tab.label}
            </span>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${TAB_BASE} font-medium text-[#52525B] hover:text-[#111111]`}
              style={{ fontFamily: "var(--font-inter-tight)" }}
            >
              {tab.label}
            </Link>
          )
        )}
      </div>

      <hr className="border-0 border-t border-[#E4E4E7]" />
    </div>
  );
}
