import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import LegalHero, { type LegalTab } from "@/components/legal/LegalHero";
import LegalSection from "@/components/legal/LegalSection";
import type { LegalSection as LegalSectionData } from "@/data/legal";

/**
 * The shell both legal pages share — Figma 362:2036 and 362:2232 are the same
 * layout with different copy.
 */
export default function LegalPage({
  title,
  crumb,
  tabs,
  preamble,
  sections,
}: {
  title: string;
  crumb: string;
  tabs: LegalTab[];
  preamble: string[];
  sections: LegalSectionData[];
}) {
  return (
    <>
      {/* `solid` because this page is light: the transparent bar would leave the
          white nav labels and the logo invisible against it. */}
      <SiteHeader solid />

      <main className="flex flex-1 flex-col bg-[#F2EDE5]">
        {/* reserves the space the fixed site header floats over — same idiom as Hero.tsx */}
        <div className="h-[var(--header-height,84px)] shrink-0 sm:h-[var(--header-height,72px)] lg:h-[var(--header-height,84px)] 2xl:h-[var(--header-height,108px)]" />

        <div className="mx-auto w-full max-w-[1728px] px-6 pb-20 pt-10 sm:px-10 sm:pt-12 lg:px-12 lg:pb-[120px] 2xl:px-14">
          <LegalHero title={title} crumb={crumb} tabs={tabs} />

          {/* The design draws a rule down the left of the prose. In Figma it is
              fixed-length lines that stop short of their own content; here it is one
              continuous rule that actually tracks the document. It carries no
              meaning, so it drops below lg rather than stealing width from the text. */}
          <div className="mt-12 flex lg:mt-14 lg:gap-16">
            <div
              aria-hidden="true"
              className="hidden w-px shrink-0 self-stretch bg-[#E4E4E7] lg:block"
            />

            <div className="flex min-w-0 flex-col gap-14">
              {/* The design separates the preamble's sentences with a plain line
                  break, not the 56px that divides sections — so they group. */}
              <div className="flex flex-col gap-4">
                {preamble.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-[15px] leading-[1.65] text-[#52525B]"
                    style={{ fontFamily: "var(--font-inter-tight)" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {sections.map((section) => (
                <LegalSection
                  key={`${section.number ?? ""}-${section.title}`}
                  section={section}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
