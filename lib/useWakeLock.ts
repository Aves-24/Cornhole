"use client";

import { useEffect, useRef } from "react";

/** Keeps the screen from sleeping while the app is open and visible. */
export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function requestLock() {
      if (!("wakeLock" in navigator)) return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release();
          return;
        }
        lockRef.current = lock;
      } catch {
        // Denied, unsupported, or blocked by battery saver — nothing to do.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") requestLock();
    }

    requestLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, []);
}
