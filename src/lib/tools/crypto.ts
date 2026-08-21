import { hmac } from "@noble/hashes/hmac";
import { md5 } from "@noble/hashes/legacy";
import { sha1 } from "@noble/hashes/sha1";
import { sha256 } from "@noble/hashes/sha256";
import { sha384, sha512 } from "@noble/hashes/sha2";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils";
import type { ToolExecution, ToolOptions } from "./types";

export function cryptoTool(slug: string, input: string, options: ToolOptions): ToolExecution {
  if (slug.includes("secret")) return secret(options.bytes ?? 32, options.outputEncoding ?? "base64url");
  if (!input && slug !== "random-secret-generator") return { ok: false, message: "請輸入要 hash / HMAC 的文字。" };

  if (slug === "hash-generator") {
    const bytes = utf8ToBytes(input);
    return {
      ok: true,
      language: "text",
      summary: "Hash 已產生。MD5 / SHA-1 僅適合相容性或 checksum，不適合密碼與安全簽章。",
      output: [
        `MD5: ${bytesToHex(md5(bytes))}`,
        `SHA-1: ${bytesToHex(sha1(bytes))}`,
        `SHA-256: ${bytesToHex(sha256(bytes))}`,
        `SHA-384: ${bytesToHex(sha384(bytes))}`,
        `SHA-512: ${bytesToHex(sha512(bytes))}`
      ].join("\n")
    };
  }

  if (slug === "hmac-generator") {
    const key = decodeKey(options.secret ?? "", options.keyEncoding ?? "utf8");
    const message = utf8ToBytes(input);
    const outputEncoding = options.outputEncoding ?? "hex";
    if (!["hex", "base64"].includes(outputEncoding)) return { ok: false, message: "HMAC output 只支援 HEX 或 Base64。" };
    return {
      ok: true,
      language: "text",
      summary: "HMAC 已產生；secret 只留在目前頁面記憶體。",
      output: [
        `HMAC SHA-256: ${encodeDigest(hmac(sha256, key, message), outputEncoding)}`,
        `HMAC SHA-512: ${encodeDigest(hmac(sha512, key, message), outputEncoding)}`
      ].join("\n")
    };
  }

  return { ok: false, message: "未知的 crypto 工具。" };
}

function secret(bytes: number, encoding: string): ToolExecution {
  if (!Number.isInteger(bytes) || bytes < 16 || bytes > 128) return { ok: false, message: "Secret 長度必須是 16 到 128 bytes 的整數。" };
  if (!["hex", "base64", "base64url"].includes(encoding)) return { ok: false, message: "不支援的 secret 輸出格式。" };
  const length = bytes;
  const data = crypto.getRandomValues(new Uint8Array(length));
  const output = encoding === "hex" ? bytesToHex(data) : toBase64(data, encoding === "base64url");
  return {
    ok: true,
    output,
    language: "text",
    summary: `已使用 crypto.getRandomValues 產生 ${length} bytes，約 ${length * 8} bits entropy。`
  };
}

function decodeKey(secretValue: string, encoding: string): Uint8Array {
  if (!secretValue) throw new Error("請輸入 HMAC secret。");
  if (encoding === "hex") {
    if (!/^[0-9a-fA-F]+$/.test(secretValue) || secretValue.length % 2 !== 0) throw new Error("HEX key 格式錯誤。");
    return Uint8Array.from(secretValue.match(/.{2}/g)?.map((part) => Number.parseInt(part, 16)) ?? []);
  }
  if (encoding === "base64") {
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(secretValue) || secretValue.length % 4 !== 0) throw new Error("Base64 key 格式錯誤。");
    return Uint8Array.from(atob(secretValue), (char) => char.charCodeAt(0));
  }
  if (encoding === "utf8") return utf8ToBytes(secretValue);
  throw new Error("不支援的 HMAC key encoding。");
}

function toBase64(bytes: Uint8Array, url: boolean): string {
  const value = btoa(String.fromCharCode(...bytes));
  return url ? value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") : value;
}

function encodeDigest(bytes: Uint8Array, encoding: string): string {
  return encoding === "base64" ? toBase64(bytes, false) : bytesToHex(bytes);
}
