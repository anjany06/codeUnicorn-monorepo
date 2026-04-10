"use client";

import { useEffect, useRef } from "react";

/**
 * Pre-warms the backend server on Render by sending a lightweight
 * health-check request as soon as the landing page mounts.
 *
 * Render's free tier puts the server to sleep after ~15 min of inactivity,
 * causing cold-start delays of 30-50s. By pinging early (while the user
 * browses the landing page), the backend is already warm by the time
 * they navigate to /login or /dashboard.
 *
 * Features:
 * - Fires once per page load (not on every re-render)
 * - Silently fails — never blocks UI or shows errors
 * - Retries once after 5s if the first ping fails (server might be booting)
 * - Uses AbortController to cancel in-flight requests on unmount
 */
export function usePrewarmBackend() {
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const controller = new AbortController();

    const ping = async (attempt = 1) => {
      try {
        await fetch("/health", {
          method: "GET",
          signal: controller.signal,
          // Don't send cookies or credentials — this is just a wake-up call
          credentials: "omit",
          // Bypass any caching
          cache: "no-store",
        });
        if (process.env.NODE_ENV === "development") {
          console.log(`[prewarm] Backend is awake (attempt ${attempt})`);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (attempt === 1) {
          // Retry once after 5 seconds — server might still be booting
          setTimeout(() => ping(2), 5000);
        } else if (process.env.NODE_ENV === "development") {
          console.warn("[prewarm] Backend wake-up failed after 2 attempts");
        }
      }
    };

    ping();

    return () => {
      controller.abort();
    };
  }, []);
}
