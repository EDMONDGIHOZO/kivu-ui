import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { ArrowDown, ArrowUp } from "../../utils/icons";
import { Skeleton } from "../skeleton/Skeleton";

export type StatTrend = "up" | "down" | "neutral";

export interface StatCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  label: ReactNode;
  /** The headline number, already formatted (e.g. "$48,120" or "1.2k"). */
  value: ReactNode;
  /**
   * Change since the previous period. A number is shown as a signed
   * percentage (12.5 → "+12.5%") and sets `trend` from its sign.
   */
  delta?: number | ReactNode;
  /** Direction of the change. Inferred when `delta` is a number. */
  trend?: StatTrend;
  /** Treat "down" as good (e.g. churn, response time): swaps the colours. */
  invertTrend?: boolean;
  /** Text after the delta, e.g. "vs last week". */
  deltaLabel?: ReactNode;
  /** Small icon in the top-right corner (an `<IconTile size="sm">` works well). */
  icon?: ReactNode;
  /** Content under the numbers, usually a `<Sparkline>` or `<Progress>`. */
  chart?: ReactNode;
  variant?: "elevated" | "outline" | "subtle";
  loading?: boolean;
}

const trendWords: Record<StatTrend, string> = { up: "Up", down: "Down", neutral: "No change" };

/** KPI tile: label, big number, trend and an optional chart. */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, delta, trend, invertTrend, deltaLabel, icon, chart, variant = "outline", loading, className, children, ...props },
  ref,
) {
  const numeric = typeof delta === "number";
  const t: StatTrend = trend ?? (numeric ? (delta > 0 ? "up" : delta < 0 ? "down" : "neutral") : "neutral");
  const good = t === "neutral" ? "neutral" : (t === "up") !== !!invertTrend ? "positive" : "negative";
  const deltaText = numeric ? `${delta > 0 ? "+" : delta < 0 ? "−" : ""}${Math.abs(delta)}%` : delta;

  return (
    <div
      ref={ref}
      className={cx("kivu-stat", `kivu-stat--${variant}`, className)}
      aria-busy={loading || undefined}
      {...props}
    >
      <div className="kivu-stat__top">
        <p className="kivu-stat__label">{label}</p>
        {icon != null && <span className="kivu-stat__icon">{icon}</span>}
      </div>
      {loading ? (
        <>
          <Skeleton width="55%" height="2rem" />
          <Skeleton width="40%" height="0.875rem" />
        </>
      ) : (
        <>
          <p className="kivu-stat__value">{value}</p>
          {(delta != null || deltaLabel != null) && (
            <p className="kivu-stat__meta">
              {delta != null && (
                <span className={cx("kivu-stat__delta", `kivu-stat__delta--${good}`)}>
                  {t === "up" && <ArrowUp />}
                  {t === "down" && <ArrowDown />}
                  <span className="kivu-sr-only">{trendWords[t]} </span>
                  {deltaText}
                </span>
              )}
              {deltaLabel != null && <span className="kivu-stat__delta-label">{deltaLabel}</span>}
            </p>
          )}
        </>
      )}
      {chart != null && <div className="kivu-stat__chart">{chart}</div>}
      {children}
    </div>
  );
});
