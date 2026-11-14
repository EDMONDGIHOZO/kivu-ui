import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/refs";
import { useControllableState } from "../../utils/use-controllable";

interface AccordionContextValue {
  isOpen: (v: string) => boolean;
  toggle: (v: string) => void;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<{ value: string; id: string; open: boolean; disabled?: boolean } | null>(null);

function useAccordion() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion parts must be used inside <Accordion>");
  return ctx;
}
function useItem() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("AccordionTrigger/AccordionContent must be inside <AccordionItem>");
  return ctx;
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Allow several items open at once. */
  multiple?: boolean;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  variant?: "card" | "plain";
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { multiple = false, value, defaultValue = [], onValueChange, variant = "card", className, ...props },
  ref,
) {
  const [open, setOpen] = useControllableState(value, defaultValue, onValueChange);
  const ctx: AccordionContextValue = {
    isOpen: (v) => open.includes(v),
    toggle: (v) => {
      if (open.includes(v)) setOpen(open.filter((x) => x !== v));
      else setOpen(multiple ? [...open, v] : [v]);
    },
  };
  return (
    <AccordionContext.Provider value={ctx}>
      <div ref={ref} className={cx("kivu-accordion", `kivu-accordion--${variant}`, className)} {...props} />
    </AccordionContext.Provider>
  );
});

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, className, ...props },
  ref,
) {
  const { isOpen } = useAccordion();
  const id = useId();
  const open = isOpen(value);
  return (
    <ItemContext.Provider value={{ value, id, open, disabled }}>
      <div
        ref={ref}
        data-state={open ? "open" : "closed"}
        className={cx("kivu-accordion__item", className)}
        {...props}
      />
    </ItemContext.Provider>
  );
});

export interface AccordionTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Replace the default chevron. Pass `null` to hide it. */
  icon?: ReactNode;
}

const Chevron = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 4 4 4-4 4" />
  </svg>
);

export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(function AccordionTrigger(
  { icon, className, children, onClick, ...props },
  ref,
) {
  const { toggle } = useAccordion();
  const item = useItem();
  return (
    <h3 className="kivu-accordion__heading">
      <button
        ref={ref}
        type="button"
        id={`${item.id}-trigger`}
        aria-expanded={item.open}
        aria-controls={`${item.id}-content`}
        disabled={item.disabled}
        className={cx("kivu-accordion__trigger", className)}
        onClick={(e) => {
          onClick?.(e);
          if (!e.defaultPrevented) toggle(item.value);
        }}
        {...props}
      >
        <span className="kivu-accordion__title">{children}</span>
        {icon !== null && <span className="kivu-accordion__icon">{icon ?? <Chevron />}</span>}
      </button>
    </h3>
  );
});

export const AccordionContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AccordionContent({ className, children, ...props }, ref) {
    const item = useItem();
    const inner = useRef<HTMLDivElement>(null);
    // Closed content stays in the DOM (for the height animation) but must not be focusable.
    // Set `inert` imperatively so it works on React 18 and 19.
    useEffect(() => {
      inner.current?.toggleAttribute("inert", !item.open);
    }, [item.open]);
    return (
      <div
        ref={composeRefs(ref, inner)}
        role="region"
        id={`${item.id}-content`}
        aria-labelledby={`${item.id}-trigger`}
        data-state={item.open ? "open" : "closed"}
        className={cx("kivu-accordion__content", className)}
        {...props}
      >
        <div className="kivu-accordion__content-inner">
          <div className="kivu-accordion__body">{children}</div>
        </div>
      </div>
    );
  },
);
