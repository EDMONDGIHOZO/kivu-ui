import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import {
  FOCUSABLE,
  FloatingPortal,
  useDismiss,
  useFloatingPosition,
  type FloatingAlign,
  type FloatingSide,
} from "../../utils/floating";
import { composeRefs } from "../../utils/refs";
import { Slot } from "../../utils/slot";
import { useControllableState } from "../../utils/use-controllable";

interface PopoverContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
function usePopover(component: string) {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Popover>`);
  return ctx;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

/** A floating panel anchored to a trigger: filters, quick edits, pickers. */
export function Popover({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentId = useId();
  return <PopoverContext.Provider value={{ open: isOpen, setOpen, triggerRef, contentId }}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverTrigger(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = usePopover("PopoverTrigger");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={composeRefs(ref, (n: HTMLElement | null) => { ctx.triggerRef.current = n; })}
      type={asChild ? undefined : "button"}
      aria-haspopup="dialog"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.contentId : undefined}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.setOpen(!ctx.open);
      }}
      {...props}
    />
  );
});

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: FloatingSide;
  align?: FloatingAlign;
  offset?: number;
  /** Move focus into the panel when it opens (default true). */
  autoFocus?: boolean;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { side = "bottom", align = "start", offset = 6, autoFocus = true, className, ...props },
  ref,
) {
  const ctx = usePopover("PopoverContent");
  const floating = useRef<HTMLDivElement>(null);
  useFloatingPosition(ctx.triggerRef, floating, ctx.open, { side, align, offset });
  useDismiss(ctx.open, [floating, ctx.triggerRef], (reason) => {
    ctx.setOpen(false);
    if (reason === "escape") ctx.triggerRef.current?.focus();
  });
  useEffect(() => {
    if (!ctx.open || !autoFocus) return;
    const el = floating.current;
    (el?.querySelector<HTMLElement>(FOCUSABLE) ?? el)?.focus();
  }, [ctx.open, autoFocus]);

  if (!ctx.open) return null;
  return (
    <FloatingPortal anchor={ctx.triggerRef}>
      <div
        ref={composeRefs(ref, floating)}
        id={ctx.contentId}
        role="dialog"
        tabIndex={-1}
        className={cx("kivu-popover", className)}
        {...props}
      />
    </FloatingPortal>
  );
});

/** Closes the popover when clicked. Use `asChild` to wrap your own button. */
export const PopoverClose = forwardRef<HTMLButtonElement, PopoverTriggerProps>(function PopoverClose(
  { asChild, onClick, ...props },
  ref,
) {
  const ctx = usePopover("PopoverClose");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) {
          ctx.setOpen(false);
          ctx.triggerRef.current?.focus();
        }
      }}
      {...props}
    />
  );
});
