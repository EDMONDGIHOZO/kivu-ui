import { useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx";
import { Calendar as CalendarIcon } from "../../utils/icons";
import { useControllableState } from "../../utils/use-controllable";
import { PickerField, type PickerBaseProps } from "../input/PickerField";
import { Calendar } from "./Calendar";
import {
  dayKey,
  defaultDateRangePresets,
  formatDate,
  formatRange,
  toISODate,
  type DateRange,
  type DateRangePreset,
} from "./dates";

interface DatePickerCommonProps extends PickerBaseProps {
  /** 0 = Sunday, 1 = Monday (default). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  locale?: string;
  /** How the chosen date is written in the field. */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Adds hidden input(s) with ISO dates (`yyyy-mm-dd`) for native form posts. */
  name?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DatePickerProps extends DatePickerCommonProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
}

/** A field that opens a calendar to pick one date. */
export function DatePicker({
  value, defaultValue = null, onValueChange, weekStartsOn, minDate, maxDate, isDateDisabled, locale, formatOptions,
  name, open: openProp, onOpenChange, placeholder = "Pick a date", panelClassName, ...field
}: DatePickerProps) {
  const [date, setDate] = useControllableState(value, defaultValue, onValueChange);
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  useFocusDay(open, panel);

  return (
    <>
      <PickerField
        {...field}
        ref={trigger}
        placeholder={placeholder}
        open={open}
        setOpen={setOpen}
        display={date ? formatDate(date, locale, formatOptions) : null}
        icon={<CalendarIcon />}
        onClear={() => setDate(null)}
        popup="dialog"
        popupId={panelId}
        panelClassName={panelClassName}
        panelProps={{ id: panelId, role: "dialog", "aria-modal": false, "aria-label": "Choose date" }}
      >
        {() => (
          <div ref={(n) => { panel.current = n; }}>
            <Calendar
              value={date}
              onValueChange={(d) => {
                setDate(d);
                if (d) {
                  setOpen(false);
                  trigger.current?.focus();
                }
              }}
              {...{ weekStartsOn, minDate, maxDate, isDateDisabled, locale }}
            />
          </div>
        )}
      </PickerField>
      {name != null && <input type="hidden" name={name} value={date ? toISODate(date) : ""} />}
    </>
  );
}

export interface DateRangePickerProps extends DatePickerCommonProps {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  /** Quick ranges listed beside the calendar. `false` hides them. */
  presets?: DateRangePreset[] | false;
  numberOfMonths?: number;
}

const EMPTY: DateRange = { from: null, to: null };

/** A field that opens a two-month calendar with quick ranges (Last 7 days, This month…). */
export function DateRangePicker({
  value, defaultValue = EMPTY, onValueChange, presets = defaultDateRangePresets, numberOfMonths = 2,
  weekStartsOn, minDate, maxDate, isDateDisabled, locale, formatOptions, name, open: openProp, onOpenChange,
  placeholder = "Pick a date range", panelClassName, ...field
}: DateRangePickerProps) {
  const [range, setRange] = useControllableState(value, defaultValue, onValueChange);
  const [open, setOpen] = useControllableState(openProp, false, onOpenChange);
  // Draft lets people click a start date without immediately changing the applied range.
  const [draft, setDraft] = useState<DateRange>(range);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  useFocusDay(open, panel);
  useEffect(() => {
    if (open) setDraft(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = (r: DateRange) => {
    setRange(r);
    setOpen(false);
    trigger.current?.focus();
  };
  const sameRange = (a: DateRange, b: DateRange) =>
    !!a.from && !!a.to && !!b.from && !!b.to && dayKey(a.from) === dayKey(b.from) && dayKey(a.to) === dayKey(b.to);

  return (
    <>
      <PickerField
        {...field}
        ref={trigger}
        placeholder={placeholder}
        open={open}
        setOpen={setOpen}
        display={range.from ? formatRange(range, locale, formatOptions) : null}
        icon={<CalendarIcon />}
        onClear={() => setRange(EMPTY)}
        popup="dialog"
        popupId={panelId}
        align="start"
        panelClassName={cx("kivu-range-picker", panelClassName)}
        panelProps={{ id: panelId, role: "dialog", "aria-modal": false, "aria-label": "Choose date range" }}
      >
        {() => (
          <div ref={(n) => { panel.current = n; }} className="kivu-range-picker__inner">
            {presets && presets.length > 0 && (
              <ul className="kivu-range-picker__presets" aria-label="Quick ranges">
                {presets.map((p) => {
                  const r = p.range();
                  return (
                    <li key={p.label}>
                      <button
                        type="button"
                        className="kivu-range-picker__preset"
                        aria-pressed={sameRange(r, range)}
                        onClick={() => commit(r)}
                      >
                        {p.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Calendar
              mode="range"
              numberOfMonths={numberOfMonths}
              value={draft}
              defaultMonth={draft.to && numberOfMonths > 1 ? new Date(draft.to.getFullYear(), draft.to.getMonth() - 1, 1) : undefined}
              onValueChange={(r) => {
                setDraft(r);
                if (r.from && r.to) commit(r);
              }}
              {...{ weekStartsOn, minDate, maxDate, isDateDisabled, locale }}
            />
          </div>
        )}
      </PickerField>
      {name != null && (
        <>
          <input type="hidden" name={`${name}From`} value={range.from ? toISODate(range.from) : ""} />
          <input type="hidden" name={`${name}To`} value={range.to ? toISODate(range.to) : ""} />
        </>
      )}
    </>
  );
}

/** Focus the selected (or today's) day when the panel opens. */
function useFocusDay(open: boolean, panel: { current: HTMLElement | null }) {
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panel.current?.querySelector<HTMLButtonElement>('.kivu-calendar__day[tabindex="0"]')?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, panel]);
}
