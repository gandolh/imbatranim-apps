import { CirclePlus, Presentation, Shapes, Type, type LucideIcon } from "lucide-react";
import type { ToolbarState } from "./Toolbar.tsx";

export type Group = "insert" | "slide" | "text" | "shape";

/** The inspector's four groups, in the strip's order. */
export const GROUPS: { id: Group; title: string; icon: LucideIcon }[] = [
  { id: "insert", title: "Insert", icon: CirclePlus },
  { id: "slide", title: "Slide", icon: Presentation },
  { id: "text", title: "Text", icon: Type },
  { id: "shape", title: "Shape", icon: Shapes },
];

export const HINT = "Select a text box or shape to format it.";

/** Text and Shape apply to a selection; Insert and Slide always do. */
export const groupEnabled = (g: Group, s: ToolbarState) =>
  g === "insert" || g === "slide" ? s.slideCount > 0 : g === "text" ? s.hasText : s.hasSelection;
