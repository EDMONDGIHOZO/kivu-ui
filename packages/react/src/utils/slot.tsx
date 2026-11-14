import * as React from "react";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "./cx";
import { composeRefs } from "./refs";

type AnyProps = Record<string, unknown>;

const REACT_LAZY = Symbol.for("react.lazy");
const IS_REACT_18 = React.version.startsWith("18.");

interface LazyElement {
  $$typeof: symbol;
  _payload: PromiseLike<ReactNode>;
}

function isLazyElement(node: unknown): node is LazyElement {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as LazyElement).$$typeof === REACT_LAZY &&
    typeof (node as LazyElement)._payload?.then === "function"
  );
}

/**
 * Renders its single child element, merging props/className/style/ref onto it.
 * Powers the `asChild` prop, e.g. `<Button asChild><a href="/">Home</a></Button>`.
 */
export const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { children?: ReactNode }>(
  function Slot({ children, ...slotProps }, ref) {
    // With React Server Components, a child passed from the server can arrive as a
    // lazy element while it streams in. Unwrap it (React 19+) before cloning.
    const use = (React as { use?: <T>(p: PromiseLike<T>) => T }).use;
    const resolved = isLazyElement(children) && use ? use(children._payload) : children;
    const child = Children.only(resolved);
    if (!isValidElement(child)) return null;
    const el = child as ReactElement<AnyProps> & { ref?: Ref<HTMLElement> };
    const childProps = el.props;
    const merged: AnyProps = { ...slotProps, ...childProps };

    // Chain event handlers so both slot and child handlers run.
    for (const key of Object.keys(slotProps)) {
      const s = (slotProps as AnyProps)[key];
      const c = childProps[key];
      if (/^on[A-Z]/.test(key) && typeof s === "function" && typeof c === "function") {
        merged[key] = (...args: unknown[]) => {
          (c as (...a: unknown[]) => void)(...args);
          (s as (...a: unknown[]) => void)(...args);
        };
      }
    }
    merged.className = cx(slotProps.className, childProps.className as string);
    merged.style = { ...slotProps.style, ...(childProps.style as object) };
    // React 19 exposes ref as a prop; React 18 on the element (reading element.ref warns in 19).
    const childRef = IS_REACT_18 ? el.ref : (childProps.ref as Ref<HTMLElement> | undefined);
    merged.ref = composeRefs(ref, childRef);
    return cloneElement(el, merged);
  },
);
