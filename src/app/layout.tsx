import type { Metadata } from "next";
import {
  Inter,
  Inter_Tight,
  Plus_Jakarta_Sans,
  Red_Hat_Display,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "600"],
});

export const metadata: Metadata = {
  title: "Corporate Gifting | Sugar Coated Signature",
  description:
    "Premium corporate gifts that are truly memorable. Custom packaging, inclusive options, and fast turnaround. Place your order today.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${redHatDisplay.variable} ${plusJakartaSans.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=sentient@400,401&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
