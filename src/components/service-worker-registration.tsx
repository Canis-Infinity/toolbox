"use client";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .catch((error) => console.warn("備援頁暫時無法啟用", error));
  }, []);
  return null;
}
