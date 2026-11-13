import { useSyncExternalStore } from "react";

/** A phone: the desktop's narrow layout, where a window opens maximized and groups open in a bottom sheet. */
const QUERY = "(max-width: 600px)";

const media = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null;

function subscribe(onChange: () => void) {
  const m = media();
  m?.addEventListener("change", onChange);
  return () => m?.removeEventListener("change", onChange);
}

/** Whether the screen is a phone's (600 px wide or less), following the media query live. */
export function usePhone(): boolean {
  return useSyncExternalStore(subscribe, () => media()?.matches ?? false);
}
