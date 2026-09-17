/**
 * Terms & Conditions copy, transcribed from Figma 362:2036.
 */

import type { LegalSection } from "./legal";

/** Sits above section 01, with no number of its own. */
export const TERMS_PREAMBLE = [
  'These Terms and Conditions ("Terms") govern your access to and use of sugarcoatedbites.com and any related ordering, quoting, or communication with Sugar Coated ("Sugar Coated," "we," "us," or "our") (collectively, the "Services"). By accessing our Site, submitting an inquiry, requesting a sample, or placing an order, you agree to be bound by these Terms. If you do not agree, please do not use our Services.',
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    number: "01",
    title: "Our Services",
    blocks: [
      {
        kind: "p",
        text: "Sugar Coated provides premium corporate gifting products, including customizable chocolate-crisp treats and gift packaging, designed for businesses, teams, and organizations. Our Services include browsing our Site, requesting quotes or samples, submitting customization details, and placing orders for individual or bulk corporate gifts.",
      },
    ],
  },
  {
    number: "02",
    title: "Eligibility",
    blocks: [
      {
        kind: "p",
        text: "Our Services are intended for use by individuals acting on behalf of a business or organization, or by adult consumers placing personal orders where applicable. By using our Services, you represent that you are at least 18 years old and have the authority to place orders or submit requests on behalf of your organization, where applicable.",
      },
    ],
  },
  {
    number: "03",
    title: "Quotes, Orders & Customization",
    blocks: [
      {
        kind: "list",
        items: [
          {
            lead: "Quote Requests:",
            text: "Submitting an inquiry or requesting a quote does not guarantee pricing, availability, or an order commitment until confirmed in writing by our team.",
          },
          {
            lead: "Custom Orders:",
            text: "Many of our products may be customized with your company's logo, branding, or specific packaging requests. You are responsible for the accuracy, quality, and legal right to use any logo, artwork, or materials you submit to us for customization.",
          },
          {
            lead: "Minimum Orders:",
            text: "Certain products or pricing tiers may require a minimum order quantity, which will be communicated at the time of quoting.",
          },
          {
            lead: "Order Confirmation:",
            text: "Orders are considered final once confirmed and paid for in accordance with the payment terms provided to you at checkout or in your quote.",
          },
        ],
      },
    ],
  },
  {
    number: "04",
    title: "Samples",
    blocks: [
      {
        kind: "p",
        text: "We may offer free or discounted samples at our discretion. Sample requests are limited to one per company unless otherwise agreed, and availability may be limited. Samples are provided to help you evaluate our products before placing a larger order and do not constitute a guarantee of final order pricing or availability.",
      },
    ],
  },
  {
    number: "05",
    title: "Pricing & Payment",
    blocks: [
      {
        kind: "p",
        text: "All prices are listed in U.S. dollars unless otherwise stated and are subject to change without notice until an order is confirmed. Bulk and custom orders may require a deposit or full payment in advance. We accept payment methods as indicated on our Site or in your invoice. You are responsible for any applicable taxes not included in the quoted price.",
      },
    ],
  },
  {
    number: "06",
    title: "Shipping & Delivery",
    blocks: [
      {
        kind: "p",
        text: "Estimated turnaround and delivery times are provided in good faith but are not guaranteed, as they may be affected by order volume, customization complexity, or shipping carrier delays. Risk of loss and title for products pass to you upon our delivery to the shipping carrier. Please review your shipping address carefully, as we are not responsible for delays or non-delivery due to incorrect address information provided by you.",
      },
    ],
  },
  {
    number: "07",
    title: "Cancellations, Returns & Refunds",
    blocks: [
      {
        kind: "p",
        text: "Because many of our products are customized or made to order, all sales are final once production has begun, unless otherwise agreed in writing. If you believe your order arrived damaged, incorrect, or defective, please contact us within 5 business days of delivery so we can make it right. Refunds or replacements, where applicable, will be issued at our discretion.",
      },
    ],
  },
  {
    number: "08",
    title: "Allergen & Dietary Disclaimer",
    blocks: [
      {
        kind: "p",
        text: "While we offer gluten-free and clean-ingredient options, our products are prepared in a facility that may also process peanuts and other allergens. It is your responsibility to review product descriptions and notify us of any dietary restrictions or allergy concerns for your recipients before placing an order. We are not liable for adverse reactions resulting from undisclosed allergies or failure to review ingredient information.",
      },
    ],
  },
  {
    number: "09",
    title: "Intellectual Property",
    blocks: [
      {
        kind: "p",
        text: "All content on our Site, including text, graphics, logos, product designs, and images, is owned by or licensed to Sugar Coated and is protected by applicable intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from our content without our prior written consent.",
      },
      {
        kind: "p",
        text: "By submitting your company's logo or artwork for a custom order, you grant us a limited, non-exclusive license to reproduce that material solely for the purpose of fulfilling your order.",
      },
    ],
  },
  {
    number: "10",
    title: "Acceptable Use",
    blocks: [
      {
        kind: "list",
        intro: "You agree not to use our Services to:",
        items: [
          { text: "Violate any applicable law or regulation" },
          { text: "Submit false, misleading, or fraudulent information" },
          {
            text: "Infringe on the intellectual property or other rights of any third party",
          },
          {
            text: "Interfere with or disrupt the security or functionality of our Site",
          },
        ],
      },
    ],
  },
  // TODO(figma 362:2115): the design numbers this "10" as well, so the sequence
  // reads 09, 10, 10, 11. Reproduced verbatim per the client's instruction —
  // renumber here once the Figma copy is corrected.
  {
    number: "10",
    title: "Disclaimers",
    blocks: [
      {
        kind: "p",
        text: 'Our Services and products are provided "as is" and "as available," without warranties of any kind, express or implied, to the fullest extent permitted by law. We do not guarantee that our Site will be uninterrupted, error-free, or completely secure.',
      },
    ],
  },
  // TODO(figma 362:2122): word-for-word duplicate of section 05 "Pricing & Payment".
  // Reproduced verbatim per the client's instruction — delete this block once the
  // Figma copy is corrected.
  {
    number: "11",
    title: "Pricing & Payment",
    blocks: [
      {
        kind: "p",
        text: "All prices are listed in U.S. dollars unless otherwise stated and are subject to change without notice until an order is confirmed. Bulk and custom orders may require a deposit or full payment in advance. We accept payment methods as indicated on our Site or in your invoice. You are responsible for any applicable taxes not included in the quoted price.",
      },
    ],
  },
  {
    number: "12",
    title: "Limitation of Liability",
    blocks: [
      {
        kind: "p",
        text: "To the fullest extent permitted by law, Sugar Coated shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue, arising from your use of our Services or products. Our total liability for any claim shall not exceed the amount you paid for the applicable order.",
      },
    ],
  },
  {
    number: "13",
    title: "Indemnification",
    blocks: [
      {
        kind: "p",
        text: "You agree to indemnify and hold Sugar Coated harmless from any claims, damages, or expenses arising out of your use of our Services, your violation of these Terms, or materials you submit to us for customization (including any third-party claims related to logo or artwork use).",
      },
    ],
  },
  {
    number: "14",
    title: "Governing Law",
    blocks: [
      {
        kind: "p",
        text: "These Terms are governed by the laws of the State of New Jersey, without regard to its conflict of law principles, unless otherwise required by applicable law in your jurisdiction.",
      },
    ],
  },
  {
    number: "15",
    title: "Changes to These Terms",
    blocks: [
      {
        kind: "p",
        text: "We may update these Terms from time to time. Continued use of our Services after changes are posted constitutes your acceptance of the revised Terms.",
      },
    ],
  },
  {
    number: "16",
    title: "Contact Us",
    blocks: [
      {
        kind: "list",
        intro: "If you have questions about these Terms, please contact us:",
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
