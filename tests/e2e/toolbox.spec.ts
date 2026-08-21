import { expect, test } from "@playwright/test";

test("home and tool workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /工程師工具箱|Developer Tools/i })).toBeVisible();
  await expect(page.getByText(/本裝置總使用次數|Uses on this device/i)).toHaveCount(0);
  await page.goto("/tools/json-formatter");
  await expect(page.getByText(/本工具使用次數 0|Tool uses: 0/i)).toBeVisible();
  await expect(page.getByText(/僅限本機|Local only/i)).toHaveCount(0);
  await page.getByRole("textbox").fill('{"b":1,"a":2}');
  await page.getByRole("button", { name: /格式化|Format|Run/i }).click();
  await expect(page.getByLabel(/json output/i)).toContainText('"a"');
  await expect(page.getByText(/本工具使用次數 1|Tool uses: 1/i)).toBeVisible();
});

test("input tools disable execution until content is available", async ({ page }) => {
  await page.goto("/tools/word-character-counter");
  const execute = page.getByRole("button", { name: /^(轉換|Convert)$/i });
  await expect(execute).toBeDisabled();
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill("Infinity developer tools");
  await expect(execute).toBeEnabled();

  await page.goto("/tools/uuid-generator");
  await expect(page.getByRole("button", { name: /產生|Generate/i })).toBeEnabled();
});

test("download is limited to file-oriented outputs", async ({ page }) => {
  await page.goto("/tools/hash-generator");
  await expect(page.getByRole("button", { name: /下載|Download/i })).toHaveCount(0);
  await page.goto("/tools/json-formatter");
  await expect(page.getByRole("button", { name: /下載|Download/i })).toBeVisible();
});

test("invalid JSON uses an inline alert with correction help", async ({ page }) => {
  await page.goto("/tools/json-formatter");
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill("{bad}");
  await page.getByRole("button", { name: /格式化|Format/i }).click();
  await expect(page.locator("#tool-error")).toContainText(/JSON 語法錯誤|JSON syntax error|Colon expected/i);
  await page.getByRole("button", { name: /查看修正方式|correction help/i }).click();
  await expect(page.getByRole("dialog")).toContainText(/JSON/);
});

test("JSON formatter repairs trailing commas and missing property quotes", async ({ page }) => {
  await page.goto("/tools/json-formatter");
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill('{name: "Developer Tools", features: ["copy", "download"],}');
  await page.getByRole("button", { name: /格式化|Format/i }).click();
  await expect(page.locator("#tool-error")).toHaveCount(0);
  await expect(page.getByLabel(/json output/i)).toContainText('"name"');
  await expect(page.getByLabel(/json output/i)).not.toContainText('"download",');
});

test("secret generator has dedicated controls without a textarea", async ({ page }) => {
  await page.goto("/tools/jwt-secret-generator");
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("slider")).toBeVisible();
  await page.getByRole("button", { name: /產生|Generate/i }).click();
  await expect(page.locator('[data-slot="item"][aria-label="輸出結果"], [data-slot="item"][aria-label="Output"]')).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(0);
});

test("single-value results stay compact without a repeated output heading", async ({ page }) => {
  await page.goto("/tools/html-entity-encode");
  const empty = page.locator('[data-slot="empty"]:visible');
  await expect(empty).toBeVisible();
  const emptyBox = await empty.boundingBox();
  expect(emptyBox).not.toBeNull();
  expect(emptyBox!.height).toBeLessThan(220);
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill('<span title="demo">&</span>');
  await page.locator("section").getByRole("button", { name: /^(編碼|Encode)$/i }).click();
  const output = page.locator('[data-slot="item"][aria-label="輸出結果"], [data-slot="item"][aria-label="Output"]');
  await expect(output).toContainText("&lt;span");
  await expect(output.getByText(/輸出結果|Output/i)).toHaveCount(0);
  expect((await output.boundingBox())?.height).toBeLessThan(80);
});

test("confirming clear closes the alert dialog and restores page scrolling", async ({ page }) => {
  await page.goto("/tools/hash-generator");
  expect((await page.getByRole("textbox", { name: /輸入|Input/i }).boundingBox())?.height).toBeLessThan(220);
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill("Developer Tools");
  await page.getByRole("button", { name: /清除|Clear/i }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /清除|Clear/i }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("textbox", { name: /輸入|Input/i })).toHaveValue("");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("sidebar categories expand into native submenu links", async ({ page }) => {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 1280) < 768) await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
  const sidebar = page.locator('[data-sidebar="sidebar"]:visible');
  const category = sidebar.getByRole("button", { name: /JSON 工具|JSON Tools/i });
  await expect(category).toBeVisible();
  await expect(page.locator('[data-sidebar="menu-sub-button"][href="/tools/json-formatter"]:visible')).toBeVisible();
  await sidebar.getByRole("button", { name: /色彩|Color/i }).click();
  await sidebar.getByRole("button", { name: /文字|Text/i }).click();
  await expect(page.locator('[data-sidebar="menu-sub-button"]:visible').filter({ hasText: /字數、字元與位元組統計|Word \/ Character \/ Byte Counter/ })).toHaveCSS("height", /^(?!28px$)/);
});

