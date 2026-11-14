import { render, screen } from "@testing-library/react";
import { Sparkline, StatCard, chartColor, chartColors, chartSeries, echartsTheme, getChartTheme, readChartTheme } from "../index";

describe("chart theme", () => {
  it("maps series indexes to CSS variables and wraps after 8", () => {
    expect(chartColor(0)).toBe("var(--kivu-chart-1)");
    expect(chartColor(7)).toBe("var(--kivu-chart-8)");
    expect(chartColor(8)).toBe("var(--kivu-chart-1)");
    expect(chartColor(-1)).toBe("var(--kivu-chart-8)");
    expect(chartSeries).toHaveLength(8);
  });

  it("has eight colours per mode", () => {
    expect(chartColors.light).toHaveLength(8);
    expect(chartColors.dark).toHaveLength(8);
    expect(getChartTheme("dark").series).toEqual([...chartColors.dark]);
  });

  it("reads live tokens, falling back to the built-in palette", () => {
    document.documentElement.style.setProperty("--kivu-chart-1", "#123456");
    const t = readChartTheme();
    expect(t.series[0]).toBe("#123456");
    expect(t.series[1]).toBe(chartColors.light[1]);
    document.documentElement.style.removeProperty("--kivu-chart-1");
  });

  it("detects dark mode from an ancestor", () => {
    const wrap = document.createElement("div");
    wrap.className = "dark";
    const el = document.createElement("div");
    wrap.appendChild(el);
    document.body.appendChild(wrap);
    expect(readChartTheme(el).mode).toBe("dark");
    wrap.remove();
  });

  it("builds an ECharts theme from a mode", () => {
    const t = echartsTheme("dark");
    expect(t.color).toEqual([...chartColors.dark]);
    expect(t.bar.barMaxWidth).toBe(24);
  });
});

describe("Sparkline", () => {
  it("is an image with a readable summary", () => {
    render(<Sparkline data={[3, 5, 2, 9]} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Trend over 4 points: from 3 to 9, low 2, high 9");
  });

  it("uses a custom label and skips non-finite values", () => {
    render(<Sparkline data={[1, Number.NaN, 4]} label="Signups this week" />);
    const img = screen.getByRole("img", { name: "Signups this week" });
    expect(img.querySelectorAll("path")).toHaveLength(2); // area + line
  });

  it("renders one bar per value and highlights the latest", () => {
    const { container } = render(<Sparkline variant="bar" data={[0, 2, 4]} />);
    const bars = container.querySelectorAll(".kivu-spark__bar");
    expect(bars).toHaveLength(3);
    expect(bars[2]).toHaveClass("kivu-spark__bar--current");
    expect((bars[2] as HTMLElement).style.height).toBe("100%");
    expect((bars[0] as HTMLElement).style.height).toBe("0%");
  });

  it("handles empty and flat data", () => {
    const { rerender } = render(<Sparkline data={[]} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("No data");
    rerender(<Sparkline data={[5, 5, 5]} />);
    expect(screen.getByRole("img").querySelector("svg")).toBeInTheDocument();
  });

  it("slots into a StatCard", () => {
    render(<StatCard label="Revenue" value="$48,120" delta={12.5} chart={<Sparkline data={[1, 2, 3]} label="Revenue trend" />} />);
    expect(screen.getByRole("img", { name: "Revenue trend" })).toBeInTheDocument();
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
  });
});
