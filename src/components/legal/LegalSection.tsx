import type { LegalSection as LegalSectionData } from "@/data/legal";

/**
 * Figma: Inter Tight 15/1.65 in #52525B — the measure for every prose block.
 * Lead-ins and intros stay at weight 600 for structure but inherit this colour,
 * so all subsection text is a single tone across both legal pages.
 */
const PROSE_CLASS = "text-[15px] leading-[1.65] text-[#52525B]";

const PROSE_STYLE = { fontFamily: "var(--font-inter-tight)" };

/**
 * Figma 362:2059 and siblings — one numbered clause: a Sentient heading whose
 * number sits on the same baseline as the title, then its prose blocks.
 */
export default function LegalSection({
  section,
}: {
  section: LegalSectionData;
}) {
  return (
    <section className="flex flex-col gap-5">
      {/* items-baseline, not items-center: the number and the title are the same
          size, and baseline keeps them aligned when the title wraps to two lines. */}
      <h2
        className="flex items-baseline gap-3 text-2xl leading-[1.36] text-[#111111] sm:text-3xl lg:text-[32px]"
        style={{ fontFamily: "var(--font-serif-display)" }}
      >
        {/* Terms numbers its clauses; Privacy leaves them off entirely. */}
        {section.number && (
          <span className="shrink-0">{section.number}</span>
        )}
        <span>{section.title}</span>
      </h2>

      {section.blocks.map((block, index) =>
        block.kind === "p" ? (
          <p key={index} className={PROSE_CLASS} style={PROSE_STYLE}>
            {block.text}
          </p>
        ) : (
          <div key={index} className="flex flex-col gap-2">
            {block.intro && (
              <p
                className={`${PROSE_CLASS} font-semibold`}
                style={PROSE_STYLE}
              >
                {block.intro}
              </p>
            )}
            <ul
              className={`${PROSE_CLASS} list-disc space-y-1 ps-6 marker:text-[#A1A1AA]`}
              style={PROSE_STYLE}
            >
              {block.items.map((item) => (
                <li key={item.lead ?? item.text}>
                  {item.lead && (
                    <span className="font-semibold">
                      {item.lead}{" "}
                    </span>
                  )}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="underline decoration-[#A1A1AA] underline-offset-2 transition-colors hover:text-[#111111] hover:decoration-[#111111]"
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </section>
  );
}
