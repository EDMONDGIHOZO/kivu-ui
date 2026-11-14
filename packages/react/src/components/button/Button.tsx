import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Slot } from "../../utils/slot";
import type { Size } from "../../utils/types";
import { Spinner } from "../spinner/Spinner";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "glass" | "link";
export type ButtonTone = "primary" | "accent" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: Size;
  /** Stretch to the full width of the parent. */
  fullWidth?: boolean;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  /** Render the child element (e.g. a router `<Link>`) with button styles. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "solid",
    tone = "primary",
    size = "md",
    fullWidth,
    loading,
    leftSection,
    rightSection,
    asChild,
    disabled,
    className,
    children,
    type,
    ...props
  },
  ref,
) {
  const classes = cx(
    "kivu-btn",
    `kivu-btn--${variant}`,
    `kivu-btn--${size}`,
    tone !== "primary" && `kivu-btn--tone-${tone}`,
    fullWidth && "kivu-btn--full",
    loading && "kivu-btn--loading",
    className,
  );

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} aria-disabled={disabled || loading || undefined} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size="sm" label="Loading" /> : leftSection}
      {children != null && <span className="kivu-btn__label">{children}</span>}
      {rightSection}
    </button>
  );
});
