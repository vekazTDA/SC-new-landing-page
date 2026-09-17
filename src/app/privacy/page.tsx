import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { PRIVACY_PREAMBLE, PRIVACY_SECTIONS } from "@/data/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Sugar Coated",
  description:
    "How Sugar Coated collects, uses, and discloses personal information across our site and corporate gifting services.",
};

/** Figma 362:2232. */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      crumb="Privacy Policy"
      tabs={[
        { label: "Terms and Conditions", href: "/terms", active: false },
        { label: "Privacy Policy", href: "/privacy", active: true },
      ]}
      preamble={PRIVACY_PREAMBLE}
      sections={PRIVACY_SECTIONS}
    />
  );
}
