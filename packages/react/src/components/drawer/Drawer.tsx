import { createContext, forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Close } from "../../utils/icons";
import { composeRefs } from "../../utils/refs";

/** True for anything rendered inside a Drawer (used by Sidebar to ignore "collapsed"). */
export const InDrawerContext = createContext(false);

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDialogElement>, "title"> {
  open: boolean;
  onClose: () => void;
  /** Edge the panel slides in from. */
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  title?: ReactNode;
  description?: ReactNode;
  /** Sticky footer, e.g. Save / Cancel buttons. */
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
  hideCloseButton?: boolean;
  /** Remove the body padding (for full-bleed content such as a Sidebar). */
  bare?: boolean;
}

/**
 * Side panel for record details, filters and mobile navigation. Built on the
 * native `<dialog>`, so focus trapping and Escape handling come from the browser.
 */
export const Drawer = forwardRef<HTMLDialogElement, DrawerProps>(function Drawer(
  {
    open, onClose, side = "right", size = "md", title, description, footer, closeOnBackdrop = true,
    hideCloseButton, bare, className, children, ...props
  },
  ref,
) {
  const inner = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const d = inner.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    else if (!open && d.open) d.close?.();
  }, [open]);

  const hasHeader = title != null || !hideCloseButton;
  return (
    <dialog
      ref={composeRefs(ref, inner)}
      className={cx("kivu-drawer", `kivu-drawer--${side}`, `kivu-drawer--${size}`, bare && "kivu-drawer--bare", className)}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      {...props}
    >
      <InDrawerContext.Provider value={true}>
        <div className="kivu-drawer__panel">
          {hasHeader && (
            <div className="kivu-drawer__header">
              <div className="kivu-drawer__heading">
                {title != null && <h2 id={titleId} className="kivu-drawer__title">{title}</h2>}
                {description != null && <p id={descId} className="kivu-drawer__description">{description}</p>}
              </div>
              {!hideCloseButton && (
                <button type="button" className="kivu-drawer__close" aria-label="Close" onClick={onClose}>
                  <Close />
                </button>
              )}
            </div>
          )}
          <div className="kivu-drawer__body">{children}</div>
          {footer != null && <div className="kivu-drawer__footer">{footer}</div>}
        </div>
      </InDrawerContext.Provider>
    </dialog>
  );
});
