import { forwardRef, useEffect, useId, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/refs";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDialogElement>, "title"> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Close when clicking the backdrop (default true). */
  closeOnBackdrop?: boolean;
  /** Hide the × button. */
  hideCloseButton?: boolean;
}

/**
 * Modal built on the native `<dialog>` element: focus trapping, Escape-to-close
 * and top-layer rendering come from the browser, so no portal is needed.
 */
export const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, onClose, title, description, footer, size = "md", closeOnBackdrop = true, hideCloseButton, className, children, ...props },
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

  return (
    <dialog
      ref={composeRefs(ref, inner)}
      className={cx("kivu-modal", `kivu-modal--${size}`, className)}
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
      <div className="kivu-modal__panel">
        {(title || !hideCloseButton) && (
          <div className="kivu-modal__header">
            {title && <h2 id={titleId} className="kivu-modal__title">{title}</h2>}
            {!hideCloseButton && (
              <button type="button" className="kivu-modal__close" aria-label="Close" onClick={onClose}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            )}
          </div>
        )}
        {description && <p id={descId} className="kivu-modal__description">{description}</p>}
        <div className="kivu-modal__body">{children}</div>
        {footer && <div className="kivu-modal__footer">{footer}</div>}
      </div>
    </dialog>
  );
});
