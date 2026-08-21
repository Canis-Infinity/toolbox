import { decodeHTML, encodeHTML } from "entities";
import type { ToolExecution, ToolOptions } from "./types";

export function encodingTool(slug: string, input: string, options: ToolOptions): ToolExecution {
  if (!input) return { ok: false, message: "請輸入要處理的文字。" };

  try {
    switch (slug) {
      case "base64-encode":
        return ok(toBase64(input, options.mode === "base64url"), "Base64 編碼完成。");
      case "base64-decode":
        return ok(fromBase64(input, options.mode === "base64url"), "Base64 解碼完成。");
      case "url-encode":
        return ok(options.mode === "url" ? encodeURI(input) : encodeURIComponent(input), "URL 編碼完成。");
      case "url-decode":
        return ok(options.mode === "url" ? decodeURI(input) : decodeURIComponent(input), "URL 解碼完成。");
      case "html-entity-encode":
        return ok(encodeHTML(input), "HTML Entity 編碼完成。");
      case "html-entity-decode":
        return ok(decodeHTML(input), "HTML Entity 解碼完成。");
      case "unicode-escape":
        return ok([...input].map((char) => unicodeEscape(char)).join(""), "Unicode escape 完成。");
      case "unicode-unescape":
        if (/\\u/.test(input.replace(/\\u\{[0-9a-fA-F]{1,6}\}|\\u[0-9a-fA-F]{4}/g, ""))) throw new Error("Invalid unicode escape");
        return ok(input.replace(/\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g, (_, codePoint: string | undefined, unit: string | undefined) => {
          const value = Number.parseInt(codePoint ?? unit ?? "0", 16);
          if (value > 0x10ffff) throw new Error("Invalid unicode code point");
          return String.fromCodePoint(value);
        }), "Unicode unescape 完成。");
      default:
        return { ok: false, message: "未知的 encoding 工具。" };
    }
  } catch {
    return { ok: false, message: "輸入包含 malformed encoding，無法安全解碼。" };
  }
}

function ok(output: string, summary: string): ToolExecution {
  return { ok: true, output, language: "text", summary };
}

function toBase64(input: string, url: boolean): string {
  const bytes = new TextEncoder().encode(input);
  const binary = String.fromCharCode(...bytes);
  const value = btoa(binary);
  return url ? value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") : value;
}

function fromBase64(input: string, url: boolean): string {
  const normalized = url ? input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=") : input;
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0) throw new Error("Invalid base64");
  const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

function unicodeEscape(char: string): string {
  const code = char.codePointAt(0) ?? 0;
  if (code <= 0xffff) return `\\u${code.toString(16).padStart(4, "0")}`;
  return `\\u{${code.toString(16)}}`;
}
