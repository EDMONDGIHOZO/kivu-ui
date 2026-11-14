import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { Slot } from "../../utils/slot";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  asChild?: boolean;
}

/** Centered, max-width page container with responsive side gutters. */
export const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { size = "xl", asChild, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cx("kivu-container", `kivu-container--${size}`, className)} {...props} />;
});

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLHRElement, DividerProps>(function Divider(
  { orientation = "horizontal", className, ...props },
  ref,
) {
  return (
    <hr
      ref={ref}
      aria-orientation={orientation}
      className={cx("kivu-divider", `kivu-divider--${orientation}`, className)}
      {...props}
    />
  );
});
