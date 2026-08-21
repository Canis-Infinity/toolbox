import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["zh-TW", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "zh-TW";

export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get("toolbox-locale")?.value;
  const locale: AppLocale = locales.includes(requested as AppLocale) ? (requested as AppLocale) : defaultLocale;
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
