import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { Slot } from "../../utils/slot";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "outline" | "subtle" | "glass" | "brand";
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "md" | "lg" | "xl";
  /** Adds hover lift — useful for clickable cards. */
  interactive?: boolean;
  asChild?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "elevated", padding = "md", radius = "lg", interactive, asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      className={cx(
        "kivu-card",
        `kivu-card--${variant}`,
        `kivu-card--p-${padding}`,
        `kivu-card--r-${radius}`,
        interactive && "kivu-card--interactive",
        className,
      )}
      {...props}
    />
  );
});
