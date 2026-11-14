import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Inbox } from "../../utils/icons";
import { IconTile } from "../section/IconTile";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Icon shown in a tile. Pass `null` to hide it. */
  icon?: ReactNode | null;
  /** Buttons, e.g. "Create project" or "Clear filters". */
  actions?: ReactNode;
  size?: "sm" | "md";
  /** Dashed border around the area (for empty panels and drop zones). */
  bordered?: boolean;
}

/** What to show when there's nothing yet: an empty table, no search results, a new account. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, actions, size = "md", bordered, className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cx("kivu-empty", `kivu-empty--${size}`, bordered && "kivu-empty--bordered", className)} {...props}>
      {icon !== null && <IconTile size={size === "sm" ? "sm" : "md"}>{icon ?? <Inbox />}</IconTile>}
      <div className="kivu-empty__text">
        <p className="kivu-empty__title">{title}</p>
        {description != null && <p className="kivu-empty__description">{description}</p>}
      </div>
      {actions != null && <div className="kivu-empty__actions">{actions}</div>}
      {children}
    </div>
  );
});
