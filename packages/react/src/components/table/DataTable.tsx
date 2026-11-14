import { useMemo, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllableState } from "../../utils/use-controllable";
import { Checkbox } from "../checkbox/Checkbox";
import { EmptyState } from "../empty-state/EmptyState";
import { Skeleton } from "../skeleton/Skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  type CellAlign,
  type SortDirection,
  type TableProps,
} from "./Table";

export interface SortState {
  id: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Unique column id; also the sort id. */
  id: string;
  header: ReactNode;
  /** Value used for sorting and the default cell: a key of the row or a function. */
  accessor?: keyof T | ((row: T) => unknown);
  /** Custom cell content. Defaults to the accessor value. */
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  /** Custom comparison for sorting (ascending). */
  sortFn?: (a: T, b: T) => number;
  align?: CellAlign;
  /** Right-aligned with fixed-width digits. */
  numeric?: boolean;
  width?: string | number;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> extends Omit<TableProps, "children"> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable row id. Defaults to `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string;

  /** Adds a checkbox column. */
  selectable?: boolean;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;

  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Don't sort `data` in the browser (you sort on the server from `onSortChange`). */
  manualSort?: boolean;

  loading?: boolean;
  /** Skeleton rows shown while loading with no data. */
  loadingRows?: number;
  /** Shown when there are no rows. A string becomes the EmptyState title. */
  empty?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Accessible name for the table. */
  "aria-label"?: string;
}

function readValue<T>(row: T, accessor: DataTableColumn<T>["accessor"]): unknown {
  if (accessor == null) return undefined;
  return typeof accessor === "function" ? accessor(row) : row[accessor];
}

function formatCell(v: unknown): ReactNode {
  if (v == null) return null;
  if (v instanceof Date) return v.toLocaleDateString();
  if (typeof v === "object") return String(v);
  return v as ReactNode;
}

const collator = typeof Intl !== "undefined" ? new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }) : null;

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  const sa = String(a);
  const sb = String(b);
  return collator ? collator.compare(sa, sb) : sa < sb ? -1 : sa > sb ? 1 : 0;
}

const INTERACTIVE = "a, button, input, select, textarea, label, [role='menuitem'], [role='checkbox'], [data-row-click-ignore]";

/**
 * Table with sorting, row selection, loading and empty states built in.
 * Column-driven: describe columns once, pass rows as `data`.
 */
export function DataTable<T>({
  columns, data, getRowId, selectable, selectedIds, defaultSelectedIds = [], onSelectedIdsChange,
  sort, defaultSort = null, onSortChange, manualSort, loading, loadingRows = 5, empty, onRowClick,
  className, ...tableProps
}: DataTableProps<T>) {
  const [currentSort, setSort] = useControllableState<SortState | null>(sort, defaultSort, onSortChange);
  const [selected, setSelected] = useControllableState<string[]>(selectedIds, defaultSelectedIds, onSelectedIdsChange);

  const rowId = (row: T, i: number) =>
    getRowId ? getRowId(row, i) : String((row as { id?: unknown })?.id ?? i);

  const rows = useMemo(() => {
    const withIds = data.map((row, i) => ({ row, id: rowId(row, i), index: i }));
    if (!currentSort || manualSort) return withIds;
    const col = columns.find((c) => c.id === currentSort.id);
    if (!col) return withIds;
    const dir = currentSort.direction === "asc" ? 1 : -1;
    return [...withIds].sort((x, y) => {
      const r = col.sortFn ? col.sortFn(x.row, y.row) : compare(readValue(x.row, col.accessor), readValue(y.row, col.accessor));
      return r * dir || x.index - y.index;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, columns, currentSort, manualSort, getRowId]);

  const selectedSet = new Set(selected);
  const visibleIds = rows.map((r) => r.id);
  const selectedVisible = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = visibleIds.length > 0 && selectedVisible === visibleIds.length;

  const toggleSort = (id: string) => {
    if (!currentSort || currentSort.id !== id) setSort({ id, direction: "asc" });
    else if (currentSort.direction === "asc") setSort({ id, direction: "desc" });
    else setSort(null);
  };
  const toggleRow = (id: string) =>
    setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  const toggleAll = () =>
    setSelected(allSelected ? selected.filter((s) => !visibleIds.includes(s)) : Array.from(new Set([...selected, ...visibleIds])));

  const colCount = columns.length + (selectable ? 1 : 0);
  const showSkeleton = loading && rows.length === 0;

  return (
    <Table className={cx("kivu-data-table", className)} aria-busy={loading || undefined} {...tableProps}>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="kivu-table__select">
              <Checkbox
                aria-label="Select all rows"
                checked={allSelected}
                indeterminate={selectedVisible > 0 && !allSelected}
                onChange={toggleAll}
                disabled={visibleIds.length === 0}
              />
            </TableHead>
          )}
          {columns.map((c) => (
            <TableHead
              key={c.id}
              align={c.align ?? (c.numeric ? "end" : "start")}
              style={c.width != null ? { width: c.width } : undefined}
              className={c.headerClassName}
              sort={c.sortable ? (currentSort?.id === c.id ? currentSort.direction : false) : undefined}
              onSort={c.sortable ? () => toggleSort(c.id) : undefined}
            >
              {c.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {showSkeleton &&
          Array.from({ length: loadingRows }, (_, i) => (
            <TableRow key={`sk-${i}`} aria-hidden="true">
              {selectable && <TableCell className="kivu-table__select"><Skeleton width="1rem" height="1rem" /></TableCell>}
              {columns.map((c) => (
                <TableCell key={c.id}><Skeleton shape="text" width={`${55 + ((i * 17 + c.id.length * 11) % 40)}%`} /></TableCell>
              ))}
            </TableRow>
          ))}
        {!showSkeleton && rows.length === 0 && (
          <TableRow className="kivu-table__empty-row">
            <TableCell colSpan={colCount}>
              {typeof empty === "string" || empty == null ? <EmptyState size="sm" title={empty ?? "No results"} /> : empty}
            </TableCell>
          </TableRow>
        )}
        {rows.map(({ row, id, index }) => {
          const isSelected = selectedSet.has(id);
          return (
            <TableRow
              key={id}
              selected={selectable ? isSelected : undefined}
              className={cx(onRowClick && "kivu-table__row--clickable")}
              onClick={
                onRowClick
                  ? (e) => {
                      if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
                      onRowClick(row);
                    }
                  : undefined
              }
            >
              {selectable && (
                <TableCell className="kivu-table__select">
                  <Checkbox aria-label="Select row" checked={isSelected} onChange={() => toggleRow(id)} />
                </TableCell>
              )}
              {columns.map((c) => (
                <TableCell key={c.id} align={c.align} numeric={c.numeric} className={c.className}>
                  {c.cell ? c.cell(row, index) : formatCell(readValue(row, c.accessor))}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
