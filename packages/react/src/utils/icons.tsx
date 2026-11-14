/* Tiny internal stroke icons (16px grid, 1em, currentColor). Not exported. */
import type { SVGProps } from "react";

const base = (d: string, sw = 1.75) =>
  function Icon(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={sw}
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
        <path d={d} />
      </svg>
    );
  };

export const ChevronDown = base("m4 6 4 4 4-4");
export const ChevronUp = base("m4 10 4-4 4 4");
export const ChevronLeft = base("m10 4-4 4 4 4");
export const ChevronRight = base("m6 4 4 4-4 4");
export const ChevronsUpDown = base("m5 6 3-3 3 3M5 10l3 3 3-3");
export const ArrowUp = base("M8 13V3M4 7l4-4 4 4");
export const ArrowDown = base("M8 3v10M4 9l4 4 4-4");
export const Close = base("M4 4l8 8M12 4l-8 8", 2);
export const Check = base("m3.5 8.5 3 3 6-7", 2);
export const PanelLeft = base("M2.5 3h11v10h-11zM6.5 3v10");
export const Calendar = base("M2.5 4h11v9.5h-11zM2.5 7h11M5.5 2.5v3M10.5 2.5v3");
export const Search = base("M7 12A5 5 0 1 0 7 2a5 5 0 0 0 0 10Zm3.5-1.5L14 14");
export const Inbox = base("M2.5 9.5h3l1 2h3l1-2h3M2.5 9.5 4.5 3.5h7l2 6v3.5h-11z");
export const Info = base("M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM8 7.5v3M8 5.25h.01");
export const CheckCircle = base("M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM5.5 8.2l1.8 1.8 3.2-3.6");
export const AlertCircle = base("M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12ZM8 5v3.5M8 10.75h.01");
