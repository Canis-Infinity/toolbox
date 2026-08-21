import type { MetadataRoute } from "next";
import { categories, tools } from "@/lib/tools/registry";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const releaseDate = new Date("2026-08-21T00:00:00.000Z");
  return [
    { url: siteUrl, lastModified: releaseDate, priority: 1 },
    { url: `${siteUrl}/tools`, lastModified: releaseDate, priority: 0.9 },
    ...Object.keys(categories).map((category) => ({
      url: `${siteUrl}/categories/${category}`,
      lastModified: releaseDate,
      priority: 0.8
    })),
    ...tools.map((tool) => ({
      url: `${siteUrl}/tools/${tool.slug}`,
      lastModified: releaseDate,
      priority: 0.7
    }))
  ];
}
