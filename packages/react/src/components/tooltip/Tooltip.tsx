import {
  useEffect, useId, useRef, useState,
  type FocusEvent as ReactFocusEvent, type PointerEvent as ReactPointerEvent, type ReactElement, type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { FloatingPortal, useFloatingPosition, type FloatingAlign, type FloatingSide } from "../../utils/floating";
import { Slot } from "../../utils/slot";

function isFocusVisible(el: HTMLElement) {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

export interface TooltipProps {
  /** The tooltip text. Keep it short; it is not focusable. */
  content: ReactNode;
  /** A single element that can take a ref and focus (button, link…). */
  children: ReactElement;
  side?: FloatingSide;
  align?: FloatingAlign;
  /** Delay before showing on hover, in ms. Focus shows it immediately. */
  delay?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Short label shown on hover and keyboard focus. Wires `aria-describedby`
 * to the trigger. Not shown for touch input.
 */
export function Tooltip({ content, children, side = "top", align = "center", delay = 400, disabled, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const anchor = useRef<HTMLElement>(null);
  const floating = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useFloatingPosition(anchor, floating, open, { side, align, offset: 8 });
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const show = (wait: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), wait);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  if (disabled || content == null || content === "") return children;

  return (
    <>
      <Slot
        ref={anchor}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e: ReactPointerEvent) => e.pointerType !== "touch" && show(delay)}
        onPointerLeave={hide}
        onFocus={(e: ReactFocusEvent<HTMLElement>) => {
          // Only for keyboard focus, so clicking a button doesn't leave a tooltip behind.
          if (isFocusVisible(e.currentTarget)) show(0);
        }}
        onBlur={hide}
        onPointerDown={hide}
      >
        {children}
      </Slot>
      {open && (
        <FloatingPortal anchor={anchor}>
          <div ref={floating} id={id} role="tooltip" className={cx("kivu-tooltip", className)}>
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
