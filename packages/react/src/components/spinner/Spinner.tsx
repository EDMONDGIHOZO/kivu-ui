import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../utils/types";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: Size;
  /** Accessible label announced to screen readers. */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={cx("kivu-spinner", `kivu-spinner--${size}`, className)}
      {...props}
    />
  );
});
