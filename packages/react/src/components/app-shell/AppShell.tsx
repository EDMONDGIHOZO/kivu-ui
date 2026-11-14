import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { PanelLeft } from "../../utils/icons";
import { Slot } from "../../utils/slot";
import { useControllableState } from "../../utils/use-controllable";
import { IconButton, type IconButtonProps } from "../button/IconButton";
import { Drawer, InDrawerContext } from "../drawer/Drawer";
import { Tooltip } from "../tooltip/Tooltip";

/** Width at which the sidebar stops being a drawer (matches Tailwind's `lg`). */
const DESKTOP_QUERY = "(min-width: 64rem)";

interface AppShellContextValue {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  /** Collapse on desktop, open the drawer on mobile. */
  toggleSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

/** Sidebar state from the nearest `<AppShell>`, or `null` outside one. */
export function useAppShell() {
  return useContext(AppShellContext);
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Usually a `<Sidebar>`. On small screens it moves into a slide-out drawer. */
  sidebar?: ReactNode;
  /** Usually a `<Topbar>`. Stays at the top of the main column. */
  header?: ReactNode;
  sidebarCollapsed?: boolean;
  defaultSidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Padding around the page content. */
  padding?: "none" | "sm" | "md" | "lg";
  /** Class for the `<main>` element. */
  mainClassName?: string;
}

/**
 * Dashboard frame: sidebar on the left, a top bar and scrolling content on the right.
 * Below 1024px the sidebar becomes a drawer opened with `<SidebarTrigger>`.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  {
    sidebar, header, sidebarCollapsed, defaultSidebarCollapsed = false, onSidebarCollapsedChange,
    padding = "md", mainClassName, className, children, ...props
  },
  ref,
) {
  const [collapsed, setCollapsed] = useControllableState(sidebarCollapsed, defaultSidebarCollapsed, onSidebarCollapsedChange);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = useCallback(() => {
    const desktop = typeof window !== "undefined" && window.matchMedia?.(DESKTOP_QUERY).matches;
    if (desktop) setCollapsed(!collapsed);
    else setMobileOpen(!mobileOpen);
  }, [collapsed, mobileOpen, setCollapsed]);
  const ctx = useMemo(
    () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, toggleSidebar }),
    [collapsed, setCollapsed, mobileOpen, toggleSidebar],
  );

  return (
    <AppShellContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx("kivu-shell", collapsed && "kivu-shell--collapsed", !sidebar && "kivu-shell--no-sidebar", className)}
        data-collapsed={collapsed || undefined}
        {...props}
      >
        {sidebar != null && <div className="kivu-shell__aside">{sidebar}</div>}
        <div className="kivu-shell__main">
          {header}
          <main className={cx("kivu-shell__content", `kivu-shell__content--${padding}`, mainClassName)}>{children}</main>
        </div>
        {sidebar != null && mobileOpen && (
          <Drawer open onClose={() => setMobileOpen(false)} side="left" size="sm" bare hideCloseButton aria-label="Navigation" className="kivu-shell__drawer">
            {sidebar}
          </Drawer>
        )}
      </div>
    </AppShellContext.Provider>
  );
});

export type SidebarTriggerProps = Omit<IconButtonProps, "aria-label"> & { "aria-label"?: string };

/** Opens the mobile drawer, or collapses/expands the sidebar on desktop. */
export const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(function SidebarTrigger(
  { variant = "ghost", shape = "square", size = "sm", onClick, children, ...props },
  ref,
) {
  const ctx = useAppShell();
  return (
    <IconButton
      ref={ref}
      variant={variant}
      shape={shape}
      size={size}
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      aria-expanded={ctx ? !ctx.collapsed : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx?.toggleSidebar();
      }}
      {...props}
    >
      {children ?? <PanelLeft />}
    </IconButton>
  );
});

/* ------------------------------------------------------------------ Sidebar */

