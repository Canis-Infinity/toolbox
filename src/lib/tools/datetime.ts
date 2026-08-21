import type { ToolExecution } from "./types";

export function datetimeTool(slug: string, input: string): ToolExecution {
  try {
    if (slug === "timezone-display") return timezone();
    if (!input.trim()) return { ok: false, message: "請輸入日期或 timestamp。" };
    if (slug === "unix-to-date") return unixToDate(input);
    if (slug === "date-to-unix") return dateToUnix(input);
    if (slug === "iso-date-formatter") return isoDate(input);
    return { ok: false, message: "未知的日期工具。" };
  } catch {
    return { ok: false, message: "日期格式無效；請避免瀏覽器自動 rollover 的模糊日期。" };
  }
}

function unixToDate(input: string): ToolExecution {
  if (!/^-?\d+$/.test(input.trim())) return { ok: false, message: "Timestamp 必須是整數。" };
  const raw = Number(input.trim());
  const ms = Math.abs(raw) > 10_000_000_000 ? raw : raw * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return ok([`Detected unit: ${Math.abs(raw) > 10_000_000_000 ? "milliseconds" : "seconds"}`, `UTC: ${date.toISOString()}`, `Local: ${date.toLocaleString()}`].join("\n"), "Timestamp 已轉換。");
}

function dateToUnix(input: string): ToolExecution {
  if (!validCalendarDate(input)) throw new Error("Invalid calendar date");
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return ok([`Seconds: ${Math.floor(date.getTime() / 1000)}`, `Milliseconds: ${date.getTime()}`, `UTC: ${date.toISOString()}`, `Local timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`].join("\n"), "日期已轉成 Unix timestamp。");
}

function isoDate(input: string): ToolExecution {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(input.trim())) return { ok: false, message: "請輸入明確 ISO 8601 日期時間。" };
  return dateToUnix(input);
}

function validCalendarDate(input: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(input.trim());
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function timezone(): ToolExecution {
  const date = new Date();
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, "0");
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return ok([`IANA zone: ${zone}`, `UTC offset: ${sign}${hours}:${minutes}`, `Local time: ${date.toLocaleString()}`].join("\n"), "時區資訊已顯示。");
}

function ok(output: string, summary: string): ToolExecution {
  return { ok: true, output, language: "text", summary };
}
