"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar } from "lucide-react";

const FIELD_CLASS =
  "w-full border-0 border-b border-white/70 bg-transparent pb-2 font-[family-name:var(--font-ui)] text-base font-light text-white outline-none transition-colors placeholder:text-white/50 focus:border-white sm:text-lg";

/** How the card looks the moment it enters the viewport, before it settles. */
const ENTER_BLUR = 26;
const ENTER_SHIFT = 56;
const ENTER_OPACITY = 0.55;

export default function ContactSection() {
  const formId = useId();
  // the field shows its placeholder as text until focused, then becomes a real date picker
  const [dateActive, setDateActive] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // The card arrives out of focus and sharpens as it rises into place — the mirror
  // of the CTA banner defocusing on its way out further down the page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame: number | null = null;

    const apply = () => {
      frame = null;
      const form = formRef.current;
      if (!form) return;

      const rect = form.getBoundingClientRect();
      const ramp = window.innerHeight * 0.6;
      // 0 while the card is still below the fold, 1 once it has risen into place
      const progress = Math.min(
        Math.max((window.innerHeight - rect.top) / ramp, 0),
        1
      );
      const remaining = 1 - progress;

      if (remaining <= 0.001) {
        form.style.filter = "";
        form.style.transform = "";
        form.style.opacity = "";
        return;
      }

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
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      id="contact"
      className="relative isolate flex min-h-svh scroll-mt-[var(--header-height,84px)] flex-col justify-center overflow-hidden bg-[#F2EDE5]"
    >

      <div className="relative mx-auto grid max-w-[1728px] gap-10 px-6 pb-[min(2.5rem,4svh)] pt-[min(2.5rem,4svh)] sm:px-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-start lg:gap-12 lg:px-12 lg:pb-14 lg:pt-14 2xl:px-14">
        <div className="max-w-xl">
          <h2
            className="text-3xl leading-[1.35] text-[#281006] sm:text-4xl 2xl:text-[2.5rem]"
            style={{ fontFamily: "var(--font-serif-display)" }}
          >
            Tell Us What You&rsquo;re Thinking
            <br />
            <em className="italic">And We Will Deliver.</em>
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

          <form
            ref={formRef}
            className="relative rounded-2xl bg-[#A06B4A] px-6 py-[min(2rem,3.5svh)] will-change-[filter,transform,opacity] sm:px-10 sm:py-9 lg:px-14"
            onSubmit={(event) => event.preventDefault()}
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

            <div>
              <label htmlFor={`${formId}-gift`} className="sr-only">
                Which corporate gift are you interested in?
              </label>
              <input
                id={`${formId}-gift`}
                name="gift"
                placeholder="Which Corporate Gift Are You Interested In?"
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`${formId}-snacks`} className="sr-only">
                Would you like to add our signature snacks?
              </label>
              <input
                id={`${formId}-snacks`}
                name="snacks"
                placeholder="Would You Like To Add Our Signature Snacks? (Y/N)"
                className={FIELD_CLASS}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor={`${formId}-quantity`} className="sr-only">
                  Estimated quantity
                </label>
                <input
                  id={`${formId}-quantity`}
                  name="quantity"
                  required
                  placeholder="Estimated Quantity*"
                  className={FIELD_CLASS}
                />
              </div>
              <div className="relative">
                <label htmlFor={`${formId}-date`} className="sr-only">
                  When would you need this by?
                </label>
                <input
                  id={`${formId}-date`}
                  name="date"
                  type={dateActive ? "date" : "text"}
                  placeholder="When Would You Need This By?"
                  onFocus={() => setDateActive(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.value) setDateActive(false);
                  }}
                  className={`${FIELD_CLASS} pr-8 [&::-webkit-calendar-picker-indicator]:opacity-0`}
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
            <button
              type="submit"
              className="rounded-full bg-[#281006] px-10 py-3 font-[family-name:var(--font-ui)] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Submit
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
      </div>
    </section>
  );
}
