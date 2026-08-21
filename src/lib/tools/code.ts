import type { Plugin } from "prettier";
import { CODE_FORMAT_LANGUAGES, CODE_MINIFY_LANGUAGES } from "./code-config";
import type { ToolExecution, ToolOptions } from "./types";

const PRETTIER_PARSERS: Record<string, string> = {
  javascript: "babel",
  typescript: "typescript",
  json: "json",
  html: "html",
  css: "css",
  markdown: "markdown",
  yaml: "yaml"
};

export async function codeTool(slug: string, input: string, options: ToolOptions): Promise<ToolExecution> {
  if (!input.trim()) return { ok: false, message: "請輸入要處理的程式碼。" };
  const language = options.codeLanguage ?? "javascript";
  const supported = slug === "code-formatter" ? CODE_FORMAT_LANGUAGES : CODE_MINIFY_LANGUAGES;
  if (!(supported as readonly string[]).includes(language)) return { ok: false, message: `目前不支援 ${language}。` };

  const output = slug === "code-formatter"
    ? await formatCode(input, language)
    : await minifyCode(input, language);

  return {
    ok: true,
    output,
    language,
    summary: slug === "code-formatter" ? "程式碼已格式化。" : "程式碼已壓縮。"
  };
}

async function formatCode(input: string, language: string): Promise<string> {
  const prettierParser = PRETTIER_PARSERS[language];
  if (prettierParser) {
    const prettier = await import("prettier/standalone");
    const plugins = await loadPrettierPlugins(language);
    return prettier.format(input, { parser: prettierParser, plugins, tabWidth: 2 });
  }
  if (language === "python") {
    if (!isBrowserRuntime()) {
      const { format } = await loadNodeFormatter("@wasm-fmt/ruff_fmt/node");
      return format(input, "main.py");
    }
    const { default: init, format } = await import("@wasm-fmt/ruff_fmt/web");
    await init("/formatters/ruff_fmt_bg.wasm");
    return format(input, "main.py");
  }
  if (["java", "c", "cpp", "csharp"].includes(language)) {
    const extension = { java: "java", c: "c", cpp: "cc", csharp: "cs" }[language];
    if (!isBrowserRuntime()) {
      const { format } = await loadNodeFormatter("@wasm-fmt/clang-format/node");
      return format(input, `main.${extension}`, "LLVM");
    }
    const { default: init, format } = await import("@wasm-fmt/clang-format/web");
    await init("/formatters/clang-format.wasm");
    return format(input, `main.${extension}`, "LLVM");
  }
  if (language === "go") {
    if (!isBrowserRuntime()) {
      const { format } = await loadNodeFormatter("@wasm-fmt/gofmt/node");
      return format(input);
    }
    const { default: init, format } = await import("@wasm-fmt/gofmt/web");
    await init("/formatters/gofmt.wasm");
    return format(input);
  }
  if (language === "rust") {
    const [{ default: prettier }, { default: rustPlugin }] = await Promise.all([
      import("prettier2/standalone.js"),
      import("prettier-plugin-rust")
    ]);
    return prettier.format(input, { parser: "jinx-rust", plugins: [rustPlugin] });
  }
  if (language === "sql") {
    const { format } = await import("sql-formatter");
    return format(input, { language: "sql", keywordCase: "upper" });
  }
  if (language === "shell") {
    if (!isBrowserRuntime()) {
      const { format } = await loadNodeFormatter("@wasm-fmt/shfmt/node");
      return format(input, "script.sh");
    }
    const { default: init, format } = await import("@wasm-fmt/shfmt/web");
    await init("/formatters/shfmt.wasm");
    return format(input, "script.sh");
  }
  throw new Error(`目前不支援 ${language}。`);
}

async function loadPrettierPlugins(language: string): Promise<Plugin[]> {
  let modules: unknown[];
  switch (language) {
    case "javascript":
    case "json":
      modules = await Promise.all([import("prettier/plugins/babel"), import("prettier/plugins/estree")]);
      break;
    case "typescript":
      modules = await Promise.all([import("prettier/plugins/typescript"), import("prettier/plugins/estree")]);
      break;
    case "html":
      modules = [await import("prettier/plugins/html")];
      break;
    case "css":
      modules = [await import("prettier/plugins/postcss")];
      break;
    case "markdown":
      modules = [await import("prettier/plugins/markdown")];
      break;
    case "yaml":
      modules = [await import("prettier/plugins/yaml")];
      break;
    default:
      throw new Error(`目前不支援 ${language}。`);
  }
  return modules as Plugin[];
}

async function minifyCode(input: string, language: string): Promise<string> {
  if (language === "javascript") {
    const { minify } = await import("terser");
    const result = await minify(input, { compress: true, mangle: true });
    if (!result.code) throw new Error("JavaScript 壓縮後沒有可用輸出。");
    return result.code;
  }
  if (language === "json") return JSON.stringify(JSON.parse(input));
  if (language === "css") {
    const { minify } = await import("csso");
    return minify(input).css;
  }
  if (language === "html") {
    const { minify } = await import("html-minifier-terser/dist/htmlminifier.esm.bundle");
    return minify(input, { collapseWhitespace: true, removeComments: true, removeRedundantAttributes: true });
  }
  throw new Error(`目前不支援 ${language} 壓縮。`);
}

type NodeFormatterModule = {
  format(source: string, path?: string, options?: string): string;
};

async function loadNodeFormatter(specifier: string): Promise<NodeFormatterModule> {
  return import(/* webpackIgnore: true */ specifier) as Promise<NodeFormatterModule>;
}

function isBrowserRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !navigator.userAgent.toLowerCase().includes("jsdom")
  );
}
