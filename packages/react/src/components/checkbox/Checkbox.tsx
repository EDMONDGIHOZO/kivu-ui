import { forwardRef, useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/refs";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, description, indeterminate, className, wrapperClassName, ...props },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `kivu-${auto}`;
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx("kivu-check", wrapperClassName)}>
      <input
        ref={composeRefs(ref, inner)}
        id={inputId}
        type="checkbox"
        className={cx("kivu-check__input", className)}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...props}
      />
      {(label || description) && (
        <div className="kivu-check__text">
          {label && <label htmlFor={inputId} className="kivu-check__label">{label}</label>}
          {description && <p id={`${inputId}-desc`} className="kivu-check__desc">{description}</p>}
        </div>
      )}
    </div>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  wrapperClassName?: string;
}

/** Toggle built on a native checkbox with `role="switch"`. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { id, label, description, className, wrapperClassName, ...props },
  ref,
) {
  const auto = useId();
  const inputId = id ?? `kivu-${auto}`;
  return (
    <div className={cx("kivu-check", "kivu-check--switch", wrapperClassName)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        className={cx("kivu-switch__input", className)}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        {...props}
      />
      {(label || description) && (
        <div className="kivu-check__text">
          {label && <label htmlFor={inputId} className="kivu-check__label">{label}</label>}
          {description && <p id={`${inputId}-desc`} className="kivu-check__desc">{description}</p>}
        </div>
      )}
    </div>
  );
});
