/* Small local-time date helpers (no dependencies). Dates are compared by calendar day. */

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export function addMonths(d: Date, n: number) {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = endOfMonth(first).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}
export const dayKey = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
export const isSameDay = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && dayKey(a) === dayKey(b);
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const monthDiff = (a: Date, b: Date) => (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
export const startOfWeek = (d: Date, weekStartsOn: number) => addDays(d, -((d.getDay() - weekStartsOn + 7) % 7));

/** ISO `yyyy-mm-dd` in local time (for hidden form inputs). */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function formatDate(d: Date, locale?: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function formatRange(r: DateRange, locale?: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  if (!r.from) return "";
  if (!r.to) return `${formatDate(r.from, locale, opts)} –`;
  const fmt = new Intl.DateTimeFormat(locale, opts) as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };
  return fmt.formatRange ? fmt.formatRange(r.from, r.to) : `${fmt.format(r.from)} – ${fmt.format(r.to)}`;
}

export interface DateRangePreset {
  label: string;
  /** Called when the preset is picked, so "today" is always current. */
  range: () => DateRange;
}

/** Common dashboard ranges. Pass your own array to `presets` to change them. */
export const defaultDateRangePresets: DateRangePreset[] = [
  { label: "Today", range: () => { const t = startOfDay(new Date()); return { from: t, to: t }; } },
  { label: "Yesterday", range: () => { const y = addDays(startOfDay(new Date()), -1); return { from: y, to: y }; } },
  { label: "Last 7 days", range: () => { const t = startOfDay(new Date()); return { from: addDays(t, -6), to: t }; } },
  { label: "Last 30 days", range: () => { const t = startOfDay(new Date()); return { from: addDays(t, -29), to: t }; } },
  { label: "This month", range: () => { const t = startOfDay(new Date()); return { from: startOfMonth(t), to: t }; } },
  {
    label: "Last month",
    range: () => {
      const prev = addMonths(startOfMonth(new Date()), -1);
      return { from: prev, to: endOfMonth(prev) };
    },
  },
  { label: "Year to date", range: () => { const t = startOfDay(new Date()); return { from: new Date(t.getFullYear(), 0, 1), to: t }; } },
];
