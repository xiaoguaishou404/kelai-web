import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
};

const EXTERNAL_PROTOCOL = /^[a-z][a-z0-9+.-]*:/i;

export function Link({ href, children, ...props }: LinkProps) {
  if (EXTERNAL_PROTOCOL.test(href) || href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to={href} {...props}>
      {children}
    </RouterLink>
  );
}
