import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "../../utils/icons";

export type SortDirection = "asc" | "desc";
export type CellAlign = "start" | "center" | "end";

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Row height: compact for dense data, comfortable for lists with avatars. */
  density?: "compact" | "default" | "comfortable";
  /** Keep the header visible while the table scrolls (set `maxHeight` too). */
  stickyHeader?: boolean;
  /** Alternate row backgrounds. */
  striped?: boolean;
  /** Highlight the row under the pointer (default true). */
  hover?: boolean;
  /** Scroll vertically past this height. */
  maxHeight?: CSSProperties["maxHeight"];
  /** Drop the outer border and radius, e.g. inside a Card. */
  bare?: boolean;
  /** Class for the scrolling wrapper (`className` goes to the `<table>`). */
  wrapperClassName?: string;
}

/** Styled `<table>` primitives. For sorting/selection out of the box, use `DataTable`. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "default", stickyHeader, striped, hover = true, maxHeight, bare, wrapperClassName, className, ...props },
  ref,
) {
  return (
    <div
      className={cx("kivu-table-wrap", bare && "kivu-table-wrap--bare", wrapperClassName)}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <table
        ref={ref}
        className={cx(
          "kivu-table",
          `kivu-table--${density}`,
          stickyHeader && "kivu-table--sticky",
          striped && "kivu-table--striped",
          hover && "kivu-table--hover",
          className,
        )}
        {...props}
      />
    </div>
  );
});

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader(
  { className, ...props },
  ref,
) {
  return <thead ref={ref} className={cx("kivu-table__head", className)} {...props} />;
});

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(
  { className, ...props },
  ref,
) {
  return <tbody ref={ref} className={cx("kivu-table__body", className)} {...props} />;
});

export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableFooter(
  { className, ...props },
  ref,
) {
  return <tfoot ref={ref} className={cx("kivu-table__foot", className)} {...props} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      aria-selected={selected}
      data-state={selected ? "selected" : undefined}
      className={cx("kivu-table__row", className)}
      {...props}
    />
  );
});

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: CellAlign;
  /** Current sort of this column. `false` = sortable but not sorted. Omit for unsortable. */
  sort?: SortDirection | false;
  /** Makes the header a sort button. */
  onSort?: () => void;
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { align = "start", sort, onSort, className, children, scope = "col", ...props },
  ref,
) {
  const sortable = onSort != null;
  return (
    <th
      ref={ref}
      scope={scope}
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cx("kivu-table__th", align !== "start" && `kivu-table__cell--${align}`, className)}
      {...props}
    >
      {sortable ? (
        <button type="button" className="kivu-table__sort" data-sorted={sort || undefined} onClick={onSort}>
          {children}
          <span className="kivu-table__sort-icon" aria-hidden="true">
            {sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ChevronsUpDown />}
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: CellAlign;
  /** Right-aligned, fixed-width digits so numbers line up. */
  numeric?: boolean;
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric, className, ...props },
  ref,
) {
  const a = align ?? (numeric ? "end" : "start");
  return (
    <td
      ref={ref}
      className={cx("kivu-table__td", a !== "start" && `kivu-table__cell--${a}`, numeric && "kivu-table__cell--numeric", className)}
      {...props}
    />
  );
});

export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption(
  { className, ...props },
  ref,
) {
  return <caption ref={ref} className={cx("kivu-table__caption", className)} {...props} />;
});
