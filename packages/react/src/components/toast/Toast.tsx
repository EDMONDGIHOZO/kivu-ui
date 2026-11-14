import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "../../utils/cx";
import { AlertCircle, CheckCircle, Close, Info } from "../../utils/icons";

export type ToastTone = "neutral" | "success" | "danger" | "info";

export interface ToastOptions {
  /** Pass an id to update or dedupe an existing toast. */
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  /** Milliseconds before closing. `Infinity` keeps it until dismissed. */
  duration?: number;
  /** One action button, e.g. Undo. */
  action?: { label: ReactNode; onClick: () => void };
  icon?: ReactNode;
}

interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

/* ---------------------------------------------------------------- store */

let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];
let counter = 0;

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function add(opts: ToastOptions): string {
  const id = opts.id ?? `kivu-toast-${++counter}`;
  const existing = toasts.find((t) => t.id === id);
  const item: ToastItem = { ...opts, id, createdAt: existing?.createdAt ?? Date.now() };
  toasts = existing ? toasts.map((t) => (t.id === id ? item : t)) : [...toasts, item];
  emit();
  return id;
}

type ToastInput = ReactNode | ToastOptions;
const isOptions = (v: unknown): v is ToastOptions =>
  typeof v === "object" && v !== null && "title" in v && !("$$typeof" in v);
const normalise = (input: ToastInput, extra?: Partial<ToastOptions>): ToastOptions =>
  isOptions(input) ? { ...input, ...extra } : { title: input, ...extra };

/**
 * Show a notification. Needs one `<Toaster />` mounted in your app.
 *
 *   toast("Saved");
 *   toast.success("Invoice sent", { description: "To amara@nyota.co" });
 *   toast({ title: "Deleted 3 projects", action: { label: "Undo", onClick: restore } });
 */
export function toast(input: ToastInput, opts?: Partial<ToastOptions>): string {
  return add(normalise(input, opts));
}
toast.success = (input: ToastInput, opts?: Partial<ToastOptions>) => add(normalise(input, { tone: "success", ...opts }));
toast.error = (input: ToastInput, opts?: Partial<ToastOptions>) => add(normalise(input, { tone: "danger", ...opts }));
toast.info = (input: ToastInput, opts?: Partial<ToastOptions>) => add(normalise(input, { tone: "info", ...opts }));
/** Close one toast, or all of them when called without an id. */
toast.dismiss = (id?: string) => {
  toasts = id == null ? [] : toasts.filter((t) => t.id !== id);
  emit();
};

/* -------------------------------------------------------------- Toaster */

export interface ToasterProps {
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center" | "bottom-left";
  /** Default time on screen, in ms. */
  duration?: number;
  /** Most toasts visible at once; older ones are hidden until there's room. */
  max?: number;
  className?: string;
}

const toneIcon: Record<ToastTone, ReactNode> = {
  neutral: null,
  success: <CheckCircle />,
  danger: <AlertCircle />,
  info: <Info />,
};

/** Renders the toasts. Mount once, near the root of your app. */
export function Toaster({ position = "bottom-right", duration = 5000, max = 4, className }: ToasterProps) {
  const items = useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
  const paused = useRef(false);
  // Mount after hydration; the live region then stays in the DOM so new toasts are announced.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const visible = items.slice(-max);

  return createPortal(
    <section aria-label="Notifications" className={cx("kivu-toaster", `kivu-toaster--${position}`, className)}>
      <ol
        className="kivu-toaster__list"
        aria-live="polite"
        aria-relevant="additions"
        onPointerEnter={() => (paused.current = true)}
        onPointerLeave={() => (paused.current = false)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
      >
        {visible.map((t) => (
          <ToastView key={t.id} item={t} duration={t.duration ?? duration} paused={paused} />
        ))}
      </ol>
    </section>,
    document.body,
  );
}

function ToastView({ item, duration, paused }: { item: ToastItem; duration: number; paused: { current: boolean } }) {
  const tone = item.tone ?? "neutral";
  // Count down only while not paused (hover/focus), so people have time to read or act.
  useEffect(() => {
    if (!Number.isFinite(duration)) return;
    let left = duration;
    let last = Date.now();
    const tick = setInterval(() => {
      const now = Date.now();
      if (!paused.current) left -= now - last;
      last = now;
      if (left <= 0) toast.dismiss(item.id);
    }, 100);
    return () => clearInterval(tick);
  }, [item.id, item.createdAt, duration, paused]);

  const icon = item.icon ?? toneIcon[tone];
  return (
    <li
      className={cx("kivu-toast", `kivu-toast--${tone}`)}
      role={tone === "danger" ? "alert" : undefined}
    >
      {icon != null && <span className="kivu-toast__icon" aria-hidden="true">{icon}</span>}
      <div className="kivu-toast__body">
        <p className="kivu-toast__title">{item.title}</p>
        {item.description != null && <p className="kivu-toast__description">{item.description}</p>}
      </div>
      {item.action && (
        <button
          type="button"
          className="kivu-toast__action"
          onClick={() => {
            item.action!.onClick();
            toast.dismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      )}
      <button type="button" className="kivu-toast__close" aria-label="Dismiss notification" onClick={() => toast.dismiss(item.id)}>
        <Close />
      </button>
    </li>
  );
}
