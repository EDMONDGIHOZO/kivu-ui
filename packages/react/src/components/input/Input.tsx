import { forwardRef, type InputHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { FieldShell, useFieldIds, type FieldBaseProps } from "./Field";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, FieldBaseProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id, label, labelPosition, description, error, leftSection, rightSection, size, variant,
    wrapperClassName, className, disabled, ...props
  },
  ref,
) {
  const hasErr = error != null && error !== false && error !== true;
  const ids = useFieldIds(id, description != null, hasErr);
  return (
    <FieldShell
      {...{ label, labelPosition, description, error, leftSection, rightSection, size, variant, wrapperClassName, disabled }}
      {...ids}
    >
      <input
        ref={ref}
        id={ids.inputId}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cx("kivu-field__input", className)}
        {...props}
      />
    </FieldShell>
  );
});
