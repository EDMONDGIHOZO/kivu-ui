import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface IconTileProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** `soft`: tinted tile (default). `solid`: filled brand gradient with a white icon. */
  variant?: "soft" | "solid";
  tone?: "primary" | "accent";
}

/** Rounded-square icon holder with a faint wave texture, echoing the Kivu UI mark. */
export const IconTile = forwardRef<HTMLSpanElement, IconTileProps>(function IconTile(
  { size = "md", variant = "soft", tone = "primary", className, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("kivu-icon-tile", `kivu-icon-tile--${size}`, `kivu-icon-tile--${variant}`, `kivu-icon-tile--${tone}`, className)}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {children}
    </span>
  );
});

/** @deprecated Renamed to `IconTile`. `lines` is ignored. Will be removed in 1.0. */
export const Medallion = forwardRef<HTMLSpanElement, IconTileProps & { lines?: boolean }>(function Medallion(
  { lines: _lines, ...props },
  ref,
) {
  return <IconTile ref={ref} {...props} />;
});
export type MedallionProps = IconTileProps & { lines?: boolean };
