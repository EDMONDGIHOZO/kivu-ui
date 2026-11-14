import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional call-to-action (e.g. a small Button) shown after the message. */
  action?: ReactNode;
  /** Show a close button. */
  dismissible?: boolean;
  onDismiss?: () => void;
  variant?: "brand" | "subtle" | "accent";
}

/** Full-width announcement bar. */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  { action, dismissible, onDismiss, variant = "brand", className, children, ...props },
  ref,
) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div ref={ref} role="region" aria-label="Announcement" className={cx("kivu-banner", `kivu-banner--${variant}`, className)} {...props}>
      <div className="kivu-banner__content">
        <p className="kivu-banner__message">{children}</p>
        {action}
      </div>
      {dismissible && (
        <button
          type="button"
          className="kivu-banner__close"
          aria-label="Dismiss announcement"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );
});
