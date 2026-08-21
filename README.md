# Developer Tools 工程師工具箱

Developer Tools 是 `toolbox` 根目錄下的開源免費工具箱，整合通用程式碼、JSON、YAML、Encoding、Color、JWT、Hash、日期與文字工具。所有輸入與輸出都只在使用者裝置上處理，不上傳到後端、不寫入 URL，也不記錄 secret 或 token。

## 技術棧

- Next.js App Router、React、TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui Base UI 版本，style 使用 `base-vega`
- 已套用主題：`npx shadcn@latest apply --preset b1Z5bahMm --only theme`
- 介面元件使用 shadcn 官方 CLI 產生的 Base UI 實作，不自行重刻 primitive
- 色彩工具使用 Dice UI registry 的 Base UI Color Picker，並保留 CSS 色彩文字輸入
- `cmdk` 經 shadcn 官方 `command` 元件使用
- `next-intl` 提供繁體中文與英文介面，預設語言為繁體中文
- `next/font` 載入 Noto Sans TC 與 Fira Code
- `culori`、`js-yaml`、`jsonrepair`、`prettier`、`@noble/hashes` 等運算 dependency
- Prettier、Ruff、ClangFormat、gofmt、Rust formatter、sql-formatter 與 shfmt 提供跨語言格式化
- Terser、CSSO 與 html-minifier-terser 處理可安全壓縮的部署格式

## 已完成工具

- Code：Formatter 支援 JavaScript、TypeScript、JSON、HTML、CSS、Markdown、YAML、Python、Java、C、C++、C#、Go、Rust、SQL、Shell；Minifier 支援 JavaScript、JSON、CSS、HTML
- JSON Tools：Formatter、Minify、Validator、Sort Keys、Escape、Unescape、JSON to TypeScript
- Structured Data：YAML Formatter / Validator、YAML to JSON、JSON to YAML、INI / `.conf` Formatter / Validator、Nginx CONF Formatter
- Encoding：Base64 Encode / Decode、URL Encode / Decode、HTML Entity Encode / Decode、Unicode Escape / Unescape
- Color：Universal Color Converter、Contrast Checker、Palette Generator
- JWT：JWT Decoder、Expiration Checker、Secret Generator
- Hash / Crypto：Hash Generator、HMAC Generator、Random Secret Generator
- Date / Time：Unix to Date、Date to Unix、ISO Date Formatter、Timezone Display
- Text：Case Converter、Slug Generator、Word / Character / Byte Counter、UUID Generator

所有工具由 `src/lib/tools/registry.ts` 統一註冊，頁面、Sidebar、Command Palette、SEO 與 sitemap 都讀取同一份 registry。

## 前端架構與效能

- `AppShell`、`AppHeader`、`AppSidebar`、Breadcrumb、偏好設定與 Command Palette 各自維持獨立元件邊界；開啟搜尋或切換主題不會連帶重繪工具內容。
- Command Palette 僅在開啟時動態載入，避免首頁初始渲染建立完整搜尋清單與 Dialog。
- Dice UI Color Picker 僅由色彩工具動態載入，一般文字、JSON 與程式碼工具不載入其互動程式碼。
- `src/lib/tools/execute.ts` 依工具分類動態載入執行引擎；Prettier、WASM formatter、Terser、CSSO 等重型依賴只在實際執行對應功能時下載與初始化。
- Sidebar 與全部工具列表的密集工具連結停用 Next.js 自動 prefetch，避免進入首頁後一次預抓大量動態工具頁；一般主要導覽仍保留正常路由行為。
- 程式碼語言清單與範例獨立放在 `src/lib/tools/code-config.ts`，共用工作區不需匯入格式化器實作。

## 安裝與本機開發

```bash
npm install
npm run dev
```

本機固定網址：

```txt
http://localhost:6011
```

`dev` 與 `start` scripts 都固定使用 port `6011`，避免與同層專案衝突。

## Docker Compose

在 `C:\nginx-1.18.0\react\iistw.com\toolbox` 直接執行：

```bash
docker compose up -d --build --force-recreate
```

這個指令會 build production image 並啟動網站。Container name 為 `iistw-toolbox`，內外 port 固定 `6011:6011`，health check 會檢查 `http://127.0.0.1:6011/`。

## 測試與驗證

```bash
npm run lint
npm run typecheck
npm test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run build
```

Unit test 以 registry 為基準，要求每一個啟用工具都有正常輸入測試，以及無效輸入或明確的 N/A 邊界分類。新增工具時，至少補：

- 正常輸入與預期輸出
- 無效輸入與結構化錯誤
- 空值或邊界值
- Unicode、換行或特殊字元
- 適用工具的 round-trip / idempotency
- 使用次數只在成功執行後增加一次

## 使用次數統計

目前只做本裝置匿名的各工具使用次數統計，儲存在 `localStorage`，並只顯示於對應工具頁面。資料只包含：

- tool slug 對應 count

不包含輸入、輸出、clipboard、secret、JWT、private key 或可識別個人資料。統計失敗不會阻止工具執行。

