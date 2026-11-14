import { forwardRef, type SelectHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { FieldShell, useFieldIds, type FieldBaseProps } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">, FieldBaseProps {
  /** Shorthand for `<option>` children. */
  options?: (string | SelectOption)[];
  placeholder?: string;
}

const Chevron = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

/** Native `<select>` styled to match the inputs — accessible and lightweight. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id, label, labelPosition, description, error, leftSection, rightSection, size, variant,
    wrapperClassName, className, disabled, options, placeholder, children, ...props
  },
  ref,
) {
  const hasErr = error != null && error !== false && error !== true;
  const ids = useFieldIds(id, description != null, hasErr);
  return (
    <FieldShell
      {...{ label, labelPosition, description, error, leftSection, size, variant, wrapperClassName, disabled }}
      rightSection={rightSection ?? <Chevron />}
      {...ids}
    >
      <select
        ref={ref}
        id={ids.inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cx("kivu-field__input", "kivu-field__select", className)}
        {...props}
      >
        {placeholder != null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          );
        })}
        {children}
      </select>
    </FieldShell>
  );
});
