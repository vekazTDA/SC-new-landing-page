"use client";

import { useState } from "react";
import Image from "next/image";
import { submitWeb3Form } from "@/lib/web3forms";

const COMPANY_LINKS = [
  { label: "Corporate Gifting", href: "#corporate-gifting" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Terms & Conditions", href: "#terms" },
];

const SOCIAL_LINKS = [
  {
    label: "Tiktok",
    href: "https://www.tiktok.com/@sugarcoatedbites",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/sugarcoatedbites_/",
  },
];

type SubscribeState = "idle" | "submitting" | "success" | "error";

export default function SiteFooter() {
  const [subscribeState, setSubscribeState] = useState<SubscribeState>("idle");
  const [subscribeError, setSubscribeError] = useState("");

  const onSubscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "");

    setSubscribeState("submitting");
    setSubscribeError("");

    try {
      await submitWeb3Form(formData, {
        accessKey: process.env.NEXT_PUBLIC_WEB3FORMS_NEWSLETTER_ACCESS_KEY,
        extras: {
          subject: `New newsletter signup: ${email}`,
          from_name: "Sugar Coated Landing",
          message: `Newsletter subscription request from ${email}`,
        },
      });

      setSubscribeState("success");
      form.reset();
    } catch (error) {
      setSubscribeState("error");
      setSubscribeError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  return (
    // No glow of its own — the soft amber above is the CTA card defocusing as this arrives.
    <footer className="relative isolate flex min-h-svh flex-col justify-center bg-[#EFE9E0] px-4 pb-8 pt-24 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40 2xl:px-14">
      <div className="relative mx-auto max-w-[1641px] rounded-xl bg-[#9C6543] px-6 py-10 sm:px-10 sm:py-12 lg:px-11 lg:py-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-10">
          <div className="max-w-md">
            <p
              className="text-2xl font-light leading-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-serif-display)" }}
            >
              We send great emails.
            </p>

            {subscribeState === "success" ? (
              <p
                role="status"
                className="mt-6 text-sm text-white/90"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                Thanks for subscribing — you&rsquo;re on the list.
              </p>
            ) : (
              <form className="relative mt-6 max-w-[510px]" onSubmit={onSubscribe}>
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your email"
                  disabled={subscribeState === "submitting"}
                  className="h-12 w-full rounded-full border border-white/80 bg-transparent pl-5 pr-32 text-sm text-white outline-none transition-colors placeholder:text-white/70 focus:border-white disabled:opacity-60"
                  style={{ fontFamily: "var(--font-ui)" }}
                />
                <button
                  type="submit"
                  disabled={subscribeState === "submitting"}
                  className="absolute right-1 top-1 h-10 rounded-full bg-white px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1C1826] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  {subscribeState === "submitting" ? "…" : "Subscribe"}
                </button>
                {subscribeState === "error" && (
                  <p
                    role="alert"
                    className="mt-2 text-xs text-[#FFE4D0]"
                    style={{ fontFamily: "var(--font-ui)" }}
                  >
                    {subscribeError}
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
            <div>
              <h3
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-serif-display)" }}
              >
                Company
              </h3>
              <ul
                className="mt-4 flex flex-col gap-1 text-sm font-medium text-white"
                style={{ fontFamily: "var(--font-display-body)" }}
              >
                {COMPANY_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition-opacity hover:opacity-70">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-serif-display)" }}
              >
                Socials
              </h3>
              <ul
                className="mt-4 flex flex-col gap-1 text-sm font-medium text-white"
                style={{ fontFamily: "var(--font-display-body)" }}
              >
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              id="about"
              className="col-span-2 scroll-mt-[var(--header-height,84px)] sm:col-span-1 sm:max-w-[224px]"
            >
              <h3
                className="text-xl text-white"
                style={{ fontFamily: "var(--font-serif-display)" }}
              >
                About Sugar Coated
              </h3>
              <p
                className="mt-4 text-xs font-semibold leading-relaxed text-white"
                style={{ fontFamily: "var(--font-display-body)" }}
              >
                Corporate gifting made premium with fast turnaround, full
                customization, and inclusive options for every occasion.
              </p>
            </div>
          </div>
        </div>

        <Image
          src="/images/footer/wordmark.svg"
          alt=""
          aria-hidden="true"
          width={1557}
          height={89}
          className="mt-12 h-auto w-full lg:mt-16"
        />

        <div
          className="mt-8 flex flex-col gap-2 text-xs font-light text-white sm:flex-row sm:items-center sm:justify-between lg:mt-10"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          <p>Sugar Coated all rights reserved.</p>
          <p>Designed by 🤍 Digital Artistry</p>
        </div>
      </div>
    </footer>
  );
}
