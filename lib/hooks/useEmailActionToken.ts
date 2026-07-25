"use client";

import { useEffect, useState } from "react";

/**
 * Read an email action token from the URL fragment. Fragments are never sent
 * to the frontend server or included in HTTP request logs.
 */
export function useEmailActionToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const fragmentToken = fragment.get("token") || "";

    // This effect intentionally synchronizes React with the browser URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(fragmentToken);

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  return token;
}
