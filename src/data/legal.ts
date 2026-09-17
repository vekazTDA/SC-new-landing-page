/**
 * Shared shape for the legal pages (Figma 362:2036 Terms, 362:2232 Privacy).
 *
 * Figma text nodes flatten mixed styling when read over the REST API, so bold
 * lead-ins and the bulleted lists were recovered from the rendered frames. Where
 * an intro line is plain rather than bold, it is modelled as its own `p` block
 * ahead of the list instead of the list's `intro`.
 */

export type LegalBlock =
  | { kind: "p"; text: string }
  | {
      kind: "list";
      /** Rendered bold above the list. Plain intro lines are their own `p`. */
      intro?: string;
      /** `href` turns the item's text into a link; the lead stays plain. */
      items: { lead?: string; text: string; href?: string }[];
    };

export type LegalSection = {
  /** Terms numbers its clauses; Privacy does not. */
  number?: string;
  title: string;
  blocks: LegalBlock[];
};

/** Identical on both pages in the design. */
export const LEGAL_META = {
  version: "2024.2",
  published: "September 2026",
  effective: "September 2026",
};
