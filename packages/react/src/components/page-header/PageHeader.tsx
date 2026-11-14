import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Slot } from "../../utils/slot";

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Usually `<Breadcrumbs>`, shown above the title. */
  breadcrumbs?: ReactNode;
  /** Buttons on the right (wrap below the title on small screens). */
  actions?: ReactNode;
  /** Heading level for the title. */
  as?: "h1" | "h2" | "h3";
}

/** Top of a dashboard page: breadcrumbs, title, description and page actions. */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, description, breadcrumbs, actions, as: Heading = "h1", className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cx("kivu-page-header", className)} {...props}>
      {breadcrumbs}
      <div className="kivu-page-header__row">
        <div className="kivu-page-header__text">
          <Heading className="kivu-page-header__title">{title}</Heading>
          {description != null && <p className="kivu-page-header__description">{description}</p>}
        </div>
        {actions != null && <div className="kivu-page-header__actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
});

/* -------------------------------------------------------------- Breadcrumbs */

export const Breadcrumbs = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Breadcrumbs(
  { className, children, ...props },
  ref,
) {
  return (
    <nav ref={ref} aria-label={props["aria-label"] ?? "Breadcrumb"} className={cx("kivu-breadcrumbs", className)} {...props}>
      <ol className="kivu-breadcrumbs__list">{children}</ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The current page: rendered as plain text with `aria-current="page"`. */
  current?: boolean;
  /** Render your router's link instead of `<a>`. */
  asChild?: boolean;
}

export const BreadcrumbItem = forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { current, asChild, className, children, ...props },
  ref,
) {
  let content: ReactNode;
  if (current) {
    content = <span aria-current="page" className={cx("kivu-breadcrumbs__current", className)}>{children}</span>;
  } else if (asChild) {
    content = <Slot ref={ref} className={cx("kivu-breadcrumbs__link", className)} {...props}>{children}</Slot>;
  } else {
    content = <a ref={ref} className={cx("kivu-breadcrumbs__link", className)} {...props}>{children}</a>;
  }
  return <li className="kivu-breadcrumbs__item">{content}</li>;
});
