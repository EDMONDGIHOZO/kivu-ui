import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../utils/types";
import type { ButtonTone, ButtonVariant } from "./Button";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required: icon-only buttons need an accessible name. */
  "aria-label": string;
  variant?: Exclude<ButtonVariant, "link"> | "white";
  tone?: ButtonTone;
  size?: Size;
  /** Fully round (default) or rounded square. */
  shape?: "circle" | "square";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "solid", tone = "primary", size = "md", shape = "circle", className, type, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cx(
        "kivu-btn",
        "kivu-icon-btn",
        `kivu-btn--${variant}`,
        `kivu-icon-btn--${size}`,
        `kivu-icon-btn--${shape}`,
        tone !== "primary" && `kivu-btn--tone-${tone}`,
        className,
      )}
      {...props}
    />
  );
});
