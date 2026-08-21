import { jsonrepair } from "jsonrepair";
import type { ToolExecution, ToolOptions } from "./types";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export function parseJson(input: string): JsonValue {
  return JSON.parse(input) as JsonValue;
}

export function jsonTool(slug: string, input: string, options: ToolOptions): ToolExecution {
  if (!input.trim()) return { ok: false, message: "請輸入 JSON 或文字內容。" };

  try {
    switch (slug) {
      case "json-formatter": {
        const parsed = parseJsonForFormatting(input);
        return ok(
          JSON.stringify(parsed.value, null, indent(options)),
          "json",
          parsed.repaired ? "JSON 已修復並格式化。" : "JSON 已格式化。",
          parsed.repaired ? ["已自動修正常見且可判定的 JSON 語法問題，請確認輸出符合原意。"] : undefined
        );
      }
      case "json-minify": {
        const value = parseJson(input);
        return ok(JSON.stringify(value), "json", "JSON 已壓縮。");
      }
      case "json-validator": {
        const value = parseJson(input);
        const rootType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
        return ok(`Valid JSON\nRoot type: ${rootType}`, "text", "JSON 語法有效。");
      }
      case "json-sort-keys": {
        const value = sortJson(parseJson(input), options.recursiveSort !== false);
        return ok(JSON.stringify(value, null, indent(options)), "json", "JSON keys 已排序。");
      }
      case "json-escape":
        return ok(JSON.stringify(input).slice(1, -1), "text", "文字已轉成 JSON string content。");
      case "json-unescape":
        return ok(unescapeJson(input), "text", "JSON string 已解析。");
      case "json-to-typescript":
        return ok(jsonToTypeScript(parseJson(input), options.typeName ?? "Root"), "typescript", "TypeScript 型別已產生。");
      default:
        return { ok: false, message: "未知的 JSON 工具。" };
    }
  } catch (error) {
    return jsonError(error, input);
  }
}

function ok(output: string, language: string, summary: string, warnings?: string[]): ToolExecution {
  return { ok: true, output, language, summary, warnings };
}

function parseJsonForFormatting(input: string): { value: JsonValue; repaired: boolean } {
  try {
    return { value: parseJson(input), repaired: false };
  } catch {
    return { value: parseJson(jsonrepair(input)), repaired: true };
  }
}

function indent(options: ToolOptions): number | string {
  if (options.indent === "4") return 4;
  if (options.indent === "tab") return "\t";
  return 2;
}

function sortJson(value: JsonValue, recursive: boolean): JsonValue {
  if (Array.isArray(value)) {
    return recursive ? value.map((item) => sortJson(item, true)) : value;
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<{ [key: string]: JsonValue }>((accumulator, key) => {
        accumulator[key] = recursive ? sortJson(value[key], true) : value[key];
        return accumulator;
      }, {});
  }
  return value;
}

function unescapeJson(input: string): string {
  const trimmed = input.trim();
  const literal = trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed : `"${trimmed}"`;
  const parsed = JSON.parse(literal) as unknown;
  if (typeof parsed !== "string") throw new Error("輸入不是 JSON string。");
  return parsed;
}

function jsonToTypeScript(value: JsonValue, typeName: string): string {
  const safeName = /^[A-Za-z_$][\w$]*$/.test(typeName) ? typeName : "Root";
  const children: string[] = [];
  const root = inferType(value, safeName, children);
  return [`export type ${safeName} = ${root};`, ...children].join("\n\n");
}

function inferType(value: JsonValue, name: string, children: string[]): string {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const unique = [...new Set(value.map((item, index) => inferType(item, `${name}Item${index + 1}`, children)))];
    return `(${unique.join(" | ")})[]`;
  }
  if (typeof value !== "object") return typeof value;

  const fields = Object.entries(value).map(([key, child]) => {
    const fieldName = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
    return `  ${fieldName}: ${inferType(child, pascal(key), children)};`;
  });
  return `{\n${fields.join("\n")}\n}`;
}

function pascal(value: string): string {
  const text = value.replace(/[^A-Za-z0-9_$]+/g, " ").replace(/\s+(.)/g, (_, char: string) => char.toUpperCase());
  return `${text.charAt(0).toUpperCase()}${text.slice(1) || "Value"}`;
}

function jsonError(error: unknown, input: string): ToolExecution {
  const message = error instanceof Error ? error.message : "JSON 處理失敗。";
  const position = /position (\d+)/.exec(message);
  const explicitLocation = /line (\d+) column (\d+)/i.exec(message);
  const offset = position ? Number(position[1]) : undefined;
  const before = offset === undefined ? "" : input.slice(0, offset);
  const line = explicitLocation ? Number(explicitLocation[1]) : offset === undefined ? undefined : before.split("\n").length;
  const column = explicitLocation ? Number(explicitLocation[2]) : offset === undefined ? undefined : (before.match(/[^\n]*$/)?.[0].length ?? 0) + 1;
  const unquotedKey = /[{,]\s*[A-Za-z_$][\w$-]*\s*:/.test(input);
  return {
    ok: false,
    message: unquotedKey
      ? "JSON 屬性名稱必須使用雙引號，例如 {\"test\": 1}。"
      : `JSON 語法錯誤：${message.replace(/^SyntaxError:\s*/, "")}`,
    line,
    column
  };
}
