import { describe, expect, it } from "vitest";
import en from "../messages/en.json";
import zhTw from "../messages/zh-TW.json";
import { tools } from "@/lib/tools/registry";

describe("translations", () => {
  it("keeps shared interface namespaces in sync", () => {
    for (const namespace of ["common", "home", "workbench", "action"] as const) {
      expect(Object.keys(en[namespace]).sort()).toEqual(Object.keys(zhTw[namespace]).sort());
    }
  });

  it("provides an English description for every registered tool", () => {
    expect(Object.keys(en.toolDescription).sort()).toEqual(tools.map((tool) => tool.slug).sort());
  });

  it("provides both localized names for every registered tool", () => {
    const slugs = tools.map((tool) => tool.slug).sort();
    expect(Object.keys(zhTw.toolName).sort()).toEqual(slugs);
    expect(Object.keys(en.toolName).sort()).toEqual(slugs);
    expect(Object.keys(zhTw.toolNavName).sort()).toEqual(slugs);
    expect(Object.keys(en.toolNavName).sort()).toEqual(slugs);
  });

  it("provides both locales for every category", () => {
    expect(Object.keys(en.category).sort()).toEqual(Object.keys(zhTw.category).sort());
  });
});
