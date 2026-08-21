"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export type UsageState = {
  total: number;
  tools: Record<string, number>;
};

type UsageResponse = {
  total: number;
  tools: Array<{ toolSlug: string; count: number }>;
};

type UsageContextValue = UsageState & {
  refreshUsage: () => Promise<void>;
  recordUsage: (toolSlug: string) => Promise<void>;
};

const emptyUsage: UsageState = { total: 0, tools: {} };
const UsageContext = createContext<UsageContextValue | null>(null);

function normalizeUsage(payload: UsageResponse): UsageState {
  return {
    total: Number.isSafeInteger(payload.total) && payload.total >= 0 ? payload.total : 0,
    tools: Array.isArray(payload.tools)
      ? Object.fromEntries(
          payload.tools
            .filter(({ toolSlug, count }) => typeof toolSlug === "string" && Number.isSafeInteger(count) && count >= 0)
            .map(({ toolSlug, count }) => [toolSlug, count])
        )
      : {}
  };
}

export function UsageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [usage, setUsage] = useState<UsageState>(emptyUsage);

  const refreshUsage = useCallback(async () => {
    try {
      const response = await fetch("/api/tool-usage", { cache: "no-store" });
      if (!response.ok) return;
      setUsage(normalizeUsage((await response.json()) as UsageResponse));
    } catch {
      // Usage statistics must never prevent a tool from working.
    }
  }, []);

  useEffect(() => {
    void refreshUsage();
  }, [pathname, refreshUsage]);

  const recordUsage = useCallback(async (toolSlug: string) => {
    try {
      await fetch("/api/tool-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug })
      });
    } catch {
      // The tool result remains successful even when statistics are unavailable.
    } finally {
      await refreshUsage();
    }
  }, [refreshUsage]);

  const value = useMemo(() => ({ ...usage, refreshUsage, recordUsage }), [usage, refreshUsage, recordUsage]);

  return createElement(UsageContext.Provider, { value }, children);
}

export function useUsage(): UsageContextValue {
  const context = useContext(UsageContext);
  if (!context) throw new Error("useUsage must be used within UsageProvider");
  return context;
}
