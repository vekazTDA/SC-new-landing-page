"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Corporate Gifting", href: "#corporate-gifting" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/** The mock orders the open menu About first; the bar and desktop nav keep their order. */
const MENU_LINKS = [
  { label: "About", href: "#about" },
  { label: "Corporate Gift", href: "#corporate-gifting" },
  { label: "Contact", href: "#contact" },
];

/** Mobile open menu socials — only accounts that exist today. */
const MENU_SOCIAL_LINKS = [
  { label: "Tiktok", href: "https://www.tiktok.com/@sugarcoatedbites" },
  { label: "Instagram", href: "https://www.instagram.com/sugarcoatedbites_/" },
];

/** Figma 172:1239 — the floating panel, shared by the closed and open states. */
const PANEL =
  "rounded-[20px] bg-[#4F2B1C] shadow-[0_8px_20px_0_rgba(0,0,0,0.25)]";

/** 30px padding + 25px logo + 30px padding, straight off the Figma node. */
const BAR_HEIGHT = 85;

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // publish the real header height so sections can reserve exactly that much space
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
      );
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={
        // The mobile bar floats, so the inset lives on the header itself rather than
        // as a margin on the bar — offsetHeight ignores margins, and sections size
        // their top spacing off the published height.
        // 14px inset puts the panel at the Figma node's 374px inside the 402px frame.
        "fixed inset-x-0 top-0 z-40 px-[14px] pb-2 pt-3 transition-colors duration-300 sm:p-0 " +
        (scrolled
          ? "sm:border-b sm:border-white/10 sm:bg-[#241109]/85 sm:backdrop-blur-md"
          : "sm:border-b sm:border-transparent sm:bg-transparent")
      }
    >
      {/* Mobile — Figma 172:1239 closed, client mock open. The wrapper keeps the bar's
          height whatever the panel does, so opening the menu never moves --header-height
          and the sections below stay put; the panel itself overlays the page. */}
      <div className="relative sm:hidden" style={{ height: BAR_HEIGHT }}>
        <div className={`absolute inset-x-0 top-0 ${PANEL}`}>
          <div className="flex items-center justify-between px-[39px] py-[30px]">
            <a href="#top" aria-label="Signature — home">
              <Image
                src="/images/logo.svg"
                alt="Signature"
                width={266}
                height={44}
                priority
                className="h-[25px] w-auto"
              />
            </a>

            {/* Two 50x1 rules 13px apart, per the Figma node. The ::after grows the tap
                target past 44px without adding height to the bar. The mock draws no
                close control, so this stays put as the way back out. */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="relative flex w-[50px] shrink-0 flex-col gap-[13px] after:absolute after:-inset-x-3 after:-inset-y-[15px] after:content-['']"
            >
              <span className="h-px w-full bg-white" />
              <span className="h-px w-full bg-white" />
            </button>
          </div>

          <nav id="mobile-menu" hidden={!menuOpen} className="px-[39px] pb-8 pt-4">
            <ul
              className="flex flex-col items-center gap-1 text-center text-2xl italic leading-[34px] text-[#FCD5AD]"
              style={{ fontFamily: "var(--font-serif-display)" }}
            >
              {MENU_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="transition-opacity hover:opacity-70"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#shop"
              onClick={() => setMenuOpen(false)}
              className="mx-auto mt-8 flex h-[46px] w-[201px] items-center justify-center rounded-full bg-[#C5A880] text-[15px] text-white transition-opacity hover:opacity-90"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Shop Corporate Gifts
            </a>

            <ul
              className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] text-[#C5A880]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {MENU_SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    {...(social.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="transition-opacity hover:opacity-70"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#terms"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block text-center text-[15px] text-[#C5A880] transition-opacity hover:opacity-70"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              Terms &amp; Condition
            </a>
          </nav>
        </div>
      </div>

      {/* Tablet and up — unchanged */}
      <nav className="mx-auto hidden max-w-[1728px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:flex sm:px-10 sm:py-5 lg:px-12 lg:py-6 2xl:px-14 2xl:py-8">
        <a href="#top" aria-label="Signature — home">
          <Image
            src="/images/logo.svg"
            alt="Signature"
            width={266}
            height={44}
            priority
            className="h-7 w-auto sm:h-8 lg:h-9 2xl:h-11"
          />
        </a>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white sm:gap-x-6 sm:text-xs lg:gap-x-8 lg:text-sm 2xl:gap-x-12 2xl:text-xl">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="transition-opacity hover:opacity-70">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
