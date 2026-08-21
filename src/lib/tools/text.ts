import type { ToolExecution } from "./types";

export function textTool(slug: string, input: string): ToolExecution {
  if (slug === "uuid-generator") return ok(crypto.randomUUID(), "UUID v4 已產生。");
  if (!input) return { ok: false, message: "請輸入文字。" };
  if (slug === "case-converter") return ok(cases(input), "大小寫格式已轉換。");
  if (slug === "slug-generator") return ok(slugify(input), "Slug 已產生。");
  if (slug === "word-character-counter") return ok(count(input), "文字統計已完成。");
  return { ok: false, message: "未知的文字工具。" };
}

function ok(output: string, summary: string): ToolExecution {
  return { ok: true, output, language: "text", summary };
}

function words(input: string): string[] {
  return input.normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(/\s+/).filter(Boolean);
}

function cases(input: string): string {
  const parts = words(input);
  const lower = parts.map((part) => part.toLocaleLowerCase());
  const pascal = lower.map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`).join("");
  return [
    `camelCase: ${pascal.charAt(0).toLocaleLowerCase()}${pascal.slice(1)}`,
    `PascalCase: ${pascal}`,
    `snake_case: ${lower.join("_")}`,
    `kebab-case: ${lower.join("-")}`,
    `CONSTANT_CASE: ${lower.join("_").toLocaleUpperCase()}`,
    `Title Case: ${lower.map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`).join(" ")}`,
    `Sentence case: ${lower.join(" ").replace(/^./, (char) => char.toLocaleUpperCase())}`
  ].join("\n");
}

function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLocaleLowerCase();
}

function count(input: string): string {
  const graphemes = Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(input)).length;
  return [`Words: ${words(input).length}`, `Characters: ${input.length}`, `Graphemes: ${graphemes}`, `UTF-8 bytes: ${new TextEncoder().encode(input).length}`, `Lines: ${input.split(/\r?\n/).length}`].join("\n");
}
