import { build } from "esbuild";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

process.env.NODE_ENV = "production";
const root = process.cwd();
const config = JSON.parse(
  await readFile(path.join(root, "components.json"), "utf8")
);
const cssPath = path.join(root, config.tailwind.css);
const compiled = await build({
  entryPoints: ["scripts/offline-page.jsx"],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  packages: "external",
  jsx: "automatic",
  logLevel: "silent",
  alias: { "@": path.join(root, "src") },
});
const output = { exports: {} };
new Function("require", "module", "exports", compiled.outputFiles[0].text)(
  createRequire(path.join(root, "package.json")),
  output,
  output.exports
);
// Reuse the site's actual theme and component utilities without network font imports.
const input = postcss.parse(await readFile(cssPath, "utf8"), { from: cssPath });
input.walkAtRules("import", (rule) => {
  if (rule.params.startsWith("url(")) rule.remove();
});
const result = await postcss([
  tailwindcss({ base: root, optimize: true }),
]).process(input, { from: cssPath });
const html = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>暫時無法開啟｜Developer Toolbox</title><script>try{var t=localStorage.getItem("theme");document.documentElement.classList.toggle("dark",t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches))}catch{}</script><style>${result.css.replaceAll(
  "</style",
  "<\\/style"
)}</style></head><body>${output.exports.markup}</body></html>`;
await writeFile(path.join(root, "public/offline.html"), html);
console.log("Built offline.html from shadcn components and the site theme");