test("desktop header keeps the language selector while mobile stays compact", async ({ page }) => {
  await page.goto("/");
  const selector = page.locator("header.sticky").getByRole("combobox", { name: /語言|Language/i });
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await expect(selector).toHaveCount(0);
  } else {
    await expect(selector).toBeVisible();
    await expect(selector).toHaveCSS("height", "32px");
  }
});

test("keeps support in the sidebar and copyright in the page footer", async ({ page }) => {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 1280) < 768) await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
  await expect(page.getByRole("link", { name: /請我喝杯咖啡|Buy Me a Coffee/i })).toHaveAttribute("href", "https://www.buymeacoffee.com/iistw22788");
  await expect(page.locator('main + footer a[href="https://iistw.com"]')).toHaveAttribute("href", "https://iistw.com");
});

test("command trigger keeps the compact shadcn small-button height", async ({ page }) => {
  await page.goto("/");
  const commandTrigger = page.getByRole("button", { name: /搜尋工具|Search tools/i });
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await expect(commandTrigger).toHaveCount(0);
    await expect(page.locator("header.sticky")).toHaveCSS("height", "56px");
  } else {
    await expect(commandTrigger).toHaveCSS("height", "32px");
  }
});

test("command palette opens", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) < 768, "Command Palette is intentionally desktop-only.");
  await page.goto("/");
  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByPlaceholder(/搜尋/).fill("base64");
  await page.getByRole("dialog").getByText(/Base64 編碼|Base64 Encode/).click();
  await expect(page).toHaveURL(/base64-encode/);
});

test("sidebar exposes language and resolved theme preferences", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) >= 768, "Sidebar preferences are intentionally mobile-only.");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Toggle Sidebar/i }).click();
  const language = page.getByRole("combobox", { name: /語言|Language/i });
  await expect(language).toBeVisible();
  await expect(language.locator('svg[viewBox*="512"]')).toHaveCount(1);
  const systemTheme = page.getByRole("tab", { name: /跟隨系統.*深色|System.*Dark/i });
  const themeLabels = await page.getByRole("tab").allTextContents();
  expect(themeLabels.join("|")).toMatch(/^(淺色\|跟隨系統\|深色|Light\|System\|Dark)$/);
  await expect(systemTheme).toHaveAttribute("data-active", "");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("tab", { name: /淺色|Light/i }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("desktop sidebar keeps preferences in the command palette", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) < 768, "Desktop-only assertion.");
  await page.goto("/");
  const footer = page.locator('[data-slot="sidebar-footer"]');
  await expect(footer.getByRole("combobox", { name: /語言|Language/i })).toHaveCount(0);
  await expect(footer.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /請我喝杯咖啡|Buy me a coffee/i })).toBeVisible();
});

test("desktop command palette marks current language and theme", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1280) < 768, "Command Palette is intentionally desktop-only.");
  await page.goto("/");
  await page.getByRole("button", { name: /搜尋工具|Search tools/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator('[data-slot="command-item"][data-checked="true"]')).toHaveCount(2);
  await expect(dialog.locator('[data-slot="command-item"]').filter({ hasText: /跟隨系統|System/ })).toHaveAttribute("data-checked", "true");
  await dialog.locator('[data-slot="command-item"]').filter({ hasText: /深色|Dark/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: /搜尋工具|Search tools/i }).click();
  await expect(page.getByRole("dialog").getByRole("option", { name: /^(深色|Dark)$/ })).toHaveAttribute("data-checked", "true");
});

test("uses Fira Code only for technical input", async ({ page }) => {
  await page.goto("/tools/slug-generator");
  const textFont = await page.getByRole("textbox", { name: /輸入|Input/i }).evaluate((element) => getComputedStyle(element).fontFamily);
  expect(textFont).toMatch(/Noto Sans TC/i);
  expect(textFont).not.toMatch(/Fira Code/i);

  await page.goto("/tools/json-formatter");
  const codeFont = await page.getByRole("textbox", { name: /輸入|Input/i }).evaluate((element) => getComputedStyle(element).fontFamily);
  expect(codeFont).toMatch(/Fira Code/i);
});

test("serves the generated application icon", async ({ request }) => {
  const response = await request.get("/icon");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/^image\//);
});

