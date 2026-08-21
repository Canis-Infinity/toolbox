import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { tools } from "@/lib/tools/registry";
import { getCanonical } from "@/lib/site";

describe("seo helpers", () => {
  it("builds canonical URLs", () => {
    expect(getCanonical("/tools/json-formatter")).toContain("/tools/json-formatter");
  });

  it("maps every tool into sitemap once", () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const tool of tools) {
      expect(urls.filter((url) => url.endsWith(`/tools/${tool.slug}`))).toHaveLength(1);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("disallows non-production robots", () => {
    expect(robots().rules).toMatchObject({ userAgent: "*", disallow: "/" });
  });
});
