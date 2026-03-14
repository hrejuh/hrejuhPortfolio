import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCallback, useEffect, useRef } from "react";

function getSessionId(): string {
  let id = sessionStorage.getItem("hrejuh-session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("hrejuh-session", id);
  }
  return id;
}

export function useAnalytics(page: string) {
  const recordView = useMutation(api.mutations.analytics.recordPageView);
  const updateDuration = useMutation(api.mutations.analytics.updatePageDuration);
  const recordClick = useMutation(api.mutations.analytics.recordProjectClick);
  const startTime = useRef(Date.now());
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    recordView({
      page,
      referrer: document.referrer || undefined,
      sessionId: sessionId.current,
    });

    startTime.current = Date.now();

    const handleUnload = () => {
      const duration = Date.now() - startTime.current;
      updateDuration({
        sessionId: sessionId.current,
        page,
        duration,
      });
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [page, recordView, updateDuration]);

  const trackProjectClick = useCallback(
    (projectSlug: string, clickType: "card" | "github" | "live" | "detail") => {
      recordClick({
        projectSlug,
        clickType,
        sessionId: sessionId.current,
      });
    },
    [recordClick]
  );

  return { trackProjectClick };
}
