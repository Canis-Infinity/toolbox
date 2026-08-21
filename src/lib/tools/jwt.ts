import type { ToolExecution, ToolOptions } from "./types";
import { cryptoTool } from "./crypto";

type JwtPayload = Record<string, unknown>;

export function jwtTool(slug: string, input: string, options: ToolOptions): ToolExecution {
  if (slug === "jwt-secret-generator") return cryptoTool("random-secret-generator", "", options);
  if (!input.trim()) return { ok: false, message: "請輸入三段式 JWT compact token。" };
  try {
    const decoded = decodeJwt(input);
    if (slug === "jwt-expiration-checker") return expiration(decoded.payload);
    return {
      ok: true,
      language: "json",
      summary: "JWT 已 decode。Decode 不代表簽章有效，這裡沒有 verify signature。",
      warnings: ["Decode 不代表簽章有效。"],
      output: JSON.stringify(decoded, null, 2)
    };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "JWT decode 失敗。" };
  }
}

function decodeJwt(token: string): { header: JwtPayload; payload: JwtPayload } {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("JWT 必須是 header.payload.signature 三段。");
  return {
    header: JSON.parse(base64Url(parts[0] ?? "")) as JwtPayload,
    payload: JSON.parse(base64Url(parts[1] ?? "")) as JwtPayload
  };
}

function base64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return new TextDecoder().decode(Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0)));
}

function expiration(payload: JwtPayload): ToolExecution {
  const now = Math.floor(Date.now() / 1000);
  const rows = ["Decode 不代表簽章有效。"];
  for (const key of ["exp", "nbf", "iat"] as const) {
    const value = payload[key];
    if (typeof value === "number") rows.push(`${key}: ${value} | UTC ${new Date(value * 1000).toISOString()} | Local ${new Date(value * 1000).toLocaleString()}`);
  }
  const exp = payload.exp;
  const nbf = payload.nbf;
  const status =
    typeof exp === "number" && exp < now ? "expired" : typeof nbf === "number" && nbf > now ? "not yet valid" : typeof exp === "number" || typeof nbf === "number" ? "active" : "unknown";
  rows.push(`Status: ${status}`);
  return { ok: true, output: rows.join("\n"), language: "text", summary: "JWT 時間欄位已解析。" };
}
