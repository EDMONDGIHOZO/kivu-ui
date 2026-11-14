import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  /** `circle` for avatars; `text` matches a line of body text. */
  shape?: "rect" | "circle" | "text";
}

/**
 * Loading placeholder. Hidden from screen readers; put `aria-busy="true"` on
 * the region that is loading.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { width, height, shape = "rect", className, style, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx("kivu-skeleton", `kivu-skeleton--${shape}`, className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
});

export interface SkeletonTextProps extends HTMLAttributes<HTMLSpanElement> {
  lines?: number;
}

/** Several text-line skeletons; the last one is shorter. */
export const SkeletonText = forwardRef<HTMLSpanElement, SkeletonTextProps>(function SkeletonText(
  { lines = 3, className, ...props },
  ref,
) {
  return (
    <span ref={ref} aria-hidden="true" className={cx("kivu-skeleton-text", className)} {...props}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} shape="text" width={i === lines - 1 && lines > 1 ? "60%" : "100%"} />
      ))}
    </span>
  );
});