/** Whether labels should be hidden (desktop + collapsed, never inside the mobile drawer). */
function useIconOnly() {
  const ctx = useAppShell();
  const inDrawer = useContext(InDrawerContext);
  return !!ctx?.collapsed && !inDrawer;
}

export const Sidebar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Sidebar(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx("kivu-sidebar", useIconOnly() && "kivu-sidebar--icons", className)} {...props} />;
});

/** Top of the sidebar: logo, workspace switcher. When collapsed, only the first child (the logo) stays visible. */
export const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx("kivu-sidebar__header", className)} {...props} />;
});

/** Scrollable navigation area. Renders a `<nav>`. */
export const SidebarContent = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function SidebarContent(
  { className, ...props },
  ref,
) {
  return <nav ref={ref} aria-label={props["aria-label"] ?? "Main"} className={cx("kivu-sidebar__content", className)} {...props} />;
});

/** Bottom of the sidebar: user menu, settings, help. When collapsed, only the first child stays visible. */
export const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SidebarFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx("kivu-sidebar__footer", className)} {...props} />;
});

export interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Small heading above the group. Hidden when the sidebar is collapsed. */
  label?: ReactNode;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, className, children, ...props },
  ref,
) {
  const id = useId();
  return (
    <div ref={ref} role="group" aria-labelledby={label != null ? id : undefined} className={cx("kivu-sidebar__group", className)} {...props}>
      {label != null && <p id={id} className="kivu-sidebar__group-label">{label}</p>}
      <ul className="kivu-sidebar__list">{children}</ul>
    </div>
  );
});

export interface SidebarItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: ReactNode;
  /** Count or status shown on the right (e.g. a number or `<Badge>`). */
  badge?: ReactNode;
  /** Marks the current page (`aria-current="page"`). */
  active?: boolean;
  /** Render your router's link: `<SidebarItem asChild icon={…}><Link href="/x">Projects</Link></SidebarItem>`. */
  asChild?: boolean;
}

/** A navigation link. Renders an `<a>` inside an `<li>`; place it in a `<SidebarGroup>`. */
export const SidebarItem = forwardRef<HTMLAnchorElement, SidebarItemProps>(function SidebarItem(
  { icon, badge, active, asChild, className, children, onClick, ...props },
  ref,
) {
  const ctx = useAppShell();
  const iconOnly = useIconOnly();

  const inner = (label: ReactNode) => (
    <>
      {icon != null && <span className="kivu-sidebar__icon" aria-hidden="true">{icon}</span>}
      <span className="kivu-sidebar__label">{label}</span>
      {badge != null && <span className="kivu-sidebar__badge">{badge}</span>}
    </>
  );

  const shared = {
    ref,
    "aria-current": active ? ("page" as const) : undefined,
    "data-active": active || undefined,
    className: cx("kivu-sidebar__item", className),
    onClick: (e: ReactMouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (ctx?.mobileOpen) ctx.setMobileOpen(false);
    },
    ...props,
  };

  let el: ReactElement;
  if (asChild) {
    const child = Children.only(children) as ReactElement<{ children?: ReactNode }>;
    el = isValidElement(child) ? <Slot {...shared}>{cloneElement(child, undefined, inner(child.props.children))}</Slot> : <></>;
  } else {
    el = <a {...shared}>{inner(children)}</a>;
  }

  const labelText = asChild
    ? (Children.only(children) as ReactElement<{ children?: ReactNode }>).props.children
    : children;
  return <li className="kivu-sidebar__li">{iconOnly ? <Tooltip content={labelText} side="right">{el}</Tooltip> : el}</li>;
});

/* ------------------------------------------------------------------- Topbar */

/** Sticky bar at the top of the main column: sidebar trigger, search, user menu. */
export const Topbar = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Topbar(
  { className, ...props },
  ref,
) {
  return <header ref={ref} className={cx("kivu-topbar", className)} {...props} />;
});
