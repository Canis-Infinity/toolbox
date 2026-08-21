import type { ToolCategory, ToolDefinition } from "./types";

export const categories: Record<ToolCategory, { name: string; description: string }> = {
  json: {
    name: "JSON Tools",
    description: "格式化、驗證、排序、escape 與 TypeScript 型別推斷。"
  },
  "structured-data": {
    name: "Structured Data",
    description: "YAML、INI 與 Nginx 設定檔的格式化與驗證。"
  },
  encoding: {
    name: "Encoding",
    description: "Base64、URL、HTML Entity 與 Unicode escape 編解碼。"
  },
  color: {
    name: "Color",
    description: "色彩轉換、對比、調整與調色盤。"
  },
  jwt: {
    name: "JWT",
    description: "只在本機 decode JWT、檢查時間欄位與產生 secret。"
  },
  hash: {
    name: "Hash / Crypto",
    description: "Hash、HMAC 與隨機 secret 產生器。"
  },
  datetime: {
    name: "Date / Time",
    description: "Unix timestamp、ISO date 與時區顯示。"
  },
  code: {
    name: "Code",
    description: "格式化常見程式語言，並壓縮適合部署的程式碼。"
  },
  text: {
    name: "Text",
    description: "大小寫、slug、字數與 UUID 工具。"
  }
};

const examples = {
  json: '{\n  "name": "Developer Tools",\n  "features": ["private", "copy", "download"],\n  "count": 3\n}',
  yaml: "name: Developer Tools\nfeatures:\n  - private\n  - offline\n",
  ini: "; app config\n[server]\nport=6011\nhost = localhost\n",
  nginx: "server {\nlisten 80;\nserver_name toolbox.iistw.com;\nlocation / {\nproxy_pass http://127.0.0.1:6011;\n}\n}\n",
  text: "Infinity developer tools",
  color: "#3B82F6",
  jwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vIiwiZXhwIjoxODkzNDU2MDAwfQ.signature"
} as const;

