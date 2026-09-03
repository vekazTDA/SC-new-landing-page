"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Corporate Gifting", href: "#corporate-gifting" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <header
      ref={headerRef}
      className={
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300 " +
        (scrolled
          ? "border-b border-white/10 bg-[#241109]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent")
      }
    >
      <nav className="mx-auto flex max-w-[1728px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 2xl:px-14 2xl:py-8">
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
