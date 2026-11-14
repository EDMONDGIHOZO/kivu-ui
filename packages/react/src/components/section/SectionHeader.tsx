import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { IconTile } from "./IconTile";

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** Icon rendered inside an IconTile above everything. */
  icon?: ReactNode;
  /** Buttons/links below the text. */
  actions?: ReactNode;
  align?: "center" | "start";
  /** Heading level for the title (default h2). */
  as?: "h1" | "h2" | "h3";
  /** Light text for dark/brand backgrounds. */
  inverted?: boolean;
}

/** IconTile → eyebrow → display heading → description → actions. */
export const SectionHeader = forwardRef<HTMLElement, SectionHeaderProps>(function SectionHeader(
  { title, eyebrow, description, icon, actions, align = "center", as: Heading = "h2", inverted, className, ...props },
  ref,
) {
  return (
    <header
      ref={ref}
      className={cx("kivu-section-header", `kivu-section-header--${align}`, inverted && "kivu-section-header--inverted", className)}
      {...props}
    >
      {icon != null && <IconTile>{icon}</IconTile>}
      {eyebrow != null && <p className="kivu-section-header__eyebrow">{eyebrow}</p>}
      <Heading className="kivu-section-header__title">{title}</Heading>
      {description != null && <p className="kivu-section-header__description">{description}</p>}
      {actions != null && <div className="kivu-section-header__actions">{actions}</div>}
    </header>
  );
});

/** Highlights part of a heading in the accent colour: `Plan it on <Highlight>one</Highlight> board`. */
export function Highlight({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cx("kivu-highlight", className)} {...props} />;
}