export const tools: ToolDefinition[] = [
  tool("json-formatter", "JSON Formatter", "在瀏覽器本機格式化 JSON，支援縮排選項與行號。", "json", ["format"], "json", "json", examples.json, ["pretty json", "json format"], 100),
  tool("json-minify", "JSON Minify", "壓縮 JSON 並保留原始資料語意。", "json", ["format"], "json", "json", examples.json, ["compact json"], 99),
  tool("json-validator", "JSON Validator", "驗證 RFC 8259 JSON 並顯示根節點型別。", "json", ["validate"], "json", "text", examples.json, ["json lint"], 98),
  tool("json-sort-keys", "JSON Sort Keys", "遞迴排序 object key，array 順序不變。", "json", ["format"], "json", "json", examples.json, ["sort json"], 97),
  tool("json-escape", "JSON Escape", "將純文字轉成 JSON string content。", "json", ["convert"], "text", "text", 'Line 1\n"quoted"', ["escape string"], 96),
  tool("json-unescape", "JSON Unescape", "解析 JSON string literal 或 escaped content。", "json", ["convert"], "text", "text", '\\"hello\\nworld\\"', ["unescape string"], 95),
  tool("json-to-typescript", "JSON to TypeScript", "從 JSON 推斷 TypeScript interface，無法推斷時使用 unknown。", "json", ["convert"], "json", "typescript", examples.json, ["json types"], 94),
  tool("yaml-formatter", "YAML Formatter", "格式化 YAML 文件並保留常見資料結構。", "structured-data", ["format"], "yaml", "yaml", examples.yaml, ["yaml pretty"], 90),
  tool("yaml-validator", "YAML Validator", "驗證 YAML 語法並回報錯誤位置。", "structured-data", ["validate"], "yaml", "text", examples.yaml, ["yaml lint"], 89),
  tool("yaml-to-json", "YAML to JSON", "將可安全表示為 JSON 的 YAML 轉成 JSON。", "structured-data", ["convert"], "yaml", "json", examples.yaml, ["convert yaml"], 88),
  tool("json-to-yaml", "JSON to YAML", "將 JSON 轉成 YAML，保留 array 與 object 順序。", "structured-data", ["convert"], "json", "yaml", examples.json, ["convert json yaml"], 87),
  tool("ini-conf-formatter", "INI / .conf Formatter", "格式化 INI-style .conf，保留 comments 與 section order。", "structured-data", ["format"], "ini", "ini", examples.ini, ["ini format"], 86),
  tool("ini-conf-validator", "INI / .conf Validator", "驗證 INI-style .conf，不混同 Nginx 或 Apache。", "structured-data", ["validate"], "ini", "text", examples.ini, ["ini lint"], 85),
  tool("nginx-conf-formatter", "Nginx CONF Formatter", "格式化 Nginx directives、巢狀 blocks 與 comments。", "structured-data", ["format"], "nginx", "nginx", examples.nginx, ["nginx format"], 84),
  tool("base64-encode", "Base64 Encode", "以 UTF-8 進行 standard Base64 或 Base64URL 編碼。", "encoding", ["encode"], "text", "text", "哈囉 Developer Tools", ["b64 encode"], 80),
  tool("base64-decode", "Base64 Decode", "驗證 Base64 alphabet 與 padding 後解碼 UTF-8。", "encoding", ["decode"], "text", "text", "5ZOI5ZuJIERldmVsb3BlciBUb29scw==", ["b64 decode"], 79),
  tool("url-encode", "URL Encode", "支援 component 與完整 URL 模式。", "encoding", ["encode"], "text", "text", "a value with spaces & symbols", ["percent encode"], 78),
  tool("url-decode", "URL Decode", "解碼 URL percent encoding，malformed input 會報錯。", "encoding", ["decode"], "text", "text", "a%20value%20with%20spaces%20%26%20symbols", ["percent decode"], 77),
  tool("html-entity-encode", "HTML Entity Encode", "編碼 HTML 必要字元並以純文字輸出。", "encoding", ["encode"], "html", "text", '<span title="demo">&</span>', ["html escape"], 76),
  tool("html-entity-decode", "HTML Entity Decode", "解碼 HTML entity，但不把結果插入 DOM。", "encoding", ["decode"], "text", "text", "&#x3C;strong&#x3E;safe&#x3C;/strong&#x3E;", ["html unescape"], 75),
  tool("unicode-escape", "Unicode Escape", "將文字轉成 \\uXXXX / surrogate pair escape。", "encoding", ["encode"], "text", "text", "測試🙂", ["unicode encode"], 74),
  tool("unicode-unescape", "Unicode Unescape", "解析 \\uXXXX 與 surrogate pair escape。", "encoding", ["decode"], "text", "text", "\\u6e2c\\u8a66\\ud83d\\ude42", ["unicode decode"], 73),
  tool("color-converter", "Universal Color Converter", "輸入 CSS 色彩並列出 HEX、RGB、HSL、OKLCH、XYZ 等格式。", "color", ["convert"], "css", "text", examples.color, ["hex rgb hsl"], 70),
  tool("contrast-checker", "Contrast Checker", "計算前景與背景色 WCAG 對比。", "color", ["convert"], "css", "text", "#111827\n#FFFFFF", ["wcag contrast"], 69),
  tool("palette-generator", "Palette Generator", "產生互補色、相鄰色、三角色、四角色與同色系調色盤。", "color", ["convert"], "css", "text", examples.color, ["color palette"], 68),
  tool("jwt-decoder", "JWT Decoder", "只 decode JWT header/payload，始終提醒 decode 不代表簽章有效。", "jwt", ["decode"], "jwt", "json", examples.jwt, ["jwt payload"], 65),
  tool("jwt-expiration-checker", "JWT Expiration Checker", "解析 exp、nbf、iat NumericDate 並顯示 UTC 與本地時間。", "jwt", ["decode"], "jwt", "text", examples.jwt, ["jwt exp"], 64),
  tool("jwt-secret-generator", "JWT Secret Generator", "使用 crypto.getRandomValues 產生至少 32 bytes secret。", "jwt", ["generate"], "text", "text", "", ["jwt secret"], 63),
  tool("hash-generator", "Hash Generator", "產生 MD5、SHA-1、SHA-256、SHA-384、SHA-512。", "hash", ["hash"], "text", "text", examples.text, ["sha md5"], 60),
  tool("hmac-generator", "HMAC Generator", "以明確 key encoding 產生 HMAC SHA-256 與 SHA-512。", "hash", ["hash"], "text", "text", examples.text, ["hmac"], 59),
  tool("random-secret-generator", "Random Secret Generator", "使用 Web Crypto 產生 Base64URL、Base64 或 HEX secret。", "hash", ["generate"], "text", "text", "", ["secret random"], 58),
  tool("unix-to-date", "Unix Timestamp to Date", "明確切換 seconds / milliseconds 並顯示 UTC 與本地時間。", "datetime", ["convert"], "text", "text", "1893456000", ["timestamp"], 55),
  tool("date-to-unix", "Date to Unix Timestamp", "將 ISO date 轉成 seconds 與 milliseconds。", "datetime", ["convert"], "text", "text", "2030-01-01T00:00:00+08:00", ["date unix"], 54),
  tool("iso-date-formatter", "ISO Date Formatter", "驗證 ISO 8601，顯示原 offset、UTC 與本地格式。", "datetime", ["convert"], "text", "text", "2030-01-01T00:00:00+08:00", ["iso date"], 53),
  tool("timezone-display", "Timezone Display", "使用 Intl 顯示 IANA zone、UTC offset 與本地時間。", "datetime", ["convert"], "text", "text", "", ["timezone"], 52),
  tool("code-formatter", "Code Formatter", "格式化 JavaScript、TypeScript、Python、Java、C、C++、C#、Go、Rust、SQL、Shell 與常見資料格式。", "code", ["format"], "code", "code", "function greet(name){console.log(`Hello, ${name}!`)}", ["prettier", "ruff", "clang format", "gofmt", "rustfmt", "shfmt"], 51),
  tool("code-minifier", "Code Minifier", "壓縮 JavaScript、JSON、CSS 與 HTML，移除部署時不必要的內容。", "code", ["minify"], "code", "code", "function greet(name){ console.log(`Hello, ${name}!`); }", ["minify", "terser", "csso", "html minifier"], 50),
  tool("case-converter", "Case Converter", "輸出 camel、Pascal、snake、kebab、CONSTANT、Title 與 Sentence case。", "text", ["convert"], "text", "text", examples.text, ["camel snake kebab"], 50),
  tool("slug-generator", "Slug Generator", "產生 lowercase hyphen slug，保留可讀 ASCII。", "text", ["convert"], "text", "text", "Infinity Developer Tools 測試", ["seo slug"], 49),
  tool("word-character-counter", "Word / Character / Byte Counter", "統計字數、字元、grapheme、UTF-8 bytes 與行數。", "text", ["convert"], "text", "text", "Hello 世界\nDeveloper Tools", ["word count"], 48),
  tool("uuid-generator", "UUID Generator", "使用 crypto.randomUUID 產生 UUID v4。", "text", ["generate"], "text", "text", "", ["uuid v4"], 47)
];

function tool(
  slug: string,
  name: string,
  description: string,
  category: ToolCategory,
  actions: ToolDefinition["actions"],
  inputLanguage: string,
  outputLanguage: string,
  example: string,
  aliases: string[],
  priority: number
): ToolDefinition {
  return {
    slug,
    name,
    description,
    category,
    tags: [category, ...aliases],
    aliases,
    priority,
    localOnly: true,
    actions,
    inputLanguage,
    outputLanguage,
    example,
    countUsage: true
  };
}

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((toolDefinition) => toolDefinition.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools
    .filter((toolDefinition) => toolDefinition.category === category)
    .sort((left, right) => right.priority - left.priority);
}
