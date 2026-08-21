import { describe, expect, it } from "vitest";
import { tools } from "@/lib/tools/registry";
import { executeTool } from "@/lib/tools/execute";

const expectedOutput: Record<string, RegExp> = {
  "json-formatter": /\n  "features"/,
  "json-minify": /^\{"name"/,
  "json-validator": /Valid JSON/,
  "json-sort-keys": /"count"/,
  "json-escape": /Line 1/,
  "json-unescape": /hello/,
  "json-to-typescript": /export type Root/,
  "yaml-formatter": /name:/,
  "yaml-validator": /Valid YAML/,
  "yaml-to-json": /"features"/,
  "json-to-yaml": /features:/,
  "ini-conf-formatter": /port = localhost|port = 6011/,
  "ini-conf-validator": /Valid/,
  "nginx-conf-formatter": /server \{/,
  "base64-encode": /^[A-Za-z0-9+/]+={0,2}$/,
  "base64-decode": /哈囉/,
  "url-encode": /%20/,
  "url-decode": /spaces & symbols/,
  "html-entity-encode": /&lt;/,
  "html-entity-decode": /<strong>/,
  "unicode-escape": /\\u6e2c/,
  "unicode-unescape": /測試/,
  "color-converter": /OKLCH:/,
  "contrast-checker": /Ratio:/,
  "palette-generator": /Complementary:/,
  "jwt-decoder": /"payload"/,
  "jwt-expiration-checker": /Status:/,
  "jwt-secret-generator": /^[A-Za-z0-9_-]{40,}$/,
  "hash-generator": /SHA-256:/,
  "hmac-generator": /HMAC SHA-512:/,
  "random-secret-generator": /^[A-Za-z0-9_-]{40,}$/,
  "unix-to-date": /UTC:/,
  "date-to-unix": /Milliseconds:/,
  "iso-date-formatter": /Local timezone:/,
  "timezone-display": /IANA zone:/,
  "code-formatter": /function greet\(name\) \{/,
  "code-minifier": /^function greet\(./,
  "case-converter": /camelCase:/,
  "slug-generator": /infinity-developer-tools/,
  "word-character-counter": /UTF-8 bytes:/,
  "uuid-generator": /^00000000-0000-4000-8000-000000000000$/
};

const invalidInput: Record<string, string> = {
  "json-formatter": "{bad}",
  "json-minify": "{",
  "json-validator": "[1,]",
  "json-sort-keys": "undefined",
  "json-escape": "",
  "json-unescape": "\\q",
  "json-to-typescript": "{bad}",
  "yaml-formatter": "key: [",
  "yaml-validator": "key: [",
  "yaml-to-json": "key: [",
  "json-to-yaml": "{bad}",
  "ini-conf-formatter": "not a pair",
  "ini-conf-validator": "[broken",
  "nginx-conf-formatter": "server { listen 80;",
  "base64-encode": "",
  "base64-decode": "%%%",
  "url-encode": "",
  "url-decode": "%ZZ",
  "html-entity-encode": "",
  "html-entity-decode": "",
  "unicode-escape": "",
  "unicode-unescape": "\\uZZZZ",
  "color-converter": "not-a-color",
  "contrast-checker": "#fff",
  "palette-generator": "transparent",
  "jwt-decoder": "not.a.jwt.extra",
  "jwt-expiration-checker": "abc.def.ghi",
  "hash-generator": "",
  "hmac-generator": "message",
  "unix-to-date": "12.5",
  "date-to-unix": "2024-02-31T00:00:00Z",
  "iso-date-formatter": "03/04/2024",
  "code-formatter": "function {",
  "code-minifier": "function {",
  "case-converter": "",
  "slug-generator": "",
  "word-character-counter": ""
};

const noInvalidInput = new Set(["jwt-secret-generator", "random-secret-generator", "timezone-display", "uuid-generator"]);

Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (array: Uint8Array) => {
      array.fill(7);
      return array;
    },
    randomUUID: () => "00000000-0000-4000-8000-000000000000"
  }
});

describe("registered tools", () => {
  it("has unique slugs and local-only metadata", () => {
    expect(new Set(tools.map((tool) => tool.slug)).size).toBe(tools.length);
    expect(tools.every((tool) => tool.localOnly && tool.countUsage)).toBe(true);
  });

  it("requires an explicit expected-output test for every registered tool", () => {
    expect(Object.keys(expectedOutput).sort()).toEqual(tools.map((tool) => tool.slug).sort());
  });

  it("requires an invalid-input test or explicit N/A classification for every tool", () => {
    expect([...Object.keys(invalidInput), ...noInvalidInput].sort()).toEqual(tools.map((tool) => tool.slug).sort());
  });
});

describe("tool execution", () => {
  it.each(tools.map((tool) => [tool.slug, tool.example || "Developer Tools"] as const))("%s returns its expected output for a normal input", async (slug, example) => {
    const result = await executeTool(slug, example, { secret: "secret", bytes: 32 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toMatch(expectedOutput[slug]);
  });

  it.each(Object.entries(invalidInput))("%s returns a structured failure for invalid input", async (slug, input) => {
    const result = await executeTool(slug, input, { secret: "", bytes: 32 });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.message.length).toBeGreaterThan(5);
  });

  it.each([...noInvalidInput])("%s has no syntax-invalid input and handles its boundary invocation", async (slug) => {
    const result = await executeTool(slug, "", { bytes: 32 });
    expect(result.ok).toBe(true);
  });

  it("formats JSON", async () => {
    const result = await executeTool("json-formatter", '{"b":1,"a":[true]}');
    expect(result).toMatchObject({ ok: true, language: "json" });
    if (result.ok) expect(result.output).toContain('"a"');
  });

  it("rejects invalid JSON", async () => {
    const result = await executeTool("json-validator", "{bad");
    expect(result.ok).toBe(false);
  });

  it.each([
    ["trailing comma", '{"name":"Developer Tools","features":["local-first","copy","download"],}'],
    ["missing property quotes", "{test: 1, enabled: true}"]
  ])("repairs %s before formatting JSON", async (_case, input) => {
    const result = await executeTool("json-formatter", input);
    expect(result).toMatchObject({ ok: true, summary: "JSON 已修復並格式化。" });
    if (result.ok) {
      expect(() => JSON.parse(result.output)).not.toThrow();
      expect(result.output).not.toMatch(/,\s*[}\]]/);
      expect(result.output).toMatch(/"(?:test|name)"/);
    }
  });

  it("honors all JSON indentation options and is idempotent", async () => {
    for (const indent of ["2", "4", "tab"] as const) {
      const first = await executeTool("json-formatter", '{"a":{"b":1}}', { indent });
      expect(first.ok).toBe(true);
      if (!first.ok) continue;
      const second = await executeTool("json-formatter", first.output, { indent });
      expect(second).toMatchObject({ ok: true, output: first.output });
    }
  });

  it("rejects malformed HMAC key encodings without throwing", async () => {
    await expect(executeTool("hmac-generator", "message", { secret: "xyz", keyEncoding: "hex" })).resolves.toMatchObject({ ok: false });
    await expect(executeTool("hmac-generator", "message", { secret: "%%%", keyEncoding: "base64" })).resolves.toMatchObject({ ok: false });
  });

  it("rejects invalid calendar rollover and malformed unicode escapes", async () => {
    await expect(executeTool("date-to-unix", "2024-02-31T00:00:00Z")).resolves.toMatchObject({ ok: false });
    await expect(executeTool("unicode-unescape", "\\uZZZZ")).resolves.toMatchObject({ ok: false });
  });

  it("rejects out-of-range RGB channels instead of silently clamping them", async () => {
    await expect(executeTool("color-converter", "rgb(300 0 0)")).resolves.toMatchObject({ ok: false });
    await expect(executeTool("contrast-checker", "rgb(0 0 0)\nrgb(0 0 0 / 2)")).resolves.toMatchObject({ ok: false });
  });

  it("supports each documented HMAC output encoding", async () => {
    for (const outputEncoding of ["hex", "base64"]) {
      const result = await executeTool("hmac-generator", "message", { secret: "secret", outputEncoding });
      expect(result).toMatchObject({ ok: true });
    }
  });

  it("enforces secret generator boundaries", async () => {
    await expect(executeTool("random-secret-generator", "", { bytes: 15 })).resolves.toMatchObject({ ok: false });
    await expect(executeTool("jwt-secret-generator", "", { bytes: 129 })).resolves.toMatchObject({ ok: false });
  });

  it("round-trips Base64 unicode", async () => {
    const encoded = await executeTool("base64-encode", "哈囉");
    expect(encoded.ok).toBe(true);
    if (!encoded.ok) return;
    const decoded = await executeTool("base64-decode", encoded.output);
    expect(decoded).toMatchObject({ ok: true, output: "哈囉" });
  });

  it("decodes JWT with warning", async () => {
    const result = await executeTool("jwt-decoder", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.summary).toContain("Decode 不代表");
  });

  it("counts text bytes and lines", async () => {
    const result = await executeTool("word-character-counter", "Hello 世界\nTools");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.output).toContain("UTF-8 bytes");
  });

  it.each([
    ["javascript", "function add(a,b){return a+b}", /function add\(a, b\)/],
    ["typescript", "type User={name:string;active:boolean}", /type User =/],
    ["json", '{"name":"Infinity","active":true}', /"name": "Infinity"/],
    ["html", "<main><h1>Tools</h1><p>Local</p></main>", /<h1>Tools<\/h1>/],
    ["css", ".box{display:grid;color:red}", /display: grid/],
    ["markdown", "# Tools\n- local\n- private", /- local/],
    ["yaml", "name: Tools\nitems:\n- one", /items:/],
    ["python", "def add(a,b):\n return a+b", /def add\(a, b\):/],
    ["java", "class Main{public static void main(String[]args){}}", /class Main \{/],
    ["c", "int main(){return 0;}", /int main\(\)/],
    ["cpp", "int main(){return 0;}", /int main\(\)/],
    ["csharp", "class App{static void Main(){}}", /class App \{/],
    ["go", "package main\nfunc main(){}", /func main\(\) \{/],
    ["rust", "fn main(){println!(\"hi\");}", /fn main\(\) \{/],
    ["sql", "select id,name from users where active=true", /SELECT/],
    ["shell", "if [ -n \"$USER\" ];then echo hi;fi", /then/]
  ])("formats %s code with its language-aware formatter", async (codeLanguage, input, expected) => {
    const result = await executeTool("code-formatter", input, { codeLanguage });
    expect(result).toMatchObject({ ok: true, language: codeLanguage });
    if (result.ok) expect(result.output).toMatch(expected);
  });

  it.each([
    ["javascript", "function add(a, b) { return a + b; }", /function add\(./],
    ["json", '{ "name": "Infinity", "active": true }', /^\{"name"/],
    ["css", ".box { color: red; margin: 0 0 0 0; }", /^\.box\{/],
    ["html", "<!-- remove --><main>  <p>Tools</p> </main>", /^<main>/]
  ])("minifies %s with a syntax-aware minifier", async (codeLanguage, input, expected) => {
    const result = await executeTool("code-minifier", input, { codeLanguage });
    expect(result).toMatchObject({ ok: true, language: codeLanguage });
    if (result.ok) expect(result.output).toMatch(expected);
  }, 15_000);
});
