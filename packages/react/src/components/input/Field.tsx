import { useId, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface FieldBaseProps {
  label?: ReactNode;
  /** `inside` = small label inside the box, `outside` = above it. */
  labelPosition?: "inside" | "outside";
  description?: ReactNode;
  /** Error message; also sets `aria-invalid`. Pass `true` for a red border with no message. */
  error?: ReactNode | boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "glass";
  /** Class for the outer wrapper (use `className` for the control itself). */
  wrapperClassName?: string;
}

export function useFieldIds(id: string | undefined, hasDesc: boolean, hasError: boolean) {
  const auto = useId();
  const inputId = id ?? `kivu-${auto}`;
  const descId = hasDesc ? `${inputId}-desc` : undefined;
  const errId = hasError ? `${inputId}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;
  return { inputId, descId, errId, describedBy };
}

interface FieldShellProps extends FieldBaseProps {
  inputId: string;
  descId?: string;
  errId?: string;
  disabled?: boolean;
  multiline?: boolean;
  children: ReactNode;
}

export function FieldShell({
  label,
  labelPosition = "inside",
  description,
  error,
  leftSection,
  rightSection,
  size = "md",
  variant = "default",
  wrapperClassName,
  inputId,
  descId,
  errId,
  disabled,
  multiline,
  children,
}: FieldShellProps) {
  const inside = labelPosition === "inside" && label != null;
  return (
    <div
      className={cx(
        "kivu-field",
        `kivu-field--${size}`,
        `kivu-field--${variant}`,
        inside && "kivu-field--label-inside",
        error != null && error !== false && "kivu-field--invalid",
        disabled && "kivu-field--disabled",
        multiline && "kivu-field--multiline",
        wrapperClassName,
      )}
    >
      {label != null && !inside && (
        <label htmlFor={inputId} className="kivu-field__label">
          {label}
        </label>
      )}
      <div className="kivu-field__control">
        {leftSection != null && <span className="kivu-field__section">{leftSection}</span>}
        <div className="kivu-field__inner">
          {inside && (
            <label htmlFor={inputId} className="kivu-field__label kivu-field__label--inside">
              {label}
            </label>
          )}
          {children}
        </div>
        {rightSection != null && <span className="kivu-field__section">{rightSection}</span>}
      </div>
      {description != null && (
        <p id={descId} className="kivu-field__description">
          {description}
        </p>
      )}
      {error != null && error !== false && error !== true && (
        <p id={errId} className="kivu-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
