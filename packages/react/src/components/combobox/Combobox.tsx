import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Check, Search } from "../../utils/icons";
import { useControllableState } from "../../utils/use-controllable";
import { PickerField, type PickerBaseProps } from "../input/PickerField";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface ComboboxCommonProps extends PickerBaseProps {
  options: (string | ComboboxOption)[];
  searchPlaceholder?: string;
  /** Shown when nothing matches the search. */
  emptyText?: ReactNode;
  /** Custom match. Return true to keep the option. */
  filter?: (option: ComboboxOption, query: string) => boolean;
  /** Turn off built-in filtering (for server-side search with `onSearchChange`). */
  manualFilter?: boolean;
  onSearchChange?: (query: string) => void;
  /** Show a loading row (e.g. while fetching options). */
  loading?: boolean;
  /** Hide the search box (for short lists). */
  searchable?: boolean;
  /** Adds hidden input(s) so the value is posted with a native form. */
  name?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ComboboxSingleProps extends ComboboxCommonProps {
  multiple?: false;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxCommonProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** How many labels to list in the field before "+N". */
  maxDisplayed?: number;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

const defaultFilter = (o: ComboboxOption, q: string) => {
  const needle = q.trim().toLowerCase();
  return !needle || o.label.toLowerCase().includes(needle) || !!o.description?.toLowerCase().includes(needle);
};

/** A searchable select. Set `multiple` to pick several values. */
export function Combobox(props: ComboboxProps) {
  const {
    options, searchPlaceholder = "Search…", emptyText = "No results", filter = defaultFilter, manualFilter,
    onSearchChange, loading, searchable = true, name, open: openProp, onOpenChange, placeholder = "Select…",
    id, label, labelPosition, description, error, leftSection, size, variant, wrapperClassName, disabled, clearable,
    className, panelClassName,
  } = props;
  const field = {
    id, label, labelPosition, description, error, leftSection, size, variant, wrapperClassName, disabled, clearable,
    className, panelClassName, "aria-label": props["aria-label"],
  };
  const multiple = props.multiple === true;

  const opts = useMemo(() => options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)), [options]);
  const [open, setOpenState] = useControllableState(openProp, false, onOpenChange);
  const [single, setSingle] = useControllableState<string | null>(
    multiple ? undefined : (props as ComboboxSingleProps).value,
    multiple ? null : ((props as ComboboxSingleProps).defaultValue ?? null),
    multiple ? undefined : (props as ComboboxSingleProps).onValueChange,
  );
  const [many, setMany] = useControllableState<string[]>(
    multiple ? (props as ComboboxMultipleProps).value : undefined,
    multiple ? ((props as ComboboxMultipleProps).defaultValue ?? []) : [],
    multiple ? (props as ComboboxMultipleProps).onValueChange : undefined,
  );
  const selected = multiple ? many : single != null ? [single] : [];

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const visible = manualFilter ? opts : opts.filter((o) => filter(o, query));

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (!next) {
      setQuery("");
      onSearchChange?.("");
    }
  };

  // On open: start at the selected option (or the first enabled one).
  useEffect(() => {
    if (!open) return;
    const sel = visible.findIndex((o) => selected.includes(o.value));
    setActive(sel >= 0 ? sel : Math.max(0, visible.findIndex((o) => !o.disabled)));
    (searchable ? search.current : list.current)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const choose = (o: ComboboxOption) => {
    if (o.disabled) return;
    if (multiple) {
      setMany(many.includes(o.value) ? many.filter((v) => v !== o.value) : [...many, o.value]);
    } else {
      setSingle(o.value);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const move = (dir: 1 | -1, from = active) => {
    if (visible.length === 0) return;
    let i = from;
    for (let n = 0; n < visible.length; n++) {
      i = (i + dir + visible.length) % visible.length;
      if (!visible[i].disabled) break;
    }
    setActive(i);
  };

  const onListKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (visible[active]) choose(visible[active]);
    } else if (e.key === "Tab") setOpen(false);
  };

  const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? v;
  const maxDisplayed = multiple ? ((props as ComboboxMultipleProps).maxDisplayed ?? 2) : 1;
  const display = selected.length === 0 ? null
    : selected.length <= maxDisplayed ? selected.map(labelOf).join(", ")
    : `${selected.slice(0, maxDisplayed).map(labelOf).join(", ")} +${selected.length - maxDisplayed}`;

  return (
    <>
      <PickerField
        {...field}
        ref={triggerRef}
        placeholder={placeholder}
        open={open}
        setOpen={setOpen}
        display={display}
        popup="listbox"
        popupId={listId}
        onClear={() => (multiple ? setMany([]) : setSingle(null))}
        onTriggerKeyDown={(e) => {
          // Typing on the closed field opens it and starts a search.
          if (searchable && !open && e.key.length === 1 && /\S/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            setQuery(e.key);
            onSearchChange?.(e.key);
            setOpenState(true);
          }
        }}
      >
        {() => (
          <>
            {searchable && (
              <div className="kivu-combobox__search">
                <Search aria-hidden="true" />
                <input
                  ref={search}
                  type="text"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={visible[active] ? optionId(active) : undefined}
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onSearchChange?.(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onListKey}
                />
              </div>
            )}
            <ul
              ref={list}
              id={listId}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              aria-activedescendant={!searchable && visible[active] ? optionId(active) : undefined}
              tabIndex={searchable ? -1 : 0}
              className="kivu-combobox__list"
              onKeyDown={searchable ? undefined : onListKey}
            >
              {loading && <li className="kivu-combobox__note" role="presentation">Loading…</li>}
              {!loading && visible.length === 0 && <li className="kivu-combobox__note" role="presentation">{emptyText}</li>}
              {visible.map((o, i) => {
                const isSel = selected.includes(o.value);
                return (
                  <li
                    key={o.value}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isSel}
                    aria-disabled={o.disabled || undefined}
                    data-active={i === active || undefined}
                    className={cx("kivu-combobox__option", multiple && "kivu-combobox__option--multi")}
                    onPointerMove={() => !o.disabled && i !== active && setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                  >
                    {multiple && <span className={cx("kivu-combobox__box", isSel && "kivu-combobox__box--on")} aria-hidden="true">{isSel && <Check />}</span>}
                    {o.icon != null && <span className="kivu-combobox__option-icon" aria-hidden="true">{o.icon}</span>}
                    <span className="kivu-combobox__option-text">
                      <span>{o.label}</span>
                      {o.description && <span className="kivu-combobox__option-desc">{o.description}</span>}
                    </span>
                    {!multiple && isSel && <Check className="kivu-combobox__tick" aria-hidden="true" />}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </PickerField>
      {name != null && selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
    </>
  );
}
