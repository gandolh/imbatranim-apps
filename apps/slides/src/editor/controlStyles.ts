import type { MouseEvent } from "react";

/** Every control a button can open a menu from: its bottom-left corner. */
export type MenuAnchor = { x: number; y: number };

export const anchorOf = (e: MouseEvent): MenuAnchor => {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  return { x: r.left, y: r.bottom };
};

/** Formatting buttons keep the text editor's selection: no focus on press. */
export const keepFocus = (e: MouseEvent) => e.preventDefault();

/** The ring every stop shows: 2 px of the accent, inside the control. */
export const FOCUS_RING = "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-inset";

/** Pressed and selected: the soft accent with an accent edge, never a strong fill. */
export const SELECTED =
  "data-[pressed]:border-primary data-[pressed]:bg-primary-container data-[pressed]:text-on-primary-container data-[pressed]:hover:bg-primary-container data-[pressed]:focus-visible:ring-on-primary-container";

/** An inspector tool: the lowest surface, an outline-variant edge, a 16 px icon and a 12/16 label. */
export const TOOL =
  "h-[32px] max-[600px]:h-target gap-[6px] rounded-control border-outline-variant bg-surface-container-lowest px-[8px] text-control font-normal text-on-surface hover:border-outline-variant hover:bg-surface-container-high active:bg-surface-container-highest [&_svg]:text-on-surface-variant";
