"use client";

import { useEffect } from "react";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        
        // Request notification permission if not already granted
        if ("Notification" in window && Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            return;
          }
        }
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    // Delay registration slightly to avoid blocking initial render.
    const timeout = window.setTimeout(register, 1200);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  return null;
}
