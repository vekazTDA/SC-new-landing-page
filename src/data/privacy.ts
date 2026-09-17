/**
 * Privacy Policy copy, transcribed from Figma 362:2232.
 *
 * Unlike Terms, these sections carry no numbers. The intro lines above each list
 * are plain in the design (Terms sets its equivalents bold), so they are modelled
 * as their own `p` blocks rather than a list `intro`.
 */

import type { LegalSection } from "./legal";

/** Figma 362:2256 — two sentences split by a line break, above the first heading. */
export const PRIVACY_PREAMBLE = [
  'This Privacy Policy describes how Sugar Coated ("Sugar Coated," "we," "us," or "our") collects, uses, and discloses personal information when you visit our website, request a quote, place an order, or otherwise communicate with us regarding sugarcoatedbites.com and our related services (collectively, the "Services").',
  "By using or accessing the Services, you agree to the collection, use, and disclosure of your information as described in this Privacy Policy. If you do not agree, please do not use or access the Services.",
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "Changes to This Privacy Policy",
    blocks: [
      {
        kind: "p",
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, or for operational, legal, or regulatory reasons. We will post the revised policy on our Site and update the "Last updated" date above.',
      },
      // TODO(figma 362:2259): "Information We Collect" reads as a heading but is set
      // in body type inside the same text node, so it renders as plain prose in the
      // design. Reproduced as drawn — promote it to a section once Figma is fixed.
      { kind: "p", text: "Information We Collect" },
      {
        kind: "p",
        text: "The information we collect depends on how you interact with us.",
      },
      { kind: "p", text: "Information you provide directly, such as:" },
      {
        kind: "list",
        items: [
          {
            text: "Contact details (name, company name, job title, email, phone number)",
          },
          {
            text: "Order and inquiry details (shipping/billing address, order specifications, customization requests, payment confirmation)",
          },
          {
            text: "Communications you send us (quote requests, customer support messages, sample requests)",
          },
          { text: "Account information, if you create one" },
        ],
      },
      { kind: "p", text: "Information collected automatically, such as:" },
      {
        kind: "list",
        items: [
          { text: "Device and browser information" },
          { text: "IP address and approximate location" },
          { text: "Pages viewed, links clicked, and time spent on our Site" },
          {
            text: "Information collected through cookies and similar tracking technologies",
          },
        ],
      },
      { kind: "p", text: "Information from third parties, such as:" },
      {
        kind: "list",
        items: [
          {
            text: "Our e-commerce platform (Shopify) and related service providers",
          },
          {
            text: "Payment processors, who handle payment details to complete transactions",
          },
          { text: "Analytics and advertising partners" },
        ],
      },
    ],
  },
  {
    title: "How We Use Your Information",
    blocks: [
      { kind: "p", text: "We use personal information to:" },
      {
        kind: "list",
        items: [
          {
            text: "Process quotes, orders, and payments, and fulfill and ship corporate gifting orders",
          },
          {
            text: "Communicate with you about inquiries, orders, samples, and account activity",
          },
          { text: "Provide customer support and respond to questions" },
          {
            text: "Send marketing and promotional communications (you may opt out at any time)",
          },
          { text: "Improve our Site, products, and Services" },
          { text: "Detect and prevent fraud or misuse of our Services" },
          { text: "Comply with legal obligations and enforce our policies" },
        ],
      },
    ],
  },
  {
    title: "Cookies and Tracking Technologies",
    blocks: [
      {
        kind: "p",
        text: "We use cookies and similar technologies to operate our Site, remember your preferences, and understand how visitors use our Services. Most browsers let you control or block cookies through your settings; doing so may affect how parts of the Site function.",
      },
      {
        kind: "p",
        text: 'We recognize the Global Privacy Control (GPC) signal as a valid opt-out request for sharing/targeted advertising, where applicable. We do not currently respond to other browser "Do Not Track" signals.',
      },
    ],
  },
  {
    title: "How We Disclose Information",
    blocks: [
      { kind: "p", text: "We may share personal information with:" },
      {
        kind: "list",
        items: [
          {
            text: "Vendors and service providers who support our operations (e.g., payment processing, shipping and fulfillment, IT hosting, customer support tools, analytics)",
          },
          {
            text: "Business and marketing partners, for advertising and promotional purposes",
          },
          {
            text: "Professional advisors and authorities, where required to comply with law, respond to legal requests, or protect our rights",
          },
          {
            text: "A successor entity, in the event of a merger, acquisition, or sale of business assets",
          },
        ],
      },
      {
        kind: "p",
        text: "We do not sell sensitive personal information, and we do not use sensitive personal information to infer characteristics about you.",
      },
    ],
  },
  {
    title: "Your Privacy Rights",
    blocks: [
      {
        kind: "p",
        text: "Depending on where you live, you may have rights to:",
      },
      {
        kind: "list",
        items: [
          {
            text: "Access or know what personal information we hold about you",
          },
          { text: "Correct inaccurate personal information" },
          { text: "Delete personal information we hold about you" },
          { text: "Receive a copy of your information in a portable format" },
          { text: "Restrict or object to certain processing" },
          { text: "Withdraw consent, where processing is based on consent" },
          {
            text: "Opt out of marketing communications at any time via the unsubscribe link in our emails",
          },
          { text: "Appeal a decision if we decline to fulfill a rights request" },
        ],
      },
      {
        kind: "p",
        text: "To exercise these rights, contact us using the details below. We may need to verify your identity before processing certain requests, and you may designate an authorized agent to submit a request on your behalf, subject to verification.",
      },
      {
        kind: "p",
        text: "We will not discriminate against you for exercising any privacy right.",
      },
    ],
  },
  {
    title: "Children's Data",
    blocks: [
      {
        kind: "p",
        text: "Our Services are intended for business use and are not directed to children. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can delete it.",
      },
    ],
  },
  {
    title: "Data Security and Retention",
    blocks: [
      {
        kind: "p",
        text: "No method of transmission or storage is completely secure. We take reasonable measures to protect personal information, but cannot guarantee absolute security. We retain personal information for as long as necessary to provide the Services, comply with legal obligations, resolve disputes, and enforce our agreements.",
      },
    ],
  },
  {
    title: "Third-Party Links",
    blocks: [
      {
        kind: "p",
        text: "Our Site may link to third-party websites. We are not responsible for the privacy practices or content of those sites, and we encourage you to review their policies directly.",
      },
    ],
  },
  {
    title: "International Users",
    blocks: [
      {
        kind: "p",
        text: "If you are located outside the United States, please note that your information may be transferred to, stored, and processed in the United States or other countries where we or our service providers operate.",
      },
    ],
  },
  {
    title: "Complaints",
    blocks: [
      {
        kind: "p",
        text: "If you have concerns about how we handle your personal information, please contact us using the details below. Depending on where you live, you may also have the right to lodge a complaint with your local data protection authority.",
      },
    ],
  },
  {
    title: "Contact Us",
    blocks: [
      {
        kind: "p",
        text: "If you have questions about this Privacy Policy or would like to exercise your privacy rights, please contact us:",
      },
      {
        kind: "list",
        items: [
          {
            lead: "Email:",
            text: "sugarcoatedlkwd@gmail.com",
            href: "mailto:sugarcoatedlkwd@gmail.com",
          },
          {
            lead: "Mail:",
            text: "212 Lublin Terrace, Lakewood, NJ 08701, United States",
          },
        ],
      },
    ],
  },
];
