import { useEffect, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

/** useLayoutEffect on the client, useEffect on the server (avoids the SSR warning). */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type FloatingSide = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";

export interface FloatingOptions {
  side?: FloatingSide;
  align?: FloatingAlign;
  /** Gap between the anchor and the floating element, in px. */
  offset?: number;
  /** Make the floating element at least as wide as the anchor. */
  matchWidth?: boolean;
}

const MARGIN = 8;
const opposite: Record<FloatingSide, FloatingSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

/**
 * Positions `floating` next to `anchor` with `position: fixed`, flipping to the
 * opposite side when there isn't room and clamping inside the viewport.
 * Writes styles straight to the DOM, so it never causes React re-renders.
 */
export function useFloatingPosition(
  anchor: RefObject<HTMLElement | null>,
  floating: RefObject<HTMLElement | null>,
  open: boolean,
  { side = "bottom", align = "start", offset = 6, matchWidth = false }: FloatingOptions = {},
) {
  useIsoLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const a = anchor.current;
      const f = floating.current;
      if (!a || !f) return;
      const r = a.getBoundingClientRect();
      if (matchWidth) f.style.minWidth = `${r.width}px`;
      const fw = f.offsetWidth;
      const fh = f.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const fits = (s: FloatingSide) =>
        s === "bottom" ? r.bottom + offset + fh <= vh - MARGIN
        : s === "top" ? r.top - offset - fh >= MARGIN
        : s === "right" ? r.right + offset + fw <= vw - MARGIN
        : r.left - offset - fw >= MARGIN;
      const s = fits(side) || !fits(opposite[side]) ? side : opposite[side];

      let top: number;
      let left: number;
      if (s === "top" || s === "bottom") {
        top = s === "bottom" ? r.bottom + offset : r.top - offset - fh;
        left = align === "start" ? r.left : align === "end" ? r.right - fw : r.left + r.width / 2 - fw / 2;
      } else {
        left = s === "right" ? r.right + offset : r.left - offset - fw;
        top = align === "start" ? r.top : align === "end" ? r.bottom - fh : r.top + r.height / 2 - fh / 2;
      }
      left = Math.min(Math.max(left, MARGIN), Math.max(MARGIN, vw - fw - MARGIN));
      top = Math.min(Math.max(top, MARGIN), Math.max(MARGIN, vh - fh - MARGIN));
      f.style.top = `${Math.round(top)}px`;
      f.style.left = `${Math.round(left)}px`;
      f.dataset.side = s;
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (ro && floating.current) ro.observe(floating.current);
    if (ro && anchor.current) ro.observe(anchor.current);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
    };
  }, [open, side, align, offset, matchWidth]);
}

/** Closes on a pointer-down outside every given element, and on Escape. */
export function useDismiss(
  open: boolean,
  refs: RefObject<HTMLElement | null>[],
  onDismiss: (reason: "outside" | "escape") => void,
) {
  const cb = useRef(onDismiss);
  cb.current = onDismiss;
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refs.some((r) => r.current?.contains(t))) return;
      cb.current("outside");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        cb.current("escape");
      }
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

/**
 * Renders children into `document.body` (or into the nearest open `<dialog>`,
 * so menus inside a Modal/Drawer stay in the browser's top layer).
 */
export function FloatingPortal({ children, anchor }: { children: ReactNode; anchor?: RefObject<HTMLElement | null> }) {
  // Floating layers only mount after user interaction (client-side), so the host can be
  // resolved during render; this keeps the content in the same commit as the positioning effect.
  if (typeof document === "undefined") return null;
  const host = (anchor?.current?.closest("dialog[open]") as HTMLElement | null) ?? document.body;
  return createPortal(children, host);
}

export const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
