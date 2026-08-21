"use client";

const key = "developer-toolbox-usage";

export type UsageState = {
  tools: Record<string, number>;
};

export function readUsage(): UsageState {
  if (typeof window === "undefined") return { tools: {} };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "") as UsageState;
    return {
      tools: parsed.tools && typeof parsed.tools === "object" ? parsed.tools : {}
    };
  } catch {
    return { tools: {} };
  }
}

export function incrementUsage(slug: string): UsageState {
  const state = readUsage();
  const next = {
    tools: { ...state.tools, [slug]: (state.tools[slug] ?? 0) + 1 }
  };
  window.localStorage.setItem(key, JSON.stringify(next));
  return next;
}
