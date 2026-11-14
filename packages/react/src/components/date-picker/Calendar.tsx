import { forwardRef, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent } from "react";
import { cx } from "../../utils/cx";
import { ChevronLeft, ChevronRight } from "../../utils/icons";
import { useControllableState } from "../../utils/use-controllable";
import {
  addDays,
  addMonths,
  dayKey,
  isSameDay,
  isSameMonth,
  monthDiff,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type DateRange,
} from "./dates";

interface CalendarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** First visible month (controlled). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  numberOfMonths?: number;
  /** 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 locale for month and weekday names. Defaults to the browser's. */
  locale?: string;
}

export interface CalendarSingleProps extends CalendarBaseProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  mode: "range";
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const EMPTY_RANGE: DateRange = { from: null, to: null };

/** Month grid for picking a date or a date range. Fully keyboard accessible. */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = "single", month, defaultMonth, onMonthChange, numberOfMonths = 1, weekStartsOn = 1,
    minDate, maxDate, isDateDisabled, locale, value: _v, defaultValue: _d, onValueChange: _o, className, ...rest
  } = props;
  const isRange = mode === "range";

  const [single, setSingle] = useControllableState<Date | null>(
    isRange ? undefined : (props as CalendarSingleProps).value,
    isRange ? null : ((props as CalendarSingleProps).defaultValue ?? null),
    isRange ? undefined : (props as CalendarSingleProps).onValueChange,
  );
  const [range, setRange] = useControllableState<DateRange>(
    isRange ? (props as CalendarRangeProps).value : undefined,
    isRange ? ((props as CalendarRangeProps).defaultValue ?? EMPTY_RANGE) : EMPTY_RANGE,
    isRange ? (props as CalendarRangeProps).onValueChange : undefined,
  );

  const anchorDate = (isRange ? range.from : single) ?? startOfDay(new Date());
  const [visibleMonth, setVisibleMonth] = useControllableState(
    month ? startOfMonth(month) : undefined,
    startOfMonth(defaultMonth ?? anchorDate),
    onMonthChange,
  );
  const [focused, setFocused] = useState<Date>(startOfDay(anchorDate));
  const [hover, setHover] = useState<Date | null>(null);
  const shouldFocus = useRef(false);
  const root = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  const today = startOfDay(new Date());
  const minK = minDate ? dayKey(minDate) : -Infinity;
  const maxK = maxDate ? dayKey(maxDate) : Infinity;
  const disabled = (d: Date) => dayKey(d) < minK || dayKey(d) > maxK || !!isDateDisabled?.(d);

  // Keep the focused day inside the visible months.
  const months = useMemo(() => Array.from({ length: numberOfMonths }, (_, i) => addMonths(visibleMonth, i)), [visibleMonth, numberOfMonths]);
  useEffect(() => {
    const diff = monthDiff(visibleMonth, focused);
    if (diff < 0) setVisibleMonth(startOfMonth(focused));
    else if (diff >= numberOfMonths) setVisibleMonth(addMonths(startOfMonth(focused), -(numberOfMonths - 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    root.current?.querySelector<HTMLButtonElement>(`[data-day="${dayKey(focused)}"]`)?.focus();
  });

  const select = (d: Date) => {
    if (disabled(d)) return;
    setFocused(d);
    if (!isRange) {
      setSingle(isSameDay(single, d) ? null : d);
      return;
    }
    if (!range.from || range.to) setRange({ from: d, to: null });
    else setRange(dayKey(d) < dayKey(range.from) ? { from: d, to: range.from } : { from: range.from, to: d });
    setHover(null);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => startOfWeek(focused, weekStartsOn),
      End: () => addDays(startOfWeek(focused, weekStartsOn), 6),
      PageUp: () => addMonths(focused, e.shiftKey ? -12 : -1),
      PageDown: () => addMonths(focused, e.shiftKey ? 12 : 1),
    };
    const fn = moves[e.key];
    if (!fn || !(e.target as HTMLElement).dataset.day) return;
    e.preventDefault();
    shouldFocus.current = true;
    const next = fn();
    setFocused(next);
    if (isRange && range.from && !range.to) setHover(next);
  };

  const step = (n: number) => {
    setVisibleMonth(addMonths(visibleMonth, n));
    setFocused(addMonths(focused, n));
  };

  // Range shown, including the hover preview while choosing the end.
  const shownFrom = isRange ? range.from : null;
  const shownTo = isRange ? (range.to ?? (range.from && hover ? hover : null)) : null;
  const [lo, hi] = shownFrom && shownTo
    ? dayKey(shownFrom) <= dayKey(shownTo) ? [dayKey(shownFrom), dayKey(shownTo)] : [dayKey(shownTo), dayKey(shownFrom)]
    : shownFrom ? [dayKey(shownFrom), dayKey(shownFrom)] : [0, -1];

  const monthFmt = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const dayLabelFmt = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: "long" });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(today, weekStartsOn), i));

  return (
    <div
      ref={(n) => {
        root.current = n;
        if (typeof ref === "function") ref(n);
        else if (ref) ref.current = n;
      }}
      className={cx("kivu-calendar", className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <div className="kivu-calendar__nav">
        <button type="button" className="kivu-calendar__step" aria-label="Previous month" onClick={() => step(-1)}>
          <ChevronLeft />
        </button>
        <div className="kivu-calendar__titles" id={titleId} aria-live="polite">
          {months.map((m) => <span key={m.getTime()} className="kivu-calendar__title">{monthFmt.format(m)}</span>)}
        </div>
        <button type="button" className="kivu-calendar__step" aria-label="Next month" onClick={() => step(1)}>
          <ChevronRight />
        </button>
      </div>
      <div className="kivu-calendar__months">
        {months.map((m) => {
          const first = startOfWeek(m, weekStartsOn);
          const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)));
          return (
            <table key={m.getTime()} role="grid" aria-label={monthFmt.format(m)} className="kivu-calendar__grid">
              <thead>
                <tr>
                  {weekDays.map((d) => (
                    <th key={d.getDay()} scope="col" abbr={weekdayLong.format(d)} className="kivu-calendar__weekday">
                      {weekdayShort.format(d).slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((d) => {
                      if (!isSameMonth(d, m)) return <td key={d.getTime()} className="kivu-calendar__cell" />;
                      const k = dayKey(d);
                      const isDisabled = disabled(d);
                      const selected = isRange ? k >= lo && k <= hi && !!range.from : isSameDay(single, d);
                      const start = isRange && k === lo && !!shownFrom;
                      const end = isRange && k === hi && !!shownFrom;
                      return (
                        <td
                          key={d.getTime()}
                          className="kivu-calendar__cell"
                          aria-selected={selected || undefined}
                          data-in-range={isRange && selected && !start && !end ? "" : undefined}
                          data-range-start={start && hi > lo ? "" : undefined}
                          data-range-end={end && hi > lo ? "" : undefined}
                        >
                          <button
                            type="button"
                            className="kivu-calendar__day"
                            data-day={k}
                            data-selected={selected && (!isRange || start || end) ? "" : undefined}
                            data-today={isSameDay(d, today) ? "" : undefined}
                            aria-current={isSameDay(d, today) ? "date" : undefined}
                            aria-label={dayLabelFmt.format(d)}
                            tabIndex={isSameDay(d, focused) ? 0 : -1}
                            disabled={isDisabled}
                            onClick={() => select(d)}
                            onPointerEnter={() => isRange && range.from && !range.to && setHover(d)}
                            onFocus={() => !isSameDay(d, focused) && setFocused(d)}
                          >
                            {d.getDate()}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })}
      </div>
    </div>
  );
});
