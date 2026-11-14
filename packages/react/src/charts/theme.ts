/*
 * Chart theming. Kivu UI doesn't ship a charting library; these helpers make
 * Recharts, ECharts (or anything else) match the rest of your UI.
 *
 * - SVG libraries (Recharts, Visx, Nivo): use `chartColor(i)` / `rechartsTheme`.
 *   They pass CSS variables straight through, so dark mode just works.
 * - Canvas libraries (ECharts, Chart.js) can't read CSS variables: resolve them
 *   with `readChartTheme()` and pass the result to `echartsTheme()`.
 */

export const CHART_SERIES_COUNT = 8;

/** The validated categorical palette, as hex values. Mirrors --kivu-chart-1…8. */
export const chartColors = {
  light: ["#2f74c0", "#c98a14", "#00907d", "#c4562a", "#b04aa8", "#4f8f2a", "#7056c8", "#d0476b"],
  dark: ["#4a8dd6", "#bb841c", "#1fa27f", "#d5683b", "#bd5db5", "#5f9e3a", "#8775da", "#d65e7e"],
} as const;

/**
 * CSS variable for series `index` (0-based), e.g. `chartColor(0)` → `var(--kivu-chart-1)`.
 * Wraps after 8, but past 8 series a table usually reads better than a chart.
 */
export function chartColor(index: number): string {
  const i = ((Math.trunc(index) % CHART_SERIES_COUNT) + CHART_SERIES_COUNT) % CHART_SERIES_COUNT;
  return `var(--kivu-chart-${i + 1})`;
}

/** All eight series colours as CSS variables, in order. */
export const chartSeries: readonly string[] = Array.from({ length: CHART_SERIES_COUNT }, (_, i) => chartColor(i));

export interface ResolvedChartTheme {
  mode: "light" | "dark";
  series: string[];
  grid: string;
  axis: string;
  text: string;
  surface: string;
  border: string;
  fg: string;
  fontFamily: string;
}

const fallback: Record<"light" | "dark", Omit<ResolvedChartTheme, "mode" | "series">> = {
  light: {
    grid: "#eef2f6", axis: "#c5d0db", text: "#52606e", surface: "#ffffff", border: "#dfe6ed", fg: "#263646",
    fontFamily: '"Martel Sans", ui-sans-serif, system-ui, sans-serif',
  },
  dark: {
    grid: "#26394b", axis: "#34495d", text: "#a9b7c4", surface: "#1a2c3c", border: "#26394b", fg: "#e8eef4",
    fontFamily: '"Martel Sans", ui-sans-serif, system-ui, sans-serif',
  },
};

/** Static theme values for a mode, without touching the DOM (safe on the server). */
export function getChartTheme(mode: "light" | "dark" = "light"): ResolvedChartTheme {
  return { mode, series: [...chartColors[mode]], ...fallback[mode] };
}

/**
 * Resolve the chart tokens to real colour values from the live page, so custom
 * themes and dark mode carry over to canvas charts. Pass the element the chart
 * lives in (defaults to <html>). Re-run it when the theme changes.
 * Falls back to the built-in values on the server or before the stylesheet loads.
 */
export function readChartTheme(element?: Element | null): ResolvedChartTheme {
  if (typeof window === "undefined" || typeof getComputedStyle !== "function") return getChartTheme("light");
  const el = element ?? document.documentElement;
  const cs = getComputedStyle(el);
  const read = (name: string) => cs.getPropertyValue(name).trim();
  const isDark = !!el.closest?.('.dark, [data-theme="dark"]');
  const base = getChartTheme(isDark ? "dark" : "light");
  const series = base.series.map((c, i) => read(`--kivu-chart-${i + 1}`) || c);
  return {
    mode: base.mode,
    series,
    grid: read("--kivu-chart-grid") || base.grid,
    axis: read("--kivu-chart-axis") || base.axis,
    text: read("--kivu-chart-text") || base.text,
    surface: read("--kivu-surface") || base.surface,
    border: read("--kivu-border") || base.border,
    fg: read("--kivu-fg") || base.fg,
    fontFamily: read("--kivu-font-body") || base.fontFamily,
  };
}

