import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllableState } from "../../utils/use-controllable";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: (string | SegmentedOption)[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";
  /** Stretch to fill the parent, segments sharing the width. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Required unless the control is labelled by visible text (`aria-labelledby`). */
  "aria-label"?: string;
}

/** Pick one of a few options, e.g. the 7d / 30d / 90d range on a chart. */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(
  { options, value, defaultValue, onValueChange, size = "md", fullWidth, disabled, className, onKeyDown, ...props },
  ref,
) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const [current, setValue] = useControllableState(value, defaultValue ?? opts[0]?.value ?? "", onValueChange);
  const focusable = opts.some((o) => o.value === current) ? current : opts.find((o) => !o.disabled)?.value;

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const enabled = opts.filter((o) => !o.disabled && !disabled);
    const i = enabled.findIndex((o) => o.value === current);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % enabled.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next < 0 || !enabled[next]) return;
    e.preventDefault();
    setValue(enabled[next].value);
    Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
      .find((b) => b.dataset.value === enabled[next].value)
      ?.focus();
  };

  return (
    <div
      ref={ref}
      role="radiogroup"
      className={cx("kivu-segmented", `kivu-segmented--${size}`, fullWidth && "kivu-segmented--full", className)}
      aria-disabled={disabled || undefined}
      onKeyDown={handleKey}
      {...props}
    >
      {opts.map((o) => {
        const checked = o.value === current;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-value={o.value}
            data-state={checked ? "on" : "off"}
            tabIndex={o.value === focusable ? 0 : -1}
            disabled={disabled || o.disabled}
            className="kivu-segmented__item"
            onClick={() => setValue(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
});
