import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value. Leave undefined for an indeterminate (busy) bar. */
  value?: number;
  max?: number;
  label?: ReactNode;
  /** Show the value on the right of the label. */
  showValue?: boolean;
  /** Custom value text, e.g. `(v, max) => \`${v} of ${max} GB\``. Also used for screen readers. */
  formatValue?: (value: number, max: number) => string;
  tone?: "primary" | "accent" | "success" | "danger";
  size?: "sm" | "md" | "lg";
}

/** Horizontal bar for quotas, goals and uploads. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, label, showValue, formatValue, tone = "primary", size = "md", className, ...props },
  ref,
) {
  const id = useId();
  const indeterminate = value == null;
  const clamped = indeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const pct = max > 0 ? (clamped / max) * 100 : 0;
  const text = indeterminate ? undefined : formatValue ? formatValue(clamped, max) : `${Math.round(pct)}%`;

  return (
    <div ref={ref} className={cx("kivu-progress", `kivu-progress--${tone}`, `kivu-progress--${size}`, className)} {...props}>
      {(label != null || (showValue && text)) && (
        <div className="kivu-progress__header">
          {label != null && <span id={id} className="kivu-progress__label">{label}</span>}
          {showValue && text && <span className="kivu-progress__value">{text}</span>}
        </div>
      )}
      <div
        className={cx("kivu-progress__track", indeterminate && "kivu-progress__track--indeterminate")}
        role="progressbar"
        aria-labelledby={label != null ? id : undefined}
        aria-label={label == null ? props["aria-label"] ?? "Progress" : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={text}
      >
        <div className="kivu-progress__bar" style={indeterminate ? undefined : { width: `${pct}%` }} />
      </div>
    </div>
  );
});
