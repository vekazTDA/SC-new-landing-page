"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, NotebookPen } from "lucide-react";
import AddonCard from "./AddonCard";
import SectionBlend from "./SectionBlend";
import { ADDONS } from "@/data/addons";
import { submitWeb3Form } from "@/lib/web3forms";

type SubmitState = "idle" | "submitting" | "success" | "error";

/** How far out of focus the drawer starts before it settles — mirrors ContactSection. */
const ENTER_BLUR = 26;
const ENTER_SHIFT = 56;
const ENTER_OPACITY = 0.55;

export default function AddonsSection() {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  // The drawer arrives out of focus and sharpens as it rises into place. Mobile only —
  // desktop keeps the plain bar. Written straight to style inside rAF so scrolling does
  // not re-render the whole section.
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const narrow = window.matchMedia("(max-width: 639px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    const clear = () => {
      form.style.filter = "";
      form.style.transform = "";
      form.style.opacity = "";
    };

    const apply = () => {
      frame = null;
      if (!narrow.matches || reduced.matches) return clear();

      const rect = form.getBoundingClientRect();
      const ramp = window.innerHeight * 0.35;
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / ramp, 0),
        1
      );
      if (progress >= 1) return clear();

      const remaining = 1 - progress;
      form.style.filter = `blur(${(remaining * ENTER_BLUR).toFixed(1)}px)`;
      form.style.transform = `translateY(${(remaining * ENTER_SHIFT).toFixed(1)}px)`;
      form.style.opacity = `${(1 - remaining * (1 - ENTER_OPACITY)).toFixed(3)}`;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    narrow.addEventListener("change", onScroll);
    reduced.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      narrow.removeEventListener("change", onScroll);
      reduced.removeEventListener("change", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedAddons.length === 0) {
      setSubmitState("error");
      setSubmitError("Please select at least one add-on.");
      return;
    }

    setSubmitState("submitting");
    setSubmitError("");

    const addonLines = selectedAddons
      .map((addon) => `- ${addon.title} ($${addon.price.toFixed(2)})`)
      .join("\n");

    const formData = new FormData();
    formData.append("email", email.trim());
    formData.append("name", "Add-ons Order");

    try {
      await submitWeb3Form(formData, {
        accessKey: process.env.NEXT_PUBLIC_WEB3FORMS_ADDONS_ACCESS_KEY,
        extras: {
          subject: `Add-ons order (+$${total.toFixed(2)})`,
          from_name: "Sugar Coated Landing",
          addons: selectedAddons.map((addon) => addon.title).join(", "),
          note: note.trim() || "—",
          total: `$${total.toFixed(2)}`,
          message: [
            "Add-ons order from the landing page",
            "",
            "Selected add-ons:",
            addonLines,
            "",
            `Total: $${total.toFixed(2)}`,
            "",
            `Note / special instructions: ${note.trim() || "—"}`,
            "",
            `Customer email: ${email.trim()}`,
          ].join("\n"),
        },
      });

      setSubmitState("success");
      setSelected(new Set());
      setNote("");
      setEmail("");
      setNoteOpen(false);
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden bg-[#A5968C]">
      {/* Blends to the box showcase's canvas, not to its section background: the two
          section colours are 1 apart, but the canvas backdrop that actually paints over
          that section is ~#AEA096, so the visible step is ~10. */}
      <SectionBlend to="#AEA096" className="h-16 sm:h-20 lg:h-24" />

      <div className="relative mx-auto max-w-[1728px] px-6 pb-[min(2.5rem,4svh)] pt-[min(2.5rem,4svh)] sm:px-10 lg:px-12 lg:pb-[min(3rem,5svh)] lg:pt-[min(3rem,5svh)] 2xl:px-14">
        <h2
          className="text-3xl leading-[1.2] text-[#EFE9E0] [@media(max-height:720px)]:text-2xl sm:text-4xl lg:text-4xl 2xl:text-5xl"
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

        {/* Figma 36:2546 (358px drawer) for mobile: 27/39/27 padding, the note sitting
            straight under the title as quiet uppercase text, and a hug-width centred
            button. sm and up keeps the existing bar untouched. Email and the add-on total
            are not in the node but stay — submission sends the email, so dropping the
            field would break the form. */}
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-[min(1.25rem,2.5svh)] flex flex-col gap-4 rounded-2xl border border-[#33231B] bg-[#2E211A] p-[min(1.25rem,2.4svh)] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.5)] max-sm:gap-5 max-sm:px-[27px] max-sm:pb-[27px] max-sm:pt-[39px] max-sm:will-change-[filter,transform,opacity] lg:mt-8 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
        >
          <div className="min-w-0 w-full flex-1">
            <button
              type="button"
              onClick={() => setNoteOpen((open) => !open)}
              className="flex items-center gap-2 text-sm font-semibold text-[#EFE9E0] transition-colors hover:text-[#C5A880] max-sm:text-[16px] max-sm:leading-[1.21]"
            >
              {/* Not in the mobile node. */}
              <NotebookPen className="h-4 w-4 shrink-0 max-sm:hidden" />
              Add Note or Special Instruction to Order
            </button>

            {/* Always present on mobile — the node shows the field open, and its grey
                uppercase line is this placeholder. From sm up the toggle still governs
                it. Rendered rather than unmounted so the two layouts share one input. */}
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Please add my logo to the boxes and send them to this address"
              className={`w-full max-w-md rounded-lg border border-[#7E7469] bg-transparent px-3 py-2 text-sm text-[#EFE9E0] placeholder:text-[#AFA599] focus:border-[#C5A880] focus:outline-none max-sm:mt-1 max-sm:rounded-none max-sm:border-0 max-sm:px-0 max-sm:py-0 max-sm:text-[13px] max-sm:uppercase max-sm:leading-[1.3] max-sm:placeholder:uppercase ${
                noteOpen ? "mt-3 block" : "hidden max-sm:block"
              }`}
            />

            <input
              type="email"
              name="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email*"
              className="mt-3 w-full max-w-md rounded-lg border border-[#7E7469] bg-transparent px-3 py-2 text-sm text-[#EFE9E0] placeholder:text-[#AFA599] focus:border-[#C5A880] focus:outline-none"
            />

            {submitState === "success" && (
              <p role="status" className="mt-2 text-sm text-[#C5A880]">
                Order received — we&rsquo;ll follow up shortly.
              </p>
            )}
            {submitState === "error" && (
              <p role="alert" className="mt-2 text-sm text-[#E8B4A0]">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 max-sm:items-center sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:justify-end lg:gap-6">
            <p className="text-[13px] uppercase leading-snug text-[#AFA599] max-sm:text-center">
              {selectedAddons.length > 0
                ? `${selectedAddons.length} add-on${selectedAddons.length > 1 ? "s" : ""} selected +$${total.toFixed(2)}`
                : "No add-ons selected"}
            </p>

            {/* px-7/py-3.5 and rounded-lg already match the node's 28/14 padding and 8px
                radius; mobile only changes it from full-width to hug and centred, and
                drops the arrow, which the node does not have. */}
            <button
              type="submit"
              disabled={submitState === "submitting"}
              className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#C5A880] px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#140D0A] transition-colors hover:bg-[#d4b992] disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-auto sm:w-auto"
            >
              {submitState === "submitting" ? (
                "Sending…"
              ) : (
                <>
                  <span className="max-sm:hidden">Submit</span>
                  <span className="sm:hidden">Submit Inquiry</span>
                </>
              )}
              <ArrowRight className="h-4 w-4 max-sm:hidden" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
