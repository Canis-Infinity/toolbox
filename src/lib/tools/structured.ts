import yaml from "js-yaml";
import prettier from "prettier/standalone";
import prettierYaml from "prettier/plugins/yaml";
import type { ToolExecution } from "./types";
import { parseJson } from "./json";

export async function structuredTool(slug: string, input: string): Promise<ToolExecution> {
  if (!input.trim()) return { ok: false, message: "請輸入設定內容。" };

  try {
    switch (slug) {
      case "yaml-formatter":
        return ok(await prettier.format(input, { parser: "yaml", plugins: [prettierYaml], tabWidth: 2 }), "yaml", "YAML 已格式化。");
      case "yaml-validator":
        yaml.load(input, { json: false, schema: yaml.FAILSAFE_SCHEMA });
        return ok("Valid YAML", "text", "YAML 語法有效。");
      case "yaml-to-json":
        return ok(JSON.stringify(yaml.load(input, { json: false }), null, 2), "json", "YAML 已轉成 JSON。");
      case "json-to-yaml":
        return ok(yaml.dump(parseJson(input), { indent: 2, lineWidth: 100, noRefs: true }), "yaml", "JSON 已轉成 YAML。");
      case "ini-conf-formatter":
        return ok(formatIni(input), "ini", "INI-style .conf 已格式化。", validateIni(input).warnings);
      case "ini-conf-validator": {
        const result = validateIni(input);
        return ok(result.warnings.length ? `Valid with warnings\n${result.warnings.join("\n")}` : "Valid INI-style .conf", "text", "INI-style .conf 語法有效。", result.warnings);
      }
      case "nginx-conf-formatter":
        return ok(formatNginx(input), "nginx", "Nginx CONF 已格式化。");
      default:
        return { ok: false, message: "未知的 structured data 工具。" };
    }
  } catch (error) {
    const detail = error as { message?: string; mark?: { line?: number; column?: number }; loc?: { start?: { line?: number; column?: number } } };
    const lineFromMessage = /第 (\d+) 行/.exec(detail.message ?? "");
    return {
      ok: false,
      message: detail.message ?? "設定格式處理失敗，請檢查語法。",
      line: detail.mark?.line !== undefined ? detail.mark.line + 1 : detail.loc?.start?.line ?? (lineFromMessage ? Number(lineFromMessage[1]) : undefined),
      column: detail.mark?.column !== undefined ? detail.mark.column + 1 : detail.loc?.start?.column
    };
  }
}

function ok(output: string, language: string, summary: string, warnings?: string[]): ToolExecution {
  return { ok: true, output: output.trimEnd(), language, summary, warnings };
}

function validateIni(input: string): { warnings: string[] } {
  const warnings: string[] = [];
  const seen = new Set<string>();
  input.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";")) return;
    if (/^\[[^\]]+\]$/.test(trimmed)) return;
    if (!/^[^=:#\s][^=:]*\s*[=:]\s*.*$/.test(trimmed)) {
      throw new Error(`第 ${index + 1} 行不是有效的 section 或 key/value。`);
    }
    const key = trimmed.split(/[=:]/, 1)[0]?.trim();
    if (key) {
      if (seen.has(key)) warnings.push(`Duplicate key: ${key}`);
      seen.add(key);
    }
  });
  return { warnings };
}

function formatIni(input: string): string {
  validateIni(input);
  return input
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith(";") || /^\[[^\]]+\]$/.test(trimmed)) return trimmed;
      const match = /^([^=:]+)([=:])(.*)$/.exec(trimmed);
      return match ? `${match[1].trim()} ${match[2]} ${match[3].trim()}` : trimmed;
    })
    .join("\n");
}

function formatNginx(input: string): string {
  let depth = 0;
  const output: string[] = [];
  const tokens = input.replace(/\s*\{/g, " {\n").replace(/\s*\}/g, "\n}\n").replace(/;/g, ";\n").split(/\r?\n/);

  for (const token of tokens) {
    const line = token.trim();
    if (!line) continue;
    if (line === "}") depth -= 1;
    if (depth < 0) throw new Error("Nginx CONF braces 不平衡。");
    if (!line.startsWith("#") && line !== "}" && !line.endsWith("{") && !line.endsWith(";")) {
      throw new Error(`缺少 semicolon 或 block brace：${line.slice(0, 80)}`);
    }
    output.push(`${" ".repeat(depth * 4)}${line}`);
    if (line.endsWith("{")) depth += 1;
  }

  if (depth !== 0) throw new Error("Nginx CONF braces 不平衡。");
  return output.join("\n");
}
