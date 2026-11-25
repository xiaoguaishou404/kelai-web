import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollManager() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const targetId = decodeURIComponent(hash.replace(/^#/, ""));

    if (!targetId) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    window.dispatchEvent(new HashChangeEvent("hashchange"));

    let attempts = 0;
    let frame = 0;
    let timer = 0;
    const reveal = () => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      if (attempts < 6) {
        attempts += 1;
        timer = window.setTimeout(reveal, 120);
      }
    };

    frame = window.requestAnimationFrame(reveal);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname, search, hash]);

  return null;
}
