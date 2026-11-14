import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { FloatingPortal, useDismiss, useFloatingPosition, type FloatingAlign, type FloatingSide } from "../../utils/floating";
import { Check } from "../../utils/icons";
import { composeRefs } from "../../utils/refs";
import { Slot } from "../../utils/slot";
import { useControllableState } from "../../utils/use-controllable";

interface MenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  menuId: string;
  triggerId: string;
  /** Which item to focus when the menu opens. */
  focusOnOpen: MutableRefObject<"first" | "last" | "menu">;
  close: (returnFocus?: boolean) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);
function useMenu(component: string) {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <DropdownMenu>`);
  return ctx;
}

const ITEM = '[role^="menuitem"]:not([aria-disabled="true"])';

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

/** Menu of actions: row actions (⋯), user menu, bulk actions. */
export function DropdownMenu({ open, defaultOpen = false, onOpenChange, children }: DropdownMenuProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement | null>(null);
  const focusOnOpen = useRef<"first" | "last" | "menu">("menu");
  const menuId = useId();
  const triggerId = useId();
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  return (
    <MenuContext.Provider value={{ open: isOpen, setOpen, triggerRef, menuId, triggerId, focusOnOpen, close }}>
      {children}
    </MenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(function DropdownMenuTrigger(
  { asChild, onClick, onKeyDown, ...props },
  ref,
) {
  const ctx = useMenu("DropdownMenuTrigger");
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={composeRefs(ref, (n: HTMLElement | null) => { ctx.triggerRef.current = n; })}
      id={ctx.triggerId}
      type={asChild ? undefined : "button"}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      aria-controls={ctx.open ? ctx.menuId : undefined}
      data-state={ctx.open ? "open" : "closed"}
      onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // A click from the keyboard (Enter/Space) has detail 0: focus the first item.
        ctx.focusOnOpen.current = e.detail === 0 ? "first" : "menu";
        ctx.setOpen(!ctx.open);
      }}
      onKeyDown={(e: ReactKeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(e);
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          ctx.focusOnOpen.current = e.key === "ArrowDown" ? "first" : "last";
          ctx.setOpen(true);
        }
      }}
      {...props}
    />
  );
});

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: FloatingSide;
  align?: FloatingAlign;
  offset?: number;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(function DropdownMenuContent(
  { side = "bottom", align = "start", offset = 6, className, onKeyDown, ...props },
  ref,
) {
  const ctx = useMenu("DropdownMenuContent");
  const menu = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: "", timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useFloatingPosition(ctx.triggerRef, menu, ctx.open, { side, align, offset });
  useDismiss(ctx.open, [menu, ctx.triggerRef], (reason) => ctx.close(reason === "escape"));

  useEffect(() => {
    if (!ctx.open) return;
    const el = menu.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>(ITEM);
    const target = ctx.focusOnOpen.current === "first" ? items[0] : ctx.focusOnOpen.current === "last" ? items[items.length - 1] : el;
    (target ?? el).focus();
  }, [ctx.open]);

  if (!ctx.open) return null;

  const handleKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(ITEM));
    const i = items.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus();
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i < 0 ? items.length - 1 : i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
    else if (e.key === "Tab") ctx.close(false);
    else if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typeahead.current;
      clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = setTimeout(() => (t.text = ""), 600);
      const ordered = [...items.slice(i + 1), ...items.slice(0, i + 1)];
      ordered.find((it) => it.textContent?.trim().toLowerCase().startsWith(t.text))?.focus();
    }
  };

  return (
    <FloatingPortal anchor={ctx.triggerRef}>
      <div
        ref={composeRefs(ref, menu)}
        id={ctx.menuId}
        role="menu"
        aria-labelledby={ctx.triggerId}
        tabIndex={-1}
        className={cx("kivu-menu", className)}
        onKeyDown={handleKey}
        {...props}
      />
    </FloatingPortal>
  );
});

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Called when the item is chosen. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void;
  icon?: ReactNode;
  /** Keyboard shortcut hint shown on the right, e.g. "⌘D". */
  shortcut?: ReactNode;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Render a link (e.g. router Link) as the item. */
  asChild?: boolean;
}

function useSelect(onSelect: ((e: Event) => void) | undefined, disabled: boolean | undefined, keepOpen = false) {
  const ctx = useMenu("DropdownMenuItem");
  const run = (el: HTMLElement) => {
    if (disabled) return;
    const ev = new Event("kivu.menu.select", { cancelable: true });
    onSelect?.(ev);
    if (!ev.defaultPrevented && !keepOpen) ctx.close(true);
    else el.focus();
  };
  return {
    onClick: (e: ReactMouseEvent<HTMLElement>) => run(e.currentTarget),
    onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (e.key === "Enter" && e.currentTarget instanceof HTMLAnchorElement) e.currentTarget.click();
        else run(e.currentTarget);
      }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (!disabled && document.activeElement !== e.currentTarget) e.currentTarget.focus();
    },
  };
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(function DropdownMenuItem(
  { onSelect, icon, shortcut, tone = "default", disabled, asChild, className, children, onClick, onKeyDown, ...props },
  ref,
) {
  const handlers = useSelect(onSelect, disabled);
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={cx("kivu-menu__item", tone === "danger" && "kivu-menu__item--danger", className)}
      onClick={(e: ReactMouseEvent<HTMLDivElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented) handlers.onClick(e);
      }}
      onKeyDown={(e: ReactKeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (!e.defaultPrevented) handlers.onKeyDown(e);
      }}
      onPointerMove={handlers.onPointerMove}
      {...props}
    >
      {asChild ? children : (
        <>
          {icon != null && <span className="kivu-menu__icon" aria-hidden="true">{icon}</span>}
          <span className="kivu-menu__text">{children}</span>
          {shortcut != null && <span className="kivu-menu__shortcut">{shortcut}</span>}
        </>
      )}
    </Comp>
  );
});

export interface DropdownMenuCheckboxItemProps extends Omit<DropdownMenuItemProps, "asChild" | "tone" | "icon"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/** A toggle inside a menu, e.g. column visibility. Keeps the menu open. */
export const DropdownMenuCheckboxItem = forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(function DropdownMenuCheckboxItem(
  { checked, onCheckedChange, onSelect, shortcut, disabled, className, children, ...props },
  ref,
) {
  const handlers = useSelect((e) => {
    onSelect?.(e);
    onCheckedChange?.(!checked);
  }, disabled, true);
  return (
    <div
      ref={ref}
      role="menuitemcheckbox"
      aria-checked={checked}
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      className={cx("kivu-menu__item", className)}
      {...handlers}
      {...props}
    >
      <span className="kivu-menu__icon kivu-menu__check" aria-hidden="true">{checked && <Check />}</span>
      <span className="kivu-menu__text">{children}</span>
      {shortcut != null && <span className="kivu-menu__shortcut">{shortcut}</span>}
    </div>
  );
});

export const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DropdownMenuLabel(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="presentation" className={cx("kivu-menu__label", className)} {...props} />;
});

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DropdownMenuSeparator(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="separator" className={cx("kivu-menu__separator", className)} {...props} />;
});
