import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Close } from "../../utils/icons";
import type { Tone } from "../../utils/types";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "soft" | "outline";
  tone?: Tone;
  size?: "sm" | "md";
  /** Uppercase, letter-spaced label (eyebrow style). */
  caps?: boolean;
  leftSection?: ReactNode;
  /** Adds a × button, turning the badge into a removable chip (e.g. an active filter). */
  onRemove?: () => void;
  /** Accessible name for the × button. Defaults to "Remove <text>" when children is a string. */
  removeLabel?: string;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "soft", tone = "primary", size = "md", caps, leftSection, onRemove, removeLabel, className, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(
        "kivu-badge",
        `kivu-badge--${variant}`,
        `kivu-badge--${tone}`,
        `kivu-badge--${size}`,
        caps && "kivu-badge--caps",
        onRemove && "kivu-badge--removable",
        className,
      )}
      {...props}
    >
      {leftSection}
      {children}
      {onRemove && (
        <button
          type="button"
          className="kivu-badge__remove"
          aria-label={removeLabel ?? (typeof children === "string" ? `Remove ${children}` : "Remove")}
          onClick={onRemove}
        >
          <Close />
        </button>
      )}
    </span>
  );
});
