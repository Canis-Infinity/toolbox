export const siteConfig = {
  name: "Developer Tools",
  title: "Developer Tools 開源免費工具箱",
  description:
    "開源免費的實用工具箱，支援程式碼、JSON、YAML、Encoding、Color、JWT、Hash、日期與文字轉換。",
  defaultUrl: "https://toolbox.iistw.com",
  localUrl: "http://localhost:6011",
  ogAlt:
    "Developer Tools 開源免費工具箱介面，包含程式碼格式化、色彩、JWT 與 Command Palette",
  port: 6011
} as const;

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return siteConfig.defaultUrl;

  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return siteConfig.defaultUrl;
  }
}

export function getCanonical(pathname: string): string {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalized}`;
}

export function isProductionIndexable(): boolean {
  const url = getSiteUrl();
  return process.env.NODE_ENV === "production" && url.startsWith("https://");
}
