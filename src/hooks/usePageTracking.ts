/* ============================================================================
   usePageTracking — fires a page_viewed event whenever react-router's URL
   path or search string changes.

   Mounted once inside <BrowserRouter> in App.tsx. Ignores hash-only changes
   so that scrolling to anchors (handled by ScrollToHash) doesn't double-fire.

   The visitor row is initialised lazily by track() itself, so this hook does
   not need to await visitor creation — track() handles that internally.
   ========================================================================= */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { EVENTS, track } from "@/lib/tracking";

export function usePageTracking() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    track(EVENTS.page_viewed, {
      path: pathname,
      search: search || null,
    });
    // Re-fire on pathname or search change. Hash changes are intentionally
    // excluded — they trigger ScrollToHash, not a new page view.
  }, [pathname, search]);
}
