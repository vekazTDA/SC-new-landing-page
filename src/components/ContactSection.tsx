"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, CheckCircle2, ChevronDown } from "lucide-react";
import { consumeInquiryPrefill } from "@/lib/inquiry";
import { submitWeb3Form } from "@/lib/web3forms";

const FIELD_CLASS =
  "w-full border-0 border-b border-white/70 bg-transparent pb-2 font-[family-name:var(--font-ui)] text-base font-light text-white outline-none transition-colors placeholder:text-white/50 focus:border-white sm:text-lg";

const GIFT_OPTIONS = [
  "The Brew",
  "The Refill",
  "The Writer's Choice",
  "The Respite",
  "The Recharge",
  "The Enoteca",
] as const;

/** How the card looks the moment it enters the viewport, before it settles. */
const ENTER_BLUR = 26;
const ENTER_SHIFT = 56;
const ENTER_OPACITY = 0.55;

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ContactSection() {
  const formId = useId();
  // the field shows its placeholder as text until focused, then becomes a real date picker
  const [dateActive, setDateActive] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [giftValue, setGiftValue] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [giftSelected, setGiftSelected] = useState(false);
  const [snacksSelected, setSnacksSelected] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  // Prefill gift + quantity when arriving from a product "Submit Inquiry" CTA.
  useEffect(() => {
    const applyPrefill = () => {
      const prefill = consumeInquiryPrefill();
      if (!prefill) return;

      setSubmitState("idle");
      if (prefill.gift) {
        setGiftValue(prefill.gift);
        setGiftSelected(true);
      }
      if (prefill.quantity) {
        setQuantityValue(prefill.quantity);
      }

      // Let the hash scroll settle, then focus quantity/name for continued filling.
      requestAnimationFrame(() => {
        quantityInputRef.current?.focus();
      });
    };

    applyPrefill();
    window.addEventListener("hashchange", applyPrefill);
    return () => window.removeEventListener("hashchange", applyPrefill);
  }, []);


  // After switching to type="date", open the native calendar popup.
  useEffect(() => {
    if (!dateActive || !openDatePicker) return;
    const input = dateInputRef.current;
    if (!input) return;

    const frame = requestAnimationFrame(() => {
      try {
        input.showPicker?.();
      } catch {
        // Some browsers only allow showPicker from a direct user gesture.
      }
      setOpenDatePicker(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [dateActive, openDatePicker]);

  const activateDateField = () => {
    setDateActive(true);
    setOpenDatePicker(true);
  };

  // The card arrives out of focus and sharpens as it rises into place — the mirror
  // of the CTA banner defocusing on its way out further down the page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | null = null;

    const apply = () => {
      frame = null;
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const ramp = window.innerHeight * 0.6;
      // 0 while the card is still below the fold, 1 once it has risen into place
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / ramp, 0),
        1
      );
      const remaining = 1 - progress;

      if (remaining <= 0.001) {
        card.style.filter = "";
        card.style.transform = "";
        card.style.opacity = "";
        return;
      }

      card.style.filter = `blur(${(remaining * ENTER_BLUR).toFixed(1)}px)`;
      card.style.transform = `translateY(${(remaining * ENTER_SHIFT).toFixed(1)}px)`;
      card.style.opacity = `${(1 - remaining * (1 - ENTER_OPACITY)).toFixed(3)}`;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [submitState]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      await submitWeb3Form(formData, {
        extras: {
          subject: `New inquiry from ${String(formData.get("name") || "website")}`,
          from_name: "Sugar Coated Landing",
        },
      });

      setSubmitState("success");
      form.reset();
      setDateActive(false);
      setGiftValue("");
      setQuantityValue("");
      setGiftSelected(false);
      setSnacksSelected(false);
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section
      id="contact"
      className="relative isolate flex min-h-svh scroll-mt-[var(--header-height,84px)] flex-col justify-center overflow-hidden bg-[#F2EDE5]"
    >
      <div className="relative mx-auto grid max-w-[1728px] gap-10 px-6 pb-[min(2.5rem,4svh)] pt-[min(2.5rem,4svh)] sm:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:px-12 lg:pb-14 lg:pt-14 2xl:px-14">
        <div className="max-w-xl">
          <h2
            className="text-3xl leading-[1.35] text-[#281006] sm:text-[2rem] lg:text-[2.25rem] 2xl:text-[2.5rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            <span className="block whitespace-nowrap max-[380px]:whitespace-normal">
              Tell Us What You&rsquo;re Thinking
            </span>
            <em className="block italic">And We Will Deliver.</em>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-black sm:text-lg">
            Submit your request and a member of our team will follow up
            personally to answer questions, confirm customization details, and
            finalize your order.
          </p>
        </div>

        {/* The halo hugs the card (Figma: 13px left, 12px up, ~30px larger, blur 38.8) */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-3 -top-3 bottom-1 hidden rounded-2xl bg-[#A06B4A]/[0.33] blur-[39px] lg:block"
          />

          {submitState === "success" ? (
            <div
              ref={cardRef}
              role="status"
              aria-live="polite"
              className="relative flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl bg-[#A06B4A] px-6 py-[min(2rem,3.5svh)] text-center will-change-[filter,transform,opacity] sm:min-h-[400px] sm:px-10 sm:py-9 lg:px-14"
            >
              <CheckCircle2 className="h-12 w-12 text-[#F0DCC7]" aria-hidden="true" />
              <h3
                className="text-2xl text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-serif-display)" }}
              >
                Thank you!
              </h3>
              <p
                className="max-w-md text-sm leading-relaxed text-[#F0DCC7] sm:text-base"
                style={{ fontFamily: "var(--font-display-body)" }}
              >
                Your inquiry has been received. A member of our team will follow
                up personally to confirm the details.
              </p>
              <button
                type="button"
                onClick={() => setSubmitState("idle")}
                className="mt-2 rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-80"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <div ref={cardRef} className="will-change-[filter,transform,opacity]">
            <form
              ref={formRef}
              className="relative rounded-2xl bg-[#A06B4A] px-6 py-[min(2rem,3.5svh)] sm:px-10 sm:py-9 lg:px-14"
              onSubmit={onSubmit}
            >
              <div className="flex flex-col gap-[min(1.5rem,2.6svh)]">
                <div>
                  <label htmlFor={`${formId}-name`} className="sr-only">
                    Full name
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    required
                    placeholder="Full Name*"
                    className={FIELD_CLASS}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor={`${formId}-email`} className="sr-only">
                      Email
                    </label>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      required
                      placeholder="Email*"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-phone`} className="sr-only">
                      Phone
                    </label>
                    <input
                      id={`${formId}-phone`}
                      name="phone"
                      type="tel"
                      required
                      placeholder="Phone*"
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor={`${formId}-company`} className="sr-only">
                      Company name
                    </label>
                    <input
                      id={`${formId}-company`}
                      name="company"
                      placeholder="Company Name"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-role`} className="sr-only">
                      Role
                    </label>
                    <input
                      id={`${formId}-role`}
                      name="role"
                      placeholder="Role"
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor={`${formId}-gift`} className="sr-only">
                    Which corporate gift are you interested in?
                  </label>
                  <select
                    id={`${formId}-gift`}
                    name="gift"
                    value={giftValue}
                    onChange={(event) => {
                      setGiftValue(event.target.value);
                      setGiftSelected(Boolean(event.target.value));
                    }}
                    className={`${FIELD_CLASS} appearance-none pr-8 ${
                      giftSelected || giftValue ? "text-white" : "text-white/50"
                    }`}
                  >
                    <option value="" disabled>
                      Which Corporate Gift Are You Interested In?
                    </option>
                    {giftValue &&
                      !(GIFT_OPTIONS as readonly string[]).includes(giftValue) && (
                        <option value={giftValue} className="bg-[#A06B4A] text-white">
                          {giftValue}
                        </option>
                      )}
                    {GIFT_OPTIONS.map((gift) => (
                      <option key={gift} value={gift} className="bg-[#A06B4A] text-white">
                        {gift}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1 h-5 w-5 text-[#F1D9C1]"
                  />
                </div>

                <div className="relative">
                  <label htmlFor={`${formId}-snacks`} className="sr-only">
                    Would you like to add our signature snacks?
                  </label>
                  <select
                    id={`${formId}-snacks`}
                    name="snacks"
                    defaultValue=""
                    onChange={(event) => setSnacksSelected(Boolean(event.target.value))}
                    className={`${FIELD_CLASS} appearance-none pr-8 ${
                      snacksSelected ? "text-white" : "text-white/50"
                    }`}
                  >
                    <option value="" disabled>
                      Would You Like To Add Our Signature Snacks?
                    </option>
                    <option value="Yes" className="bg-[#A06B4A] text-white">
                      Yes
                    </option>
                    <option value="No" className="bg-[#A06B4A] text-white">
                      No
                    </option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1 h-5 w-5 text-[#F1D9C1]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                  <div>
                    <label htmlFor={`${formId}-quantity`} className="sr-only">
                      Estimated quantity
                    </label>
                    <input
                      ref={quantityInputRef}
                      id={`${formId}-quantity`}
                      name="quantity"
                      required
                      value={quantityValue}
                      onChange={(event) => setQuantityValue(event.target.value)}
                      placeholder="Estimated Quantity*"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor={`${formId}-date`} className="sr-only">
                      When would you need this by?
                    </label>
                    <input
                      ref={dateInputRef}
                      id={`${formId}-date`}
                      name="date"
                      type={dateActive ? "date" : "text"}
                      placeholder="When Would You Need This By?"
                      onFocus={activateDateField}
                      onClick={activateDateField}
                      onBlur={(event) => {
                        if (!event.currentTarget.value) setDateActive(false);
                      }}
                      className={`${FIELD_CLASS} relative pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                    />
                    <Calendar
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 top-1 h-5 w-5 text-[#F1D9C1]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-message`} className="sr-only">
                    Message or special requests
                  </label>
                  <input
                    id={`${formId}-message`}
                    name="message"
                    placeholder="Message / Special Requests:"
                    className={FIELD_CLASS}
                  />
                </div>
              </div>

              <div className="mt-[min(2rem,3svh)] flex flex-col items-center gap-3">
                {submitState === "error" && (
                  <p role="alert" className="max-w-lg text-center text-sm text-[#FFE4D0]">
                    {errorMessage}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitState === "submitting"}
                  className="rounded-full bg-[#281006] px-10 py-3 font-[family-name:var(--font-ui)] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitState === "submitting" ? "Sending…" : "Submit"}
                </button>
                <p
                  className="max-w-lg text-center text-xs text-[#F0DCC7]"
                  style={{ fontFamily: "var(--font-display-body)" }}
                >
                  By submitting, you consent to Sugar Coated Bites contacting you.
                  You can opt out anytime.
                </p>
              </div>
            </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
