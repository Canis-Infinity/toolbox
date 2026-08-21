import type { ToolExecution, ToolOptions } from "./types";

export async function executeTool(slug: string, input: string, options: ToolOptions = {}): Promise<ToolExecution> {
  try {
    if (slug.startsWith("code-")) {
      const { codeTool } = await import("./code");
      return await codeTool(slug, input, options);
    }
    if (slug.includes("yaml") || slug.includes("ini-conf") || slug.includes("nginx-conf")) {
      const { structuredTool } = await import("./structured");
      return await structuredTool(slug, input);
    }
    if (slug.startsWith("json-")) {
      const { jsonTool } = await import("./json");
      return await jsonTool(slug, input, options);
    }
    if (slug.includes("base64") || slug.includes("url-") || slug.includes("html-entity") || slug.includes("unicode")) {
      const { encodingTool } = await import("./encoding");
      return await encodingTool(slug, input, options);
    }
    if (slug.includes("color") || slug.includes("contrast") || slug.includes("palette")) {
      const { colorTool } = await import("./color");
      return await colorTool(slug, input);
    }
    if (slug.startsWith("jwt-")) {
      const { jwtTool } = await import("./jwt");
      return await jwtTool(slug, input, options);
    }
    if (slug.includes("hash") || slug.includes("hmac") || slug.includes("secret")) {
      const { cryptoTool } = await import("./crypto");
      return await cryptoTool(slug, input, options);
    }
    if (slug.includes("unix") || slug.includes("date") || slug.includes("timezone")) {
      const { datetimeTool } = await import("./datetime");
      return await datetimeTool(slug, input);
    }
    const { textTool } = await import("./text");
    return await textTool(slug, input);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "工具執行失敗，請檢查輸入後重試。" };
  }
}
