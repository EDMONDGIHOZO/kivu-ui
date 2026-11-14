import { Children, forwardRef, isValidElement, useState, type HTMLAttributes, type ReactElement } from "react";
import { cx } from "../../utils/cx";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Initials are derived from this when the image is missing or fails. */
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** White ring — used when avatars overlap. */
  ring?: boolean;
}

function initials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size = "md", ring, className, children, ...props },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;
  return (
    <span
      ref={ref}
      className={cx("kivu-avatar", `kivu-avatar--${size}`, ring && "kivu-avatar--ring", className)}
      role={showImg ? undefined : "img"}
      aria-label={showImg ? undefined : alt ?? name}
      {...props}
    >
      {showImg ? (
        <img src={src} alt={alt ?? name ?? ""} onError={() => setFailed(true)} />
      ) : (
        children ?? <span aria-hidden="true">{initials(name)}</span>
      )}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Show at most this many avatars, then a "+N" bubble. */
  max?: number;
  size?: AvatarProps["size"];
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max, size = "md", className, children, ...props },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const shown = max != null ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <div ref={ref} className={cx("kivu-avatar-group", className)} {...props}>
      {shown.map((child, i) => (
        <Avatar key={child.key ?? i} size={size} ring {...child.props} />
      ))}
      {rest > 0 && (
        <span className={cx("kivu-avatar", `kivu-avatar--${size}`, "kivu-avatar--ring", "kivu-avatar--more")}>
          +{rest}
        </span>
      )}
    </div>
  );
});
