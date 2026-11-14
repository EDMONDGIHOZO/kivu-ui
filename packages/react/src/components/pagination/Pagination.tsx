import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { ChevronLeft, ChevronRight } from "../../utils/icons";

export type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * Page numbers to show, with ellipses. Always keeps the first/last
 * `boundaries` pages and `siblings` pages either side of the current one.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1, boundaries = 1): PaginationItem[] {
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  const total = boundaries * 2 + siblings * 2 + 3;
  if (pageCount <= total) return range(1, pageCount);

  const start = Math.max(Math.min(page - siblings, pageCount - boundaries - siblings * 2 - 1), boundaries + 2);
  const end = Math.min(Math.max(page + siblings, boundaries + siblings * 2 + 2), pageCount - boundaries - 1);
  return [
    ...range(1, boundaries),
    start > boundaries + 2 ? "ellipsis-start" : boundaries + 1,
    ...range(start, end),
    end < pageCount - boundaries - 1 ? "ellipsis-end" : pageCount - boundaries,
    ...range(pageCount - boundaries + 1, pageCount),
  ];
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current page, starting at 1. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Pages shown either side of the current page. */
  siblings?: number;
  /** Pages always shown at the start and end. */
  boundaries?: number;
  size?: "sm" | "md";
  /** Only Previous / Next with "Page x of y" (good for narrow spaces). */
  compact?: boolean;
  disabled?: boolean;
}

/** Page navigation for tables and lists. */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, siblings = 1, boundaries = 1, size = "md", compact, disabled, className, ...props },
  ref,
) {
  const count = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), count);
  const go = (p: number) => {
    if (!disabled && p >= 1 && p <= count && p !== current) onPageChange(p);
  };

  return (
    <nav
      ref={ref}
      aria-label={props["aria-label"] ?? "Pagination"}
      className={cx("kivu-pagination", `kivu-pagination--${size}`, className)}
      {...props}
    >
      <button
        type="button"
        className="kivu-pagination__btn kivu-pagination__step"
        onClick={() => go(current - 1)}
        disabled={disabled || current <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
        <span className="kivu-pagination__step-text">Previous</span>
      </button>

      {compact ? (
        <span className="kivu-pagination__status">
          Page {current} of {count}
        </span>
      ) : (
        <ul className="kivu-pagination__list">
          {paginationRange(current, count, siblings, boundaries).map((item) =>
            typeof item === "number" ? (
              <li key={item}>
                <button
                  type="button"
                  className="kivu-pagination__btn kivu-pagination__page"
                  aria-current={item === current ? "page" : undefined}
                  aria-label={`Page ${item}`}
                  disabled={disabled}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className="kivu-pagination__ellipsis" aria-hidden="true">
                …
              </li>
            ),
          )}
        </ul>
      )}

      <button
        type="button"
        className="kivu-pagination__btn kivu-pagination__step"
        onClick={() => go(current + 1)}
        disabled={disabled || current >= count}
        aria-label="Next page"
      >
        <span className="kivu-pagination__step-text">Next</span>
        <ChevronRight />
      </button>
    </nav>
  );
});
