import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { FieldShell, useFieldIds, type FieldBaseProps } from "./Field";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<FieldBaseProps, "leftSection" | "rightSection" | "size"> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, labelPosition, description, error, variant, wrapperClassName, className, disabled, rows = 4, ...props },
  ref,
) {
  const hasErr = error != null && error !== false && error !== true;
  const ids = useFieldIds(id, description != null, hasErr);
  return (
    <FieldShell
      {...{ label, labelPosition, description, error, variant, wrapperClassName, disabled }}
      multiline
      {...ids}
    >
      <textarea
        ref={ref}
        id={ids.inputId}
        rows={rows}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        className={cx("kivu-field__input", className)}
        {...props}
      />
    </FieldShell>
  );
});
