import {
  forwardRef,
  useRef,
  type ButtonHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cx } from "../../utils/cx";
import { FloatingPortal, useDismiss, useFloatingPosition, type FloatingAlign } from "../../utils/floating";
import { ChevronDown, Close } from "../../utils/icons";
import { composeRefs } from "../../utils/refs";
import { FieldShell, useFieldIds, type FieldBaseProps } from "./Field";

/** Props shared by Combobox, DatePicker and DateRangePicker. */
export interface PickerBaseProps extends Omit<FieldBaseProps, "rightSection"> {
  id?: string;
  placeholder?: ReactNode;
  disabled?: boolean;
  /** Show a × button that clears the value. */
  clearable?: boolean;
  /** Class for the trigger button. */
  className?: string;
  /** Class for the floating panel. */
  panelClassName?: string;
  "aria-label"?: string;
}

interface PickerFieldProps extends PickerBaseProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** What the closed field shows. `null` shows the placeholder. */
  display: ReactNode;
  icon?: ReactNode;
  onClear?: () => void;
  popup: "listbox" | "dialog";
  popupId: string;
  align?: FloatingAlign;
  triggerProps?: ButtonHTMLAttributes<HTMLButtonElement> & { "data-picker"?: string };
  onTriggerKeyDown?: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  /** Panel content; rendered only while open. */
  children: (refs: { panel: RefObject<HTMLDivElement | null> }) => ReactNode;
  panelProps?: Record<string, unknown>;
}

/**
 * Internal: a Field-styled button that opens a floating panel anchored to the
 * field box. Handles positioning, outside click / Escape, and focus return.
 */
export const PickerField = forwardRef<HTMLButtonElement, PickerFieldProps>(function PickerField(
  {
    id, label, labelPosition, description, error, leftSection, size, variant, wrapperClassName, placeholder, disabled,
    clearable, className, panelClassName, open, setOpen, display, icon, onClear, popup, popupId, align = "start",
    triggerProps, onTriggerKeyDown, children, panelProps, ...rest
  },
  ref,
) {
  const hasErr = error != null && error !== false && error !== true;
  const ids = useFieldIds(id, description != null, hasErr);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  useFloatingPosition(anchor, panel, open, { side: "bottom", align, offset: 6, matchWidth: popup === "listbox" });
  useDismiss(open, [panel, anchor], (reason) => {
    setOpen(false);
    if (reason === "escape") trigger.current?.focus();
  });

  const empty = display == null || display === "" || (Array.isArray(display) && display.length === 0);
  const showClear = clearable && !empty && !disabled && onClear;

  return (
    <FieldShell
      {...{ label, labelPosition, description, error, leftSection, size, variant, wrapperClassName, disabled }}
      {...ids}
      rightSection={
        <>
          {showClear && (
            <button
              type="button"
              className="kivu-picker__clear"
              aria-label="Clear"
              onClick={() => {
                onClear();
                trigger.current?.focus();
              }}
            >
              <Close />
            </button>
          )}
          <span className="kivu-picker__icon" aria-hidden="true">{icon ?? <ChevronDown />}</span>
        </>
      }
    >
      <button
        ref={composeRefs(ref, trigger, (n: HTMLButtonElement | null) => {
          anchor.current = (n?.closest(".kivu-field__control") as HTMLElement | null) ?? n;
        })}
        id={ids.inputId}
        type="button"
        disabled={disabled}
        aria-haspopup={popup}
        aria-expanded={open}
        aria-controls={open ? popupId : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        aria-label={rest["aria-label"]}
        className={cx("kivu-field__input", "kivu-picker__trigger", empty && "kivu-picker__trigger--placeholder", className)}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          onTriggerKeyDown?.(e);
          if (!e.defaultPrevented && (e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        {...triggerProps}
      >
        <span className="kivu-picker__value">{empty ? placeholder : display}</span>
      </button>
      {open && (
        <FloatingPortal anchor={trigger}>
          <div ref={panel} className={cx("kivu-picker__panel", `kivu-picker__panel--${popup}`, panelClassName)} {...panelProps}>
            {children({ panel })}
          </div>
        </FloatingPortal>
      )}
    </FieldShell>
  );
});