## 後端邊界

MVP 不需要後端 API。只有未來明確需要跨裝置或全站 aggregate usage counter 時，才會整合同層 `backend`，且工具本身仍必須在後端失敗時可用。任何後端統計都不得接收工具輸入或輸出內容。

## UI 操作

- Sidebar 完整使用 shadcn 官方 `SidebarProvider`、`SidebarHeader`、`SidebarContent`、`SidebarGroup`、`SidebarMenuSub`、`SidebarFooter`、`SidebarRail` 與 `SidebarInset` 組合，分類工具顯示為巢狀選單。
- 桌機 Command Palette 使用 shadcn 官方 `command` / `CommandDialog`，按 `Ctrl/Cmd+K` 開啟；除工具搜尋外，也可切換語言與主題，目前選項會顯示勾號。手機不載入 Command Palette 介面。
- Breadcrumb、Alert、Alert Dialog、Dialog、Empty、Skeleton、Slider、Button、Textarea、Badge、Tooltip 與 Select 皆使用 shadcn 官方 Base UI 版本。
- 程式碼與設定檔使用 CodeBlock；單值轉換、多項指標、色彩格式與調色盤使用官方 Item / ItemGroup，並提供逐項複製；對比檢查使用專屬 Input、實際配色預覽與 WCAG Badge。
- Header 與頁面主要區塊採未包 Card 的排版；Card 僅用於真正獨立、重複的工具項目。
- 首頁、工具列表、分類頁與工具頁各有符合自身版型的 route-level Skeleton。
- 每個分類與工具使用對應語意的 Lucide icon，不以通用搜尋或井字圖示代替。
- 手機 Sidebar Footer 使用 shadcn Base UI Select 提供帶國旗的語言選單，並以 Tabs 切換淺色、跟隨系統與深色；桌機 Header 保留語言與主題控制，Command Palette 也可管理相同偏好。Buy Me a Coffee 外部連結保留在 Sidebar，copyright 位於主內容 Footer。

## 語言與字體

- 預設 locale 為 `zh-TW`，可在手機 Sidebar、桌機 Header 或 Command Palette 切換 `zh-TW` / `en`。
- 語言偏好儲存在 `toolbox-locale` cookie；不會把工具輸入內容放進 cookie。
- 主題支援淺色、深色與跟隨系統；跟隨系統時會顯示目前解析出的實際模式，偏好由 `next-themes` 管理。
- 一般介面、標題、按鈕、導覽與純文字輸入使用 Noto Sans TC。
- Fira Code 只用於程式碼輸出、行號、JSON / YAML / INI / Nginx / JWT，以及需要精確辨識的編碼、雜湊、token 與 secret。

## 語法輸出

Formatter / converter 輸出以共用 `CodeBlock` 呈現，顯示 language label 與從 1 開始的行號。Copy 只複製原始輸出，不包含行號。

目前支援輸出 language 包含 `json`、`yaml`、`ini`、`nginx`、`typescript`、`text`、`css`、`jwt`。

## SEO 與部署設定

- `NEXT_PUBLIC_SITE_URL`：正式站 absolute URL，例如 `https://toolbox.iistw.com`
- `src/app/robots.ts`：production 且 HTTPS 時允許索引；development / preview / localhost 預設 `Disallow: /`
- `src/app/sitemap.ts`：包含首頁、`/tools`、所有 enabled category 與 tool routes
- `src/app/manifest.ts`：提供 Web App manifest，但未宣稱完整 offline PWA
- `src/app/layout.tsx`：metadata、canonical、Open Graph、Twitter、viewport、themeColor 與 JSON-LD
- `public/og.png`：正式 OG image，尺寸 `1200x630`，用途為首頁、分類頁與工具頁預設社群預覽
- OG alt：`Developer Tools 工程師工具箱介面，包含程式碼格式化、色彩、JWT 與 Command Palette`

## Port inventory

- `6001`：backend
- `6002`：frontend
- `6003`：admin
- `6004`：blog-v2
- `6006`：blog
- `6010`：qr-code-generator
- `6011`：toolbox

不要把 toolbox 改回 `3000` 或其他既有服務 port。

## 新增工具步驟

1. 在 `src/lib/tools/registry.ts` 新增唯一 slug、category、actions、language、example 與 metadata。
2. 在 `src/lib/tools/*` 新增或擴充純函式邏輯。
3. 讓 `src/lib/tools/execute.ts` 路由到新工具。
4. 補 unit tests，並確認 registry 中啟用工具都有測試案例。
5. 確認 Command Palette、Sidebar、tool page、sitemap 與 metadata 自動出現。
6. 執行 `npm run lint && npm run typecheck && npm test && npm run build`。

## 已知限制

- YAML formatter 使用 Prettier / js-yaml，對高度進階 YAML CST 保留仍需更多 golden tests。
- JWT 工具只 decode，不 verify signature；UI 會明確提示 decode 不代表有效簽章。
- MD5 / SHA-1 僅作相容性與 checksum 顯示，不建議用於密碼或安全簽章。
