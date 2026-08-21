"use client";

import { AlertTriangle, CircleCheck, Copy, Download, FileOutput, Play, RotateCcw, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { CodeBlock } from "@/components/code-block";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { executeTool } from "@/lib/tools/execute";
import { CODE_EXAMPLES, CODE_FORMAT_LANGUAGES, CODE_MINIFY_LANGUAGES } from "@/lib/tools/code-config";
import type { ToolDefinition, ToolFailure, ToolOptions, ToolResult } from "@/lib/tools/types";
import { incrementUsage, readUsage } from "@/lib/usage";

const MONOSPACE_INPUT_LANGUAGES = new Set(["json", "yaml", "ini", "nginx", "jwt"]);
const MONOSPACE_INPUT_PREFIXES = ["base64-", "url-", "unicode-"];
const VALIDATOR_SLUGS = new Set(["json-validator", "yaml-validator", "ini-conf-validator"]);
const CODE_RESULT_SLUGS = new Set(["json-formatter", "json-minify", "json-sort-keys", "json-to-typescript", "yaml-formatter", "yaml-to-json", "json-to-yaml", "ini-conf-formatter", "nginx-conf-formatter", "jwt-decoder", "code-formatter", "code-minifier"]);
const DOWNLOADABLE_SLUGS = new Set(["json-formatter", "json-minify", "json-sort-keys", "json-to-typescript", "yaml-formatter", "yaml-to-json", "json-to-yaml", "ini-conf-formatter", "nginx-conf-formatter", "code-formatter", "code-minifier"]);
const LARGE_INPUT_SLUGS = new Set(["json-formatter", "json-minify", "json-sort-keys", "json-to-typescript", "yaml-formatter", "yaml-to-json", "json-to-yaml", "ini-conf-formatter", "nginx-conf-formatter", "code-formatter", "code-minifier"]);
const SINGLE_VALUE_SLUGS = new Set(["json-escape", "json-unescape", "base64-encode", "base64-decode", "url-encode", "url-decode", "html-entity-encode", "html-entity-decode", "unicode-escape", "unicode-unescape", "jwt-secret-generator", "random-secret-generator", "slug-generator", "uuid-generator"]);

const ColorInputs = dynamic(() => import("@/components/tool-color-inputs").then((module) => module.ColorInputs), { ssr: false });

export function ToolWorkbench({ tool }: { tool: ToolDefinition }) {
  const locale = useLocale();
  const t = useTranslations("workbench");
  const action = useTranslations("action");
  const description = useTranslations("toolDescription");
  const toolName = useTranslations("toolName");
  const localizedName = toolName(tool.slug);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [error, setError] = useState<ToolFailure | null>(null);
  const [running, setRunning] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [options, setOptions] = useState<ToolOptions>({ indent: "2", mode: "component", keyEncoding: "utf8", outputEncoding: tool.slug === "hmac-generator" ? "hex" : "base64url", bytes: 32, codeLanguage: "javascript" });
  const inputless = ["jwt-secret-generator", "random-secret-generator", "timezone-display", "uuid-generator"].includes(tool.slug);
  const secretGenerator = tool.slug === "jwt-secret-generator" || tool.slug === "random-secret-generator";
  const colorTool = tool.category === "color";
  const singleValueTool = SINGLE_VALUE_SLUGS.has(tool.slug);
  const validatorTool = VALIDATOR_SLUGS.has(tool.slug);
  const stackedLayout = colorTool || singleValueTool || VALIDATOR_SLUGS.has(tool.slug);
  const inputHeight = LARGE_INPUT_SLUGS.has(tool.slug) ? "min-h-80" : validatorTool ? "min-h-56" : "min-h-40";
  const monospaceInput = tool.category === "code" || MONOSPACE_INPUT_LANGUAGES.has(tool.inputLanguage) || MONOSPACE_INPUT_PREFIXES.some((prefix) => tool.slug.startsWith(prefix));
  const example = tool.category === "code" ? CODE_EXAMPLES[options.codeLanguage ?? "javascript"] ?? tool.example : tool.example;

  useEffect(() => {
    setUsageCount(readUsage().tools[tool.slug] ?? 0);
  }, [tool.slug]);

  const run = async (value = input) => {
    setRunning(true);
    const next = await executeTool(tool.slug, value, options);
    setRunning(false);
    if (next.ok) {
      setResult(next);
      setError(null);
      const usage = incrementUsage(tool.slug);
      setUsageCount(usage.tools[tool.slug] ?? 0);
    } else {
      setResult(null);
      setError(next);
    }
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setError(null);
  };

  const download = () => {
    if (!result?.ok) return;
    const blob = new Blob([result.output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const extensions: Record<string, string> = { javascript: "js", typescript: "ts", json: "json", html: "html", css: "css", markdown: "md", yaml: "yaml", python: "py", java: "java", c: "c", cpp: "cpp", csharp: "cs", go: "go", rust: "rs", sql: "sql", shell: "sh" };
    link.download = `${tool.slug}.${extensions[result.language] ?? "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
          <div>
            <h1 className="text-3xl font-semibold">{localizedName}</h1>
            <p className="mt-1 max-w-3xl text-muted-foreground">{locale === "en" ? description(tool.slug) : tool.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{t("toolUsage", { count: usageCount })}</Badge>
          </div>
      </header>

      <div className={`grid gap-4 ${stackedLayout ? "" : "lg:grid-cols-2"}`}>
        <div className="grid gap-3">
          {!inputless ? (
            <>
              {colorTool ? (
                <ColorInputs slug={tool.slug} value={input} onChange={setInput} hasError={Boolean(error)} />
              ) : (
                <>
                  <label className="text-sm font-medium" htmlFor="tool-input">{t("input")}</label>
                  <Textarea
                    id="tool-input"
                    aria-describedby={error ? "tool-error" : "tool-privacy"}
                    aria-invalid={Boolean(error)}
                    className={`${inputHeight} ${monospaceInput ? "font-mono" : "font-sans"}`}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={example || "按 Generate 執行，或載入安全範例。"}
                  />
                </>
              )}
              <ToolOptions tool={tool} options={options} onChange={setOptions} />
            </>
          ) : secretGenerator ? (
            <SecretGeneratorOptions options={options} onChange={setOptions} />
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => run()} disabled={running || (!inputless && !input.trim())}>
              <Play size={16} /> {action(tool.actions[0] ?? "convert")}
            </Button>
            {!inputless ? <Button
              variant="outline"
              type="button"
              onClick={() => {
                setInput(example);
                setError(null);
              }}
            >
              <Wand2 size={16} /> {t("example")}
            </Button> : null}
            <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
              <AlertDialogTrigger render={<Button variant="outline" type="button" disabled={!input && !result && !error} />}>
                <RotateCcw size={16} /> {t("clear")}
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-destructive/10 text-destructive"><Trash2 /></AlertDialogMedia>
                  <AlertDialogTitle>{t("clearTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("clearDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => {
                    clear();
                    setClearDialogOpen(false);
                  }}>{t("clear")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {DOWNLOADABLE_SLUGS.has(tool.slug) ? <Button variant="outline" type="button" onClick={download} disabled={!result?.ok}>
              <Download size={16} /> {t("download")}
            </Button> : null}
          </div>
          <p id="tool-privacy" className="text-sm text-muted-foreground">{t("privacy")}</p>
        </div>

        <div className="grid content-start gap-3">
          {!stackedLayout ? <span className="text-sm font-medium">{t("output")}</span> : null}
          {error ? <ToolErrorAlert error={error} tool={tool} /> : null}
          {result ? (
            <>
              {tool.category !== "color" && !VALIDATOR_SLUGS.has(tool.slug) && (tool.slug === "hash-generator" || Boolean(result.warnings?.length)) ? <Alert>
                <AlertTitle>{locale === "en" ? t("completed", { name: localizedName }) : result.summary}</AlertTitle>
                <AlertDescription>
                {result.warnings?.map((warning) => (
                  <p key={warning}>{locale === "en" ? t("warning") : warning}</p>
                ))}
                </AlertDescription>
              </Alert> : null}
              <ResultDisplay input={input} result={result} tool={tool} inputless={inputless} />
            </>
          ) : (
            <Empty className={`${stackedLayout ? "min-h-40 p-6" : inputHeight} border`}>
              <EmptyHeader>
                <EmptyMedia variant="icon"><FileOutput /></EmptyMedia>
                <EmptyTitle>{error ? t("noOutput") : t("waiting")}</EmptyTitle>
                <EmptyDescription>{error ? t("fixAndRetry") : t("waitingDescription")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </section>
  );
}

function ResultDisplay({ input, result, tool, inputless }: { input: string; result: ToolResult; tool: ToolDefinition; inputless: boolean }) {
  if (tool.category === "color") return <ColorResultItems input={input} output={result.output} slug={tool.slug} />;
  if (VALIDATOR_SLUGS.has(tool.slug)) return <ValidatorResult result={result} tool={tool} />;
  if (CODE_RESULT_SLUGS.has(tool.slug)) return <CodeBlock code={result.output} language={result.language} compact={inputless} large={LARGE_INPUT_SLUGS.has(tool.slug)} />;
  return <TextResultItems output={result.output} singleValue={SINGLE_VALUE_SLUGS.has(tool.slug)} />;
}

function ValidatorResult({ result, tool }: { result: ToolResult; tool: ToolDefinition }) {
  const locale = useLocale();
  const t = useTranslations("workbench");
  const language = tool.inputLanguage.toUpperCase();
  const rootType = /Root type:\s*(\w+)/.exec(result.output)?.[1];
  const localizedRootType = locale === "zh-TW"
    ? rootType?.replace(/^object$/, "物件").replace(/^array$/, "陣列").replace(/^string$/, "字串").replace(/^number$/, "數字").replace(/^boolean$/, "布林值").replace(/^null$/, "null")
    : rootType;

  return (
    <Alert>
      <CircleCheck />
      <AlertTitle>{locale === "en" ? t("validSyntax", { language }) : result.summary}</AlertTitle>
      {(localizedRootType || result.warnings?.length) ? <AlertDescription className="flex flex-wrap items-center gap-2">
        {localizedRootType ? <Badge variant="secondary">{t("resultLabel.rootType")}：{localizedRootType}</Badge> : null}
        {result.warnings?.map((warning) => <span key={warning}>{locale === "en" ? t("warning") : warning}</span>)}
      </AlertDescription> : null}
    </Alert>
  );
}

const RESULT_LABEL_KEYS: Record<string, string> = {
  "Root type": "rootType", "Detected unit": "detectedUnit", "UTC": "utc", "Local": "local", "Local timezone": "localTimezone",
  "Seconds": "seconds", "Milliseconds": "milliseconds", "IANA zone": "ianaZone", "UTC offset": "utcOffset", "Local time": "localTime",
  "Status": "status", "Words": "words", "Characters": "characters", "Graphemes": "graphemes", "UTF-8 bytes": "bytes", "Lines": "lines"
};

function TextResultItems({ output, singleValue }: { output: string; singleValue: boolean }) {
  const locale = useLocale();
  const t = useTranslations("workbench");
  if (singleValue) {
    return (
      <Item aria-label={t("output")} variant="outline" size="sm">
        <ItemContent className="min-w-0">
          <p className="whitespace-pre-wrap break-all font-mono text-sm text-foreground">{output}</p>
        </ItemContent>
        <ItemActions><CopyValueButton label={t("output")} value={output} /></ItemActions>
      </Item>
    );
  }

  const rows = output.split("\n").filter(Boolean).map((line) => {
    const separator = line.indexOf(":");
    const name = separator >= 0 ? line.slice(0, separator) : t("result");
    let value = separator >= 0 ? line.slice(separator + 1).trim() : line;
    if (locale === "zh-TW") {
      value = value
        .replace(/^active$/, "有效").replace(/^expired$/, "已過期").replace(/^not yet valid$/, "尚未生效").replace(/^unknown$/, "未知")
        .replace(/^seconds$/, "秒").replace(/^milliseconds$/, "毫秒").replace(/^object$/, "物件").replace(/^array$/, "陣列")
        .replace(/^Valid JSON$/, "JSON 語法有效").replace(/^Valid YAML$/, "YAML 語法有效").replace(/^Valid INI-style \.conf$/, "INI / .conf 語法有效")
        .replace(/^Decode 不代表簽章有效。$/, "解碼結果不代表簽章有效。");
    }
    const key = RESULT_LABEL_KEYS[name];
    return { name: key ? t(`resultLabel.${key}`) : name, value };
  });

  return (
    <ItemGroup className="grid gap-2">
      {rows.map((row, index) => (
        <Item key={`${row.name}-${index}`} variant="outline" size="sm">
          <ItemContent className="min-w-0"><ItemTitle>{row.name}</ItemTitle><p className="whitespace-pre-wrap break-all font-mono text-sm text-foreground">{row.value}</p></ItemContent>
          <ItemActions><CopyValueButton label={row.name} value={row.value} /></ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

function CopyValueButton({ label, value }: { label: string; value: string }) {
  const t = useTranslations("workbench");
  return <Button aria-label={t("copyValue", { name: label })} title={t("copyValue", { name: label })} size="icon-sm" type="button" variant="ghost" onClick={() => navigator.clipboard.writeText(value)}><Copy /></Button>;
}

const COLOR_RESULT_KEYS: Record<string, string> = {
  "HEX": "hex", "RGB(A)": "rgb", "HSL(A)": "hsl", "HSV / HSB": "hsv", "HWB": "hwb", "CMYK": "cmyk",
  "CIE LAB D65": "lab", "CIE LCH D65": "lch", "OKLab": "oklab", "OKLCH": "oklch", "XYZ D65": "xyz65", "XYZ D50": "xyz50",
  "Ratio": "ratio", "Normal AA": "normalAa", "Normal AAA": "normalAaa", "Large AA": "largeAa", "Large AAA": "largeAaa",
  "Base": "base", "Complementary": "complementary", "Analogous -30": "analogousMinus", "Analogous +30": "analogousPlus",
  "Triadic A": "triadicA", "Triadic B": "triadicB", "Tetradic A": "tetradicA", "Tetradic B": "tetradicB", "Monochromatic light": "monochromaticLight"
};

function ColorResultItems({ input, output, slug }: { input: string; output: string; slug: string }) {
  const locale = useLocale();
  const t = useTranslations("workbench");
  const rows = output.split("\n").map((line) => {
    const separator = line.indexOf(":");
    const name = separator >= 0 ? line.slice(0, separator) : line;
    let value = separator >= 0 ? line.slice(separator + 1).trim() : "";
    if (locale === "en") value = value.replace("裝置無關近似值", "device-independent approximation").replace(/^pass$/, "Pass").replace(/^fail$/, "Fail");
    else value = value.replace(/^pass$/, "通過").replace(/^fail$/, "未通過");
    return { name, value, key: COLOR_RESULT_KEYS[name] };
  });

  if (slug === "contrast-checker") {
    const [foreground, background] = input.split("\n").map((value) => value.trim());
    const ratio = rows.find((row) => row.key === "ratio");
    const checks = rows.filter((row) => row.key !== "ratio");
    return (
      <div className="grid gap-3">
        <Item variant="outline">
          <ItemMedia variant="icon"><span className="size-5 rounded-sm border" style={{ background: `linear-gradient(135deg, ${foreground} 50%, ${background} 50%)` }} /></ItemMedia>
          <ItemContent>
            <ItemTitle>{t("colorResult.label.ratio")}</ItemTitle>
            <ItemDescription>{t("colorResult.explanation.ratio")}</ItemDescription>
            <p className="font-mono text-2xl font-semibold text-foreground">{ratio?.value}</p>
          </ItemContent>
          {ratio ? <ItemActions><Button aria-label={t("copyValue", { name: t("colorResult.label.ratio") })} title={t("copyValue", { name: t("colorResult.label.ratio") })} size="icon-sm" variant="ghost" onClick={() => navigator.clipboard.writeText(ratio.value)}><Copy /></Button></ItemActions> : null}
        </Item>
        <Item variant="outline" style={{ backgroundColor: background, color: foreground }}>
          <ItemContent className="items-center text-center">
            <ItemTitle className="text-inherit">{t("contrastPreview")}</ItemTitle>
            <p className="text-lg font-semibold">Aa {t("sampleText")}</p>
          </ItemContent>
        </Item>
        <ItemGroup className="grid gap-2 sm:grid-cols-2">
          {checks.map((row) => {
            const title = row.key ? t(`colorResult.label.${row.key}`) : row.name;
            const passed = /^(pass|通過)$/i.test(row.value);
            return (
              <Item key={row.name} variant="outline" size="sm">
                <ItemContent><ItemTitle>{title}</ItemTitle><ItemDescription>{row.key ? t(`colorResult.explanation.${row.key}`) : ""}</ItemDescription></ItemContent>
                <ItemActions><Badge variant={passed ? "default" : "destructive"}>{row.value}</Badge></ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </div>
    );
  }

  return (
    <ItemGroup className="grid gap-2">
      {rows.map((row) => {
        const title = row.key ? t(`colorResult.label.${row.key}`) : row.name;
        const explanation = row.key ? t(`colorResult.explanation.${row.key}`) : "";
        const swatch = /^#[0-9A-F]{6,8}$/i.test(row.value) ? row.value : null;
        return (
          <Item key={row.name} variant="outline" size="sm">
            {swatch ? <ItemMedia variant="icon"><span className="size-5 rounded-sm border" style={{ backgroundColor: swatch }} /></ItemMedia> : null}
            <ItemContent className="min-w-0">
              <ItemTitle>{title}</ItemTitle>
              {explanation ? <ItemDescription>{explanation}</ItemDescription> : null}
              <p className="break-all font-mono text-sm text-foreground">{row.value}</p>
            </ItemContent>
            <ItemActions>
              <Button
                aria-label={t("copyValue", { name: title })}
                title={t("copyValue", { name: title })}
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => navigator.clipboard.writeText(row.value)}
              >
                <Copy />
              </Button>
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}

function ToolErrorAlert({ error, tool }: { error: ToolFailure; tool: ToolDefinition }) {
  const locale = useLocale();
  const t = useTranslations("workbench");
  const toolName = useTranslations("toolName");
  const locationParts = [error.line ? t("line", { value: error.line }) : null, error.column ? t("column", { value: error.column }) : null].filter(Boolean);
  const location = locationParts.length ? t("location", { location: locationParts.join(", ") }) : null;
  return (
    <Alert id="tool-error" variant="destructive">
      <AlertTriangle />
      <AlertTitle>{t("errorTitle")}</AlertTitle>
      <AlertDescription>
        <p>{locale === "en" ? t("invalidInput") : error.message}</p>
        {location ? <p className="mt-1">{location}</p> : null}
        <Dialog>
          <DialogTrigger render={<Button className="mt-2 px-0" variant="link" size="sm" />}>{t("errorHelp")}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("inputHelp", { name: toolName(tool.slug) })}</DialogTitle>
              <DialogDescription>{t("inputStandard", { language: tool.inputLanguage.toUpperCase() })}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 text-sm">
              <p>{locale === "en" ? t("invalidInputDetail") : error.message}</p>
              {tool.slug.startsWith("json-") ? <p>{t("jsonHelp", { example: '{"test": 1}' })}</p> : null}
            </div>
          </DialogContent>
        </Dialog>
      </AlertDescription>
    </Alert>
  );
}

function SecretGeneratorOptions({ options, onChange }: { options: ToolOptions; onChange: (value: ToolOptions) => void }) {
  const t = useTranslations("workbench");
  const bytes = options.bytes ?? 32;
  const setBytes = (value: number) => onChange({ ...options, bytes: value });
  return (
    <div className="grid gap-5 py-2">
      <div className="grid gap-2">
        <span className="text-sm font-medium">{t("quickPresets")}</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {[16, 24, 32, 48, 64].map((value) => (
            <Button key={value} type="button" variant={bytes === value ? "default" : "outline"} onClick={() => setBytes(value)}>{value * 8}</Button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 border-y py-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">{t("strength")}</span>
          <Badge variant="secondary">{t("bits", { count: bytes * 8 })}</Badge>
        </div>
        <Slider min={16} max={128} step={1} value={[bytes]} onValueChange={(value) => setBytes(typeof value === "number" ? value : value[0] ?? 32)} aria-label={t("strength")} />
        <div className="flex justify-between text-xs text-muted-foreground"><span>128</span><span>512</span><span>1024</span></div>
      </div>
      <OptionSelect label={t("outputFormat")} value={options.outputEncoding ?? "base64url"} onValueChange={(value) => onChange({ ...options, outputEncoding: value })} items={[["base64url", "Base64URL"], ["base64", "Base64"], ["hex", "HEX"]]} />
    </div>
  );
}

function ToolOptions({ tool, options, onChange }: { tool: ToolDefinition; options: ToolOptions; onChange: (value: ToolOptions) => void }) {
  const t = useTranslations("workbench");
  const set = (next: Partial<ToolOptions>) => onChange({ ...options, ...next });
  if (tool.slug === "code-formatter" || tool.slug === "code-minifier") {
    const languages = tool.slug === "code-formatter" ? CODE_FORMAT_LANGUAGES : CODE_MINIFY_LANGUAGES;
    const labels: Record<string, string> = { javascript: "JavaScript", typescript: "TypeScript", json: "JSON", html: "HTML", css: "CSS", markdown: "Markdown", yaml: "YAML", python: "Python", java: "Java", c: "C", cpp: "C++", csharp: "C#", go: "Go", rust: "Rust", sql: "SQL", shell: "Shell" };
    return <OptionSelect label={t("codeLanguage")} value={options.codeLanguage ?? "javascript"} onValueChange={(value) => set({ codeLanguage: value })} items={languages.map((language) => [language, labels[language]])} />;
  }
  if (tool.slug === "json-formatter" || tool.slug === "json-sort-keys") {
    return <OptionSelect label={t("indent")} value={options.indent ?? "2"} onValueChange={(value) => set({ indent: value as ToolOptions["indent"] })} items={[["2", "2 spaces"], ["4", "4 spaces"], ["tab", "Tab"]]} />;
  }
  if (tool.slug.startsWith("base64-")) {
    return <OptionSelect label={t("base64Mode")} value={options.mode === "base64url" ? "base64url" : "standard"} onValueChange={(value) => set({ mode: value === "base64url" ? "base64url" : "standard" })} items={[["standard", "Standard Base64"], ["base64url", "Base64URL"]]} />;
  }
  if (tool.slug.startsWith("url-")) {
    return <OptionSelect label={t("urlMode")} value={options.mode === "url" ? "url" : "component"} onValueChange={(value) => set({ mode: value })} items={[["component", "URL component"], ["url", t("fullUrl")]]} />;
  }
  if (tool.slug === "hmac-generator") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium">HMAC secret<Input className="font-mono" type="password" value={options.secret ?? ""} onInput={(event) => set({ secret: event.currentTarget.value })} /></label>
        <OptionSelect label={t("secretEncoding")} value={options.keyEncoding ?? "utf8"} onValueChange={(value) => set({ keyEncoding: value })} items={[["utf8", "UTF-8"], ["hex", "HEX"], ["base64", "Base64"]]} />
        <OptionSelect label={t("outputFormat")} value={options.outputEncoding ?? "hex"} onValueChange={(value) => set({ outputEncoding: value })} items={[["hex", "HEX"], ["base64", "Base64"]]} />
      </div>
    );
  }
  return null;
}

function OptionSelect({ label, value, onValueChange, items }: { label: string; value: string; onValueChange: (value: string) => void; items: [string, string][] }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <Select value={value} onValueChange={(next) => next && onValueChange(next)}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>{items.map(([itemValue, text]) => <SelectItem key={itemValue} value={itemValue}>{text}</SelectItem>)}</SelectContent>
      </Select>
    </label>
  );
}
