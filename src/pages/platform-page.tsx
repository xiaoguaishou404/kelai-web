import { useLocation } from "react-router-dom";
import Platform from "@/components/enterprise/platform";

export function PlatformPage() {
  const { pathname } = useLocation();
  const path = pathname
    .replace(/^\/platform\/?/, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);

  return <Platform path={path} />;
}
