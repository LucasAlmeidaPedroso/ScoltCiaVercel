"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingOverlay } from "./LoadingOverlay";

function isInternalNavigationLink(element: Element | null) {
  const anchor = element?.closest("a");
  if (!anchor) return false;

  const href = anchor.getAttribute("href") || "";
  const target = anchor.getAttribute("target");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("https://wa.me/")) return false;
  if (target && target !== "_self") return false;

  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin && url.pathname !== window.location.pathname;
  } catch {
    return false;
  }
}

export function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setVisible(false), 260);
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (isInternalNavigationLink(event.target as Element | null)) {
        window.clearTimeout(timerRef.current);
        setVisible(true);
      }
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.clearTimeout(timerRef.current);
    };
  }, []);

  return visible ? <LoadingOverlay label="Preparando a proxima pagina..." /> : null;
}
