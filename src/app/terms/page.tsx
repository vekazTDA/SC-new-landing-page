import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { TERMS_PREAMBLE, TERMS_SECTIONS } from "@/data/terms";

export const metadata: Metadata = {
  title: "Terms & Conditions | Sugar Coated",
  description:
    "The terms governing orders, quotes, customization, and delivery for Sugar Coated corporate gifting.",
};

/** Figma 362:2036. */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      crumb="Terms of Service"
      // The design labels this pill "Terms of Service" here but "Terms and
      // Conditions" on the Privacy page — reproduced as drawn.
      tabs={[
        { label: "Terms of Service", href: "/terms", active: true },
        { label: "Privacy Policy", href: "/privacy", active: false },
      ]}
      preamble={TERMS_PREAMBLE}
      sections={TERMS_SECTIONS}
    />
  );
}
