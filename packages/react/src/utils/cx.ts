export type ClassValue = string | number | false | null | undefined | ClassValue[];

/** Joins class names, skipping falsy values. Tiny `clsx` replacement. */
export function cx(...values: ClassValue[]): string {
  let out = "";
  for (const v of values) {
    if (!v) continue;
    const s = Array.isArray(v) ? cx(...v) : String(v);
    if (s) out = out ? `${out} ${s}` : s;
  }
  return out;
}
