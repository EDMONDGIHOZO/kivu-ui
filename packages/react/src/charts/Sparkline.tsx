import { forwardRef, useId, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface SparklineProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The values, oldest first. Non-finite values are skipped. */
  data: readonly number[];
  /** "line" for continuous trends, "bar" for counts per period. */
  variant?: "line" | "bar";
  /** Height in px. Width fills the container. */
  height?: number;
  /** Any CSS colour. Defaults to the first chart series colour. */
  color?: string;
  /** Soft fill under the line (line variant only). */
  area?: boolean;
  /** Dot on the latest value (line), or highlight the latest bar (bar). */
  highlightLast?: boolean;
  /** Fix the vertical scale, e.g. `[0, 100]`. Defaults to the data's range (bars start at 0). */
  domain?: [number, number];
  /** Accessible description. Defaults to a summary of the first, last, lowest and highest values. */
  label?: string;
  /** Formats numbers in the default accessible summary. */
  formatValue?: (value: number) => string;
}

const W = 100; // viewBox width; the SVG stretches horizontally

function summarize(values: number[], fmt: (v: number) => string) {
  if (values.length === 0) return "No data";
  const first = values[0]!;
  const last = values[values.length - 1]!;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `Trend over ${values.length} points: from ${fmt(first)} to ${fmt(last)}, low ${fmt(min)}, high ${fmt(max)}`;
}

/** Tiny, axis-free trend chart for KPI cards and table cells. */
export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(function Sparkline(
  {
    data,
    variant = "line",
    height = 40,
    color = "var(--kivu-chart-1)",
    area = true,
    highlightLast = true,
    domain,
    label,
    formatValue = (v) => v.toLocaleString(),
    className,
    style,
    ...props
  },
  ref,
) {
  const gradientId = `kivu-spark-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const values = data.filter((v) => Number.isFinite(v));
  const n = values.length;
  const dataMin = n ? Math.min(...values) : 0;
  const dataMax = n ? Math.max(...values) : 0;
  let [lo, hi] = domain ?? [variant === "bar" ? Math.min(0, dataMin) : dataMin, dataMax];
  if (hi === lo) { hi += 1; lo -= variant === "bar" ? 0 : 1; }

  // Keep the 2px line and the end dot inside the box.
  const pad = variant === "line" ? 4 : 0;
  const inner = Math.max(height - pad * 2, 1);
  const y = (v: number) => pad + inner - ((Math.min(Math.max(v, lo), hi) - lo) / (hi - lo)) * inner;
  const x = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);

  const rootStyle = { ...style, height, "--kivu-spark-color": color } as CSSProperties;
  const a11y = { role: "img" as const, "aria-label": label ?? summarize(values, formatValue) };

  if (variant === "bar") {
    return (
      <div ref={ref} className={cx("kivu-spark", "kivu-spark--bar", className)} style={rootStyle} {...a11y} {...props}>
        {values.map((v, i) => (
          <span
            key={i}
            className={cx("kivu-spark__bar", highlightLast && i === n - 1 && "kivu-spark__bar--current")}
            style={{ height: `${Math.max(((Math.max(v, lo) - lo) / (hi - lo)) * 100, v > lo ? 4 : 0)}%` }}
          />
        ))}
      </div>
    );
  }

  const points = values.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`);
  const line = n === 1 ? `M0,${y(values[0]!)} L${W},${y(values[0]!)}` : `M${points.join(" L")}`;
  const fill = n >= 1 ? `${line} L${n === 1 ? W : x(n - 1)},${height} L0,${height} Z` : "";

  return (
    <div ref={ref} className={cx("kivu-spark", "kivu-spark--line", className)} style={rootStyle} {...a11y} {...props}>
      {n > 0 && (
        <svg className="kivu-spark__svg" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {area && (
            <>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={fill} fill={`url(#${gradientId})`} stroke="none" />
            </>
          )}
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {highlightLast && n > 0 && (
        <span
          className="kivu-spark__dot"
          aria-hidden="true"
          style={{ left: `${(n === 1 ? W : x(n - 1)) / W * 100}%`, top: y(values[n - 1]!) }}
        />
      )}
    </div>
  );
});