const tick = { fill: "var(--kivu-chart-text)", fontSize: 12 };

/**
 * Props to spread onto Recharts parts:
 *   <CartesianGrid {...rechartsTheme.grid} />
 *   <XAxis dataKey="day" {...rechartsTheme.xAxis} />
 *   <Line dataKey="visits" stroke={chartColor(0)} {...rechartsTheme.line} />
 */
export const rechartsTheme = {
  grid: { stroke: "var(--kivu-chart-grid)", vertical: false },
  xAxis: { tick, tickLine: false, axisLine: { stroke: "var(--kivu-chart-axis)" }, tickMargin: 8 },
  yAxis: { tick, tickLine: false, axisLine: false, tickMargin: 8, width: 48 },
  tooltip: {
    cursor: { stroke: "var(--kivu-chart-axis)", strokeWidth: 1, fill: "var(--kivu-bg-subtle)" },
    contentStyle: {
      background: "var(--kivu-surface)",
      border: "1px solid var(--kivu-border)",
      borderRadius: 8,
      boxShadow: "var(--kivu-shadow-md)",
      color: "var(--kivu-fg)",
      fontSize: 13,
    },
    labelStyle: { color: "var(--kivu-fg-muted)", marginBottom: 4 },
    itemStyle: { color: "var(--kivu-fg)", padding: 0 },
  },
  legend: { iconType: "circle" as const, iconSize: 8, wrapperStyle: { fontSize: 13, color: "var(--kivu-chart-text)" } },
  line: {
    type: "monotone" as const,
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 4, strokeWidth: 2, stroke: "var(--kivu-surface)" },
  },
  area: { type: "monotone" as const, strokeWidth: 2, fillOpacity: 0.1 },
  bar: { radius: [4, 4, 0, 0] as [number, number, number, number], maxBarSize: 24 },
} as const;

/**
 * An ECharts theme object. Register it once:
 *   echarts.registerTheme("kivu", echartsTheme(readChartTheme()));
 *   echarts.init(el, "kivu");
 * Accepts a mode ("light" | "dark") or a theme from `readChartTheme()`.
 */
export function echartsTheme(theme: "light" | "dark" | ResolvedChartTheme = "light") {
  const t = typeof theme === "string" ? getChartTheme(theme) : theme;
  const axisCommon = {
    axisLine: { show: true, lineStyle: { color: t.axis } },
    axisTick: { show: false },
    axisLabel: { color: t.text, fontSize: 12 },
    splitLine: { show: true, lineStyle: { color: t.grid, type: "solid", width: 1 } },
    splitArea: { show: false },
  };
  return {
    color: t.series,
    backgroundColor: "transparent",
    textStyle: { fontFamily: t.fontFamily, color: t.fg },
    title: { textStyle: { color: t.fg, fontWeight: 600 }, subtextStyle: { color: t.text } },
    legend: { icon: "circle", itemWidth: 8, itemHeight: 8, textStyle: { color: t.text } },
    grid: { left: 8, right: 8, top: 32, bottom: 8, containLabel: true },
    categoryAxis: { ...axisCommon, splitLine: { show: false } },
    valueAxis: { ...axisCommon, axisLine: { show: false } },
    timeAxis: { ...axisCommon, splitLine: { show: false } },
    tooltip: {
      backgroundColor: t.surface,
      borderColor: t.border,
      borderWidth: 1,
      textStyle: { color: t.fg, fontSize: 13 },
      extraCssText: "border-radius: 8px; box-shadow: 0 4px 24px rgb(0 0 0 / 0.12);",
      axisPointer: { lineStyle: { color: t.axis }, crossStyle: { color: t.axis } },
    },
    line: { symbol: "circle", symbolSize: 8, showSymbol: false, smooth: false, lineStyle: { width: 2 }, itemStyle: { borderWidth: 2, borderColor: t.surface } },
    bar: { barMaxWidth: 24, itemStyle: { borderRadius: [4, 4, 0, 0] } },
    pie: { itemStyle: { borderColor: t.surface, borderWidth: 2 } },
  };
}
