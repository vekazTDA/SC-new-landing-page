import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

/**
 * Mobile-only brand story that sits just above Contact.
 * Hidden from lg up — desktop keeps the existing contact-first flow.
 *
 * Measured off Figma 36:1236 ("Wireframe - 23"), a 402x874 frame. Text boxes sit at
 * x=32 with tops at 132.42 / 229.41 / 357.41 and the button at 432.39, which is where
 * the vertical rhythm below comes from.
 */
export default function AppreciationSection() {
  return (
    <section
      className="relative isolate overflow-x-clip bg-[#EFE9E0] lg:hidden"
      aria-label="Our story"
    >
      {/* Figma starts the heading 23px under the header bar; the bar is fixed here, so
          reserve its measured height the way ProductsSection does. */}
      <div className="mx-auto max-w-lg px-8 pt-8">
        <h2
          className="text-[28px] leading-[1.35] text-[#281006]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          We Make
          <br />
          <em className="italic">Appreciation Delicious.</em>
        </h2>

        {/* whitespace-pre-line keeps the designed breaks: a line of its own for the
            opening clause, a blank line, then the body. */}
        <p
          className="mt-5 whitespace-pre-line text-[12px] leading-[1.35] text-[#281006]"
          style={{ fontFamily: "var(--font-display-body)" }}
        >
          {`Sugar Coated started small:

A home kitchen, a big idea, and a recipe that wouldn’t quit.
Today, we’re a trusted partner for corporate gifting nationwide. But we haven’t forgotten our roots. We’re still founder-led, still personally involved in every order, and still committed to clean ingredients and premium presentation.`}
        </p>

        <p
          className="mt-2 text-xl leading-[1.35] text-[#281006]"
          style={{ fontFamily: "var(--font-serif-display)" }}
        >
          <em className="italic">
            Because appreciation should feel personal. Every time.
          </em>
        </p>

        <div className="mt-5 flex justify-center">
          <a
            href="#contact"
            className="inline-flex h-[51px] w-[188px] items-center justify-center gap-2 rounded-full bg-[#4F2B1C] text-[13.7px] font-light text-[#EFE9E0] transition-opacity hover:opacity-90"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Order Today
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} />
          </a>
        </div>
      </div>

      {/* Figma places this at x=-65, y=451, 497x499 in a 402-wide frame: wider than the
          screen, bleeding 65px left, 30px right and 76px past the bottom. The section's
          overflow-x-clip trims the sides; the bottom bleed runs under Contact.
          scaleMode FILL in the node, so cover rather than contain.
          The asset is the node's own fill (1024x1000). The previous /hand_prodcut_img.png
          was a tighter 402x423 crop whose hand fell entirely inside the 76px bottom
          bleed, so it never showed. */}
      <div className="relative mx-auto -mb-[76px] mt-6 aspect-[497/499] w-[497px] sm:mt-8">
        <Image
          src="/images/appreciation/hand-pouch.png"
          alt="Hand holding a Sugar Coated snack pouch"
          fill
          sizes="497px"
          className="object-cover object-bottom"
        />
      </div>
    </section>
  );
}
