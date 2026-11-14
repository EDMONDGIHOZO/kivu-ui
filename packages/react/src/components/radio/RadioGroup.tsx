import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type FieldsetHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { useControllableState } from "../../utils/use-controllable";

interface RadioGroupContextValue {
  name: string;
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
  invalid: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
  /** Shared `name` for the radios (auto-generated if omitted). Set it for native form posts. */
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Group label, rendered as a `<legend>`. */
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode | boolean;
  orientation?: "vertical" | "horizontal";
}

/** A set of native radio buttons with a shared label. */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  { name, value, defaultValue = "", onValueChange, label, description, error, orientation = "vertical", disabled, className, children, ...props },
  ref,
) {
  const auto = useId();
  const [current, setValue] = useControllableState(value, defaultValue, onValueChange);
  const invalid = error != null && error !== false;
  const descId = description != null ? `${auto}-desc` : undefined;
  const errId = invalid && error !== true ? `${auto}-err` : undefined;
  return (
    <RadioGroupContext.Provider value={{ name: name ?? `kivu-radio-${auto}`, value: current, setValue, disabled, invalid }}>
      <fieldset
        ref={ref}
        disabled={disabled}
        aria-describedby={[descId, errId].filter(Boolean).join(" ") || undefined}
        className={cx("kivu-radio-group", `kivu-radio-group--${orientation}`, invalid && "kivu-radio-group--invalid", className)}
        {...props}
      >
        {label != null && <legend className="kivu-radio-group__label">{label}</legend>}
        {description != null && <p id={descId} className="kivu-radio-group__description">{description}</p>}
        <div className="kivu-radio-group__items">{children}</div>
        {errId && <p id={errId} className="kivu-field__error" role="alert">{error}</p>}
      </fieldset>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value"> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
  wrapperClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { id, value, label, description, className, wrapperClassName, onChange, disabled, ...props },
  ref,
) {
  const ctx = useContext(RadioGroupContext);
  const auto = useId();
  const inputId = id ?? `kivu-${auto}`;
  return (
    <div className={cx("kivu-check", "kivu-radio", wrapperClassName)}>
      <input
        ref={ref}
        id={inputId}
        type="radio"
        value={value}
        name={ctx?.name ?? props.name}
        checked={ctx ? ctx.value === value : props.checked}
        disabled={disabled || ctx?.disabled}
        aria-invalid={ctx?.invalid || undefined}
        aria-describedby={description ? `${inputId}-desc` : undefined}
        className={cx("kivu-radio__input", className)}
        onChange={(e) => {
          onChange?.(e);
          if (e.target.checked) ctx?.setValue(value);
        }}
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
