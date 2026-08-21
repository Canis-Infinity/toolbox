"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export type AppLocale = "zh-TW" | "en";

export function useLanguagePreference() {
  const locale = useLocale();
  const router = useRouter();
  const currentLocale: AppLocale = locale === "en" ? "en" : "zh-TW";

  const setLocale = (value: AppLocale) => {
    if (value === currentLocale) return;
    document.cookie = `toolbox-locale=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return { locale: currentLocale, setLocale };
}
