import { converter, formatCss, formatHex, formatRgb, wcagContrast } from "culori";
import type { Color } from "culori";
import type { ToolExecution } from "./types";

const toRgb = converter("rgb");
const toHsl = converter("hsl");
const toHsv = converter("hsv");
const toHwb = converter("hwb");
const toLab = converter("lab65");
const toLch = converter("lch65");
const toOklab = converter("oklab");
const toOklch = converter("oklch");
const toXyz65 = converter("xyz65");
const toXyz50 = converter("xyz50");

export function colorTool(slug: string, input: string): ToolExecution {
  if (!input.trim()) return { ok: false, message: "請輸入 CSS 色彩。" };
  try {
    if (slug === "contrast-checker") return contrast(input);
    if (slug === "palette-generator") return palette(input);
    const color = parseColor(input);
    const rows = [
      ["HEX", formatHex(color).toUpperCase()],
      ["RGB(A)", formatRgb(color)],
      ["HSL(A)", formatCss(toHsl(color))],
      ["HSV / HSB", channels(toHsv(color))],
      ["HWB", channels(toHwb(color))],
      ["CMYK", cmyk(color)],
      ["CIE LAB D65", channels(toLab(color))],
      ["CIE LCH D65", channels(toLch(color))],
      ["OKLab", channels(toOklab(color))],
      ["OKLCH", channels(toOklch(color))],
      ["XYZ D65", channels(toXyz65(color))],
      ["XYZ D50", channels(toXyz50(color))]
    ];
    return ok(rows.map(([name, value]) => `${name}: ${value}`).join("\n"), "色彩已轉換。");
  } catch {
    return { ok: false, message: "無法辨識此色彩格式，請輸入 HEX、RGB、HSL、CSS named color 或 Color 4 函式。" };
  }
}

function parseColor(input: string): Color {
  validateExplicitRanges(input.trim());
  const parsed = toRgb(input.trim());
  if (!parsed) throw new Error("Invalid color");
  return parsed;
}

function validateExplicitRanges(input: string): void {
  const rgb = /^rgba?\((.+)\)$/i.exec(input);
  if (rgb) {
    const values = rgb[1].replace(/\//g, " ").split(/[\s,]+/).filter(Boolean);
    const channels = values.slice(0, 3).map((value) => value.endsWith("%") ? Number.parseFloat(value) * 2.55 : Number.parseFloat(value));
    const alpha = values[3] === undefined ? 1 : values[3].endsWith("%") ? Number.parseFloat(values[3]) / 100 : Number.parseFloat(values[3]);
    if (channels.some((value) => !Number.isFinite(value) || value < 0 || value > 255) || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
      throw new Error("RGB channel out of range");
    }
  }
  const hsl = /^hsla?\((.+)\)$/i.exec(input);
  if (hsl) {
    const values = hsl[1].replace(/\//g, " ").split(/[\s,]+/).filter(Boolean);
    const percentages = values.slice(1, 3).map((value) => Number.parseFloat(value));
    const alpha = values[3] === undefined ? 1 : values[3].endsWith("%") ? Number.parseFloat(values[3]) / 100 : Number.parseFloat(values[3]);
    if (percentages.some((value) => !Number.isFinite(value) || value < 0 || value > 100) || !Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
      throw new Error("HSL channel out of range");
    }
  }
}

function ok(output: string, summary: string): ToolExecution {
  return { ok: true, output, language: "text", summary };
}

function channels(color: Color | undefined): string {
  if (!color) return "out of gamut / unsupported";
  const entries = Object.entries(color)
    .filter(([key]) => key !== "mode")
    .map(([key, value]) => `${key}=${typeof value === "number" ? round(value) : String(value)}`);
  return `${color.mode}(${entries.join(", ")})`;
}

function cmyk(color: Color): string {
  const rgb = toRgb(color);
  if (!rgb) return "unsupported";
  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return "cmyk(0%, 0%, 0%, 100%)";
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return `cmyk(${pct(c)}, ${pct(m)}, ${pct(y)}, ${pct(k)}) - 裝置無關近似值`;
}

function contrast(input: string): ToolExecution {
  const [foreground, background] = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!foreground || !background) return { ok: false, message: "請用兩行輸入前景色與背景色。" };
  const ratio = wcagContrast(parseColor(foreground), parseColor(background));
  return ok(
    [
      `Ratio: ${round(ratio)}:1`,
      `Normal AA: ${ratio >= 4.5 ? "pass" : "fail"}`,
      `Normal AAA: ${ratio >= 7 ? "pass" : "fail"}`,
      `Large AA: ${ratio >= 3 ? "pass" : "fail"}`,
      `Large AAA: ${ratio >= 4.5 ? "pass" : "fail"}`
    ].join("\n"),
    "WCAG contrast 已計算。"
  );
}

function palette(input: string): ToolExecution {
  const color = parseColor(input);
  const base = toOklch(color);
  if (!base || typeof base.h !== "number") return { ok: false, message: "此色彩無法產生 hue-based palette。" };
  const swatches = [
    ["Base", base.h],
    ["Complementary", base.h + 180],
    ["Analogous -30", base.h - 30],
    ["Analogous +30", base.h + 30],
    ["Triadic A", base.h + 120],
    ["Triadic B", base.h + 240],
    ["Tetradic A", base.h + 90],
    ["Tetradic B", base.h + 270],
    ["Monochromatic light", base.h]
  ].map(([name, hue]) => {
    const lightness = name === "Monochromatic light" ? Math.min(base.l + 0.18, 1) : base.l;
    return `${name}: ${formatHex({ ...base, l: lightness, h: normalizeHue(Number(hue)) }).toUpperCase()}`;
  });
  return ok(swatches.join("\n"), "Palette 已在 OKLCH hue rotation 產生。");
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function pct(value: number): string {
  return `${Math.round(value * 10000) / 100}%`;
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}
