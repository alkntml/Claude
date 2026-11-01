import { forwardRef } from "react";
import { navigate } from "./router";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean };

const Link = forwardRef<HTMLAnchorElement, Props>(function Link({ href, onClick, prefetch: _p, scroll: _s, replace, target, ...rest }, ref) {
  void _p; void _s;
  const external = /^https?:\/\//.test(href);
  return (
    <a ref={ref} href={external ? href : `#${href}`} target={external ? "_blank" : target} rel={external ? "noopener noreferrer" : rest.rel} {...rest}
      onClick={(e) => { onClick?.(e); if (e.defaultPrevented || external) return; e.preventDefault(); navigate(href, replace); }} />
  );
});
export default Link;