test("color converter uses copyable shadcn items instead of a code block", async ({ page }) => {
  await page.goto("/tools/color-converter");
  await page.getByRole("textbox", { name: /色彩值|Color value/i }).fill("#3B82F6");
  await page.getByRole("button", { name: /轉換|Convert/i }).click();
  await expect(page.getByText(/HEX 十六進位|HEX/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /複製HEX|Copy HEX/i })).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(0);
});

test("color tools expose the Dice UI color picker", async ({ page }) => {
  await page.goto("/tools/color-converter");
  await page.getByRole("button", { name: /開啟色彩值選色器|Open Color value color picker/i }).click();
  await expect(page.locator('[data-slot="color-picker-content"]')).toBeVisible();
  await expect(page.locator('[data-slot="color-picker-area"]')).toBeVisible();
  await expect(page.locator('[data-slot="color-picker-hue-slider"]')).toBeVisible();
  await expect(page.locator('[data-slot="color-picker-alpha-slider"]')).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("combobox")).toHaveText(/HEX/i);
});

test("contrast checker has dedicated inputs, preview and WCAG badges", async ({ page }) => {
  await page.goto("/tools/contrast-checker");
  await page.getByRole("textbox", { name: /前景色|Foreground color/i }).fill("#111827");
  await page.getByRole("textbox", { name: /背景色|Background color/i }).fill("#FFFFFF");
  await page.getByRole("button", { name: /轉換|Convert/i }).click();
  await expect(page.getByText(/實際配色預覽|Color preview/i)).toBeVisible();
  await expect(page.getByText("一般文字 AA", { exact: true })).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(0);
});

test("metric results render as individually copyable items", async ({ page }) => {
  await page.goto("/tools/word-character-counter");
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill("Hello 世界");
  await page.getByRole("button", { name: /轉換|Convert/i }).click();
  await expect(page.getByText("UTF-8 位元組", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /複製UTF-8|Copy UTF-8/i })).toBeVisible();
  await expect(page.locator("pre")).toHaveCount(0);
});

test("validators use status UI while formatters retain code output", async ({ page }) => {
  await page.goto("/tools/json-validator");
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill('{"ok":true}');
  await page.getByRole("button", { name: /驗證|Validate/i }).click();
  await expect(page.locator("#tool-error")).toHaveCount(0);
  await expect(page.locator("pre")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /複製|Copy/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /下載|Download/i })).toHaveCount(0);
  await expect(page.locator('[data-slot="badge"]').filter({ hasText: /根節點型別|Root type/i })).toBeVisible();
  expect((await page.getByRole("textbox", { name: /輸入|Input/i }).boundingBox())?.height).toBeLessThan(260);

  await page.goto("/tools/json-formatter");
  await expect(page.getByText(/輸出結果|Output/, { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: /輸入|Input/i }).fill('{"ok":true}');
  await page.getByRole("button", { name: /格式化|Format/i }).click();
  const codeOutput = page.getByLabel(/json output/i);
  await expect(codeOutput).toBeVisible();
  const inputBox = await page.getByRole("textbox", { name: /輸入|Input/i }).boundingBox();
  const outputBox = await codeOutput.boundingBox();
  expect(inputBox).not.toBeNull();
  expect(outputBox).not.toBeNull();
  expect(Math.abs(inputBox!.height - outputBox!.height)).toBeLessThan(3);
});

test("code formatter runs every browser formatting engine", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The mobile project verifies the shared workbench separately.");
  await page.goto("/tools/code-formatter");

  const language = page.getByRole("combobox", { name: /程式語言|Programming language/i });
  const execute = page.getByRole("button", { name: /^(格式化|Format)$/i });
  const cases = ["JavaScript", "Python", "C++", "Go", "Rust", "SQL", "Shell"];

  await expect(execute).toBeDisabled();
  for (const name of cases) {
    await language.click();
    await page.getByRole("option", { name, exact: true }).click();
    await page.getByRole("button", { name: /範例|Example/i }).click();
    await execute.click();
    await expect(page.locator("#tool-error")).toHaveCount(0);
    await expect(page.getByLabel(/output/i)).not.toBeEmpty();
  }
});

test("code minifier exposes only safe formats and keeps a balanced editor", async ({ page }) => {
  await page.goto("/tools/code-minifier");
  const language = page.getByRole("combobox", { name: /程式語言|Programming language/i });
  await language.click();
  await expect(page.getByRole("option", { name: "JavaScript", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "JSON", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "CSS", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "HTML", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: "Python", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /範例|Example/i }).click();
  await page.getByRole("button", { name: /^(壓縮|Minify)$/i }).click();
  const inputBox = await page.getByRole("textbox", { name: /輸入|Input/i }).boundingBox();
  const outputBox = await page.getByLabel(/output/i).boundingBox();
  expect(inputBox).not.toBeNull();
  expect(outputBox).not.toBeNull();
  expect(Math.abs(inputBox!.height - outputBox!.height)).toBeLessThan(3);
});
