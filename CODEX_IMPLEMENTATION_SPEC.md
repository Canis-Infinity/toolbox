# Developer Tools 網站 Codex 實作規格

> 本文件給 Codex 直接實作用。開始任何實作前，Codex 必須先閱讀 repo 內所有適用的 `AGENTS.md`、README、coding principles、lint/test 設定與既有架構，並優先遵守既有專案規範。若本文件與專案既有規範衝突，以更嚴格者為準。

## 1. 產品目標

建立一個 local-first、browser-only 優先的 Developer Tools 網站，整合工程師日常常用的小工具，例如 JSON format、Base64、URL encode/decode、HEX/RGB 轉換、JWT decode、hash、secret generator、timestamp converter 等。

核心價值：

- 快速：工具開啟即用，輸入後即時輸出。
- 安全：預設所有資料只在瀏覽器處理，不送到伺服器。
- 可信：清楚標示哪些操作只是 decode、哪些操作涉及 verify/sign/encrypt。
- 一致：所有工具使用相同的頁面結構、輸入輸出體驗、錯誤處理與 copy/download 行為。
- 可維護：工具邏輯與 UI 解耦，新增工具時不需要重寫整個頁面。

## 2. 技術棧

固定使用：

- Next.js
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Dice UI

已知前置：

```bash
npx shadcn@latest apply --preset b1Z5bahMm --only theme
```

後端：

- 預設不要建立後端 API。
- 只有瀏覽器無法安全或合理完成時，才使用 Node.js。
- 若必須使用 Node.js，需先在實作註解或 PR 說明中解釋原因、資料流與安全影響。

專案位置：

- 前端專案目錄固定為 `C:\nginx-1.18.0\react\iistw.com\toolbox`。
- 後端可用目錄為 `C:\nginx-1.18.0\react\iistw.com\backend`。
- Codex 實作前必須先檢查上述目錄狀態、既有 git 狀態、package scripts 與規範文件。
- 若 `toolbox` 尚未初始化，才在該目錄建立 Next.js 專案。
- 若需要後端功能，優先整合或擴充 `backend` 既有 Node.js 專案，不得在不必要時另建第二套後端。

## 3. 核心原則

- Local-first：預設所有工具在 client side 執行。
- Privacy by default：使用者輸入不得被上傳、記錄、分析或持久化，除非使用者明確操作。
- No magic：不要自動把敏感內容送到第三方服務。
- Predictable UI：每個工具的操作區、輸出區、錯誤區、範例與 copy 行為保持一致。
- Small, focused modules：每個工具的核心邏輯應獨立、可測試。
- Avoid unnecessary abstraction：不要為了「未來可能」建立過度抽象。
- Type safety first：禁止 `any` 與 `any[]`。

### 3.1 Codex 自主執行與預設決策

本文件的目的，是讓 Codex 在一次工作流程中完成實作、測試、文件與 Docker 驗證。除非遇到會刪除／覆蓋既有使用者資料、需要未提供的帳號／憑證、現有規範直接衝突、或需求在技術上無法成立，否則不得停下來詢問偏好；應先檢查專案，依下列預設值直接完成。

- Framework：新專案使用目前穩定版 Next.js App Router、React、TypeScript strict mode 與 Tailwind CSS v4；若既有專案已鎖版，沿用相容版本，不擅自進行 major upgrade。
- Package manager：依既有 lockfile 決定；只有完全沒有 lockfile 時才使用 npm，並提交 `package-lock.json`。
- Source layout：新專案使用 `src/`、App Router、`@/*` path alias；既有專案則沿用原目錄慣例。
- UI language：介面預設繁體中文 `zh-TW`，工具專有名稱保留常見英文，例如 JSON Formatter；日期、數字與可及性文字使用一致 locale。架構需避免把文字散落在 logic 中，以便未來加入 i18n，但 MVP 不需先建立完整翻譯平台。
- Theme：支援 light、dark、system；使用既有 shadcn theme token，不重新設計或覆蓋 `b1Z5bahMm` preset。
- Icons：使用專案既有 icon library；新專案採 shadcn 預設搭配的 Lucide icons。不得自行畫 SVG 取代已有圖示。
- Backend：MVP 預設不啟用後端。工具使用次數採本裝置匿名統計，標示「本裝置總使用次數」。只有需求明確要求跨裝置／全站總數時才整合 `backend`。
- Port／Default URL：已掃描 `C:\nginx-1.18.0\react\iistw.com` 既有專案；已使用 `6001`、`6002`、`6003`、`6004`、`6006`、`6010`。Toolbox 固定使用尚未占用的 `6011`，本機與 Docker URL 均為 `http://localhost:6011`。`dev`、`start`、Docker `PORT`、port mapping、health check 與 README 必須一致使用 `6011`，不得回退到 Next.js 預設 `3000`。
- Validation：簡單純函式輸入使用明確 TypeScript guards；表單或結構化 schema 使用專案既有 validator，新專案預設使用 Zod。不得為單一字串轉換建立過度複雜 form abstraction。
- Testing：新專案 unit／component tests 使用 Vitest + Testing Library，E2E 使用 Playwright；若既有專案已有等價框架，沿用既有框架。
- Syntax highlighting：新專案預設使用 Shiki；如既有專案已有等價、支援指定 languages 與行號的 highlighter，沿用既有方案。
- Domain dependencies：parser、formatter、crypto、color conversion 可使用成熟且維護中的專用套件；安裝前需確認官方文件、授權、browser support、bundle impact 與目前版本。這些不是 UI library，但不得引入會取代 shadcn／Dice UI 的視覺元件套件。
- Dependency choice：同一能力只選一個主要套件。優先使用現有 dependency、Web Platform API 或 Node／Next 內建能力；不得安裝功能重疊的多套 parser／formatter。
- Completion：Codex 必須持續到 lint、typecheck、unit tests、coverage、E2E、production build 與 Docker Compose smoke test 全部完成；若某項確實無法執行，需在最終交付列出實際錯誤與已嘗試的處理，不得用「建議之後測試」代替。

## 4. UI Components 規則

### 4.1 元件來源優先順序

1. 優先使用 shadcn/ui 官方元件。
2. shadcn/ui 沒有的元件，才使用 Dice UI。
3. 不得使用其他 UI library。
4. 不得自行仿製 shadcn/ui 或 Dice UI 元件。
5. 不得複製官方元件後魔改成非官方結構。

### 4.2 安裝與使用規則

- 所有 shadcn/ui 元件必須依官方 CLI 或官方文件方式安裝。
- 所有 Dice UI 元件必須依官方文件方式安裝與使用。
- 不可手刻已有官方元件的功能，例如 button、dialog、tabs、command menu、popover、tooltip、select、switch、checkbox、textarea、input、badge、card。
- 若需要 circular progress、color picker 等 shadcn/ui 沒有的元件，使用 Dice UI。
- 若某 UI 需求兩者都沒有，先用既有 primitive 與 Tailwind 組合完成頁面需求，但不得偽裝成官方元件，也不得引入第三方 UI library。

### 4.3 建議 shadcn/ui 元件

- `button`
- `input`
- `textarea`
- `label`
- `select`
- `tabs`
- `card`
- `badge`
- `separator`
- `scroll-area`
- `dialog`
- `sheet`
- `popover`
- `tooltip`
- `command`
- `dropdown-menu`
- `alert`
- `switch`
- `checkbox`
- `table`
- `sonner`
- `sidebar`

### 4.4 建議 Dice UI 元件

僅在 shadcn/ui 沒有原生對應元件時使用：

- Color Picker
- Circular Progress
- 其他 shadcn/ui 不提供、且 Dice UI 官方提供的互動元件

## 5. MVP 工具分類與優先順序

### P0：MVP 必做

#### JSON Tools

- JSON Formatter
- JSON Minify
- JSON Validator
- JSON Sort Keys
- JSON Escape
- JSON Unescape
- JSON to TypeScript

#### Structured Data / Config Formatters

- YAML Formatter
- YAML Validator
- YAML to JSON
- JSON to YAML
- INI / `.conf` Formatter
- INI / `.conf` Validator
- Nginx CONF Formatter

`CONF` 並非單一通用語法。實作時必須明確區分 INI-style `.conf` 與 Nginx configuration，不得用同一個模糊 parser 猜測後靜默改寫內容。格式化前需讓使用者選擇格式，或由副檔名／明確語法辨識後顯示目前模式。

#### Encoding / Decoding

- Base64 Encode
- Base64 Decode
- URL Encode
- URL Decode
- HTML Entity Encode
- HTML Entity Decode
- Unicode Escape
- Unicode Unescape

#### Color Tools

- Universal Color Converter：輸入任一支援格式後，同時顯示其他格式
- HEX：3、4、6、8 digits，包含 alpha
- RGB / RGBA：整數值與百分比
- HSL / HSLA
- HSV / HSB
- HWB
- CMYK
- CIE LAB / LCH
- OKLab / OKLCH
- CIE XYZ：需明確標示 D50 或 D65 white point
- CSS Named Colors 與 `transparent`
- CSS Color Level 4 常用函式格式
- Color Picker
- Contrast Checker
- WCAG Contrast Ratio
- Alpha / Opacity 調整
- Lighten / Darken
- Saturation 調整
- Complementary Color
- Palette Generator
- 色彩格式 copy presets，例如 CSS、Tailwind arbitrary value

色彩轉換必須保留合理精度與 alpha，不可在中間步驟過早四捨五入。LAB、LCH、OKLab、OKLCH、XYZ、色域映射等轉換應使用成熟且維護中的色彩運算套件或平台標準能力；這類套件視為運算 dependency，不是 UI library。不得自行手刻未經驗證的色彩科學公式。輸出超出 sRGB 色域時需明確標示，不可靜默夾值而不告知。

#### JWT Tools

- JWT Decoder
- JWT Payload Viewer
- JWT Expiration Checker
- JWT Timestamp Display
- JWT Secret Generator

#### Hash / Crypto

- MD5
- SHA-1
- SHA-256
- SHA-384
- SHA-512
- HMAC SHA-256
- HMAC SHA-512
- Random Secret Generator

#### Date / Time

- Unix Timestamp to Date
- Date to Unix Timestamp
- ISO Date Formatter
- Timezone Display

#### Text Tools

- Case Converter
- Slug Generator
- Word / Character / Byte Counter
- UUID Generator

### P1：MVP 後優先

- JSON Diff
- JSON to CSV
- CSV to JSON
- XML Formatter
- XML to JSON
- RegExp Tester
- Cron Parser
- URL Parser
- Query String Parser / Builder
- Markdown Preview
- SQL Formatter
- Docker Compose Validator
- `.env` Parser
- Apache CONF Formatter

### P2：進階工具

- JWT Sign
- JWT Verify
- AES-GCM Encrypt / Decrypt
- AES-CBC Encrypt / Decrypt
- File Hash Calculator
- Image Base64 Preview
- QR Code Generator
- HTTP Status Code Lookup
- MIME Type Lookup
- User Agent Parser
- Open Graph Preview
- DNS Lookup

注意：

- JWT Decode 不等於 JWT Verify，UI 必須明確標示。
- Encryption / Decryption 功能需清楚標示演算法、IV、salt、encoding 與安全限制。
- 涉及檔案的工具必須在瀏覽器中處理，避免上傳。

### 5.1 所有工具的共同行為契約

每一個工具都必須在 `tools.registry.ts` 註冊唯一 `slug`、名稱、短描述、分類、tags、搜尋別名、priority、local-only 狀態、支援 actions、輸入／輸出 language，以及是否計入最近使用。頁面、Sidebar、Command、SEO、usage count 與測試清單都從 registry 取得資料，不可各自維護互相漂移的工具清單。

每個工具頁的固定流程如下：

1. 初始顯示空白輸入、空白輸出、簡短 placeholder 與可直接載入的安全範例；不得預先放入真實 secret 或 token。
2. Formatter／validator 預設使用明確的 `Format`／`Validate` 按鈕觸發；小型 deterministic converter 可即時轉換，但需 debounce 150–300ms，避免每次按鍵重算與重複計數。
3. 成功後顯示格式化／轉換結果、語言標籤、行號與可用 actions；空輸入不視為成功，不增加 usage count。
4. 失敗後保留原輸入與上一個成功輸出，顯示可修正的 inline error；不可清空使用者內容，不可顯示 stack trace。
5. `Copy` 複製未裝飾的原始輸出；`Download` 使用合理副檔名與 UTF-8；`Clear` 清除目前工具 state，但不清除全站偏好或歷史計數；有雙向轉換時才顯示 `Swap`。
6. 使用者載入 Example 只更新輸入，不計次；Example 成功執行後才按一般規則計次。
7. 每次明確成功執行只增加一次該工具 usage count 與 total。即時工具以「輸入從無效／空值變成有效且產生新結果」為一次，後續同一結果的 re-render 不得再計數。
8. 輸入、輸出、錯誤細節、clipboard 內容與下載內容都不得送往 analytics、usage API、logs 或 URL。

### 5.2 JSON Tools 詳細驗收

- JSON Formatter：接受 RFC 8259 JSON；預設 2 spaces，提供 2 spaces、4 spaces、tab 選項；保留 array order；object key order 預設不變；輸出 language 為 `json`。
- JSON Minify：移除非必要 whitespace，不改變字串內空白與 escape；輸出必須可再次 parse，且與原始 JSON deep-equal。
- JSON Validator：成功顯示 valid 狀態與根節點型別；失敗顯示可取得時的 line、column 與附近位置，但不得直接顯示 raw stack。
- JSON Sort Keys：預設遞迴排序所有 object keys，array 順序不變；提供「只排序第一層」選項；排序採穩定、可預期的 Unicode code point 或 locale-independent 規則並記錄於 README。
- JSON Escape／Unescape：明確區分「將文字轉成 JSON string content」與「解析完整 JSON string literal」；避免重複包引號造成歧義，UI 顯示目前模式。
- JSON to TypeScript：根物件預設型別名稱為 `Root`，允許使用者輸入合法 identifier；處理 nested object、array、nullable、boolean、number、string 與 heterogeneous array；無法可靠推斷時使用 `unknown`，禁止輸出 `any`。

### 5.3 YAML、INI／CONF 與 Nginx CONF 詳細驗收

- YAML Formatter：支援常見 YAML 1.2 文件、multi-document marker、sequence、mapping、block scalar、anchors、aliases、comments；預設 2 spaces 且禁止 tab indentation。Formatter 不得解析後重建而無聲丟失 comments、anchors 或 scalar style；若所選 parser 無法保留，需採用 CST／document API 或拒絕具破壞風險的格式化並提示。
- YAML Validator：顯示 syntax error 的 line／column；偵測 duplicate keys 時預設視為 error；不得解析或執行任意自訂 tag；防止 alias expansion 造成資源耗盡，設定合理輸入與 alias 限制。
- YAML to JSON：只處理可安全表示為 JSON 的資料；遇到 custom tags、non-string map keys、circular aliases、BigInt／timestamp 等語意可能遺失的值時必須警告或拒絕，不可靜默改變資料。
- JSON to YAML：保留 array order 與 object insertion order，預設 2 spaces；字串 quoting 由 formatter 安全決定，避免 `yes`、`no`、日期樣式等值被誤判型別。
- INI／`.conf` Formatter：支援 section、key/value、空行、`#`／`;` comments；保留 comments 與原有 section order；統一 delimiter 周圍空格但不得任意改 key 大小寫。Duplicate key 必須警告，不可靜默覆寫。
- INI／`.conf` Validator：回報 malformed section、缺少 key、無效 delimiter 與 line number；輸出不得假設它等同 Nginx 或 Apache syntax。
- Nginx CONF Formatter：支援 directives、semicolon、quoted strings、variables、comments、nested blocks 與常見 `http`／`server`／`location` 結構；預設 4 spaces；保留 directive order 與 comments；不得重新排序 directives。缺少 semicolon、unbalanced braces、未關閉 quote 時需指出 line／column。
- 所有 formatter 都需滿足 idempotency：相同 options 下，對結果再次 format 必須產生完全相同字串。

### 5.4 Encoding／Decoding 詳細驗收

- Base64 Encode／Decode：預設 UTF-8；正確處理 CJK、emoji、null byte 與換行；Decode 驗證 alphabet／padding，提供 standard Base64 與 Base64URL 明確模式，不自動混猜後靜默成功。
- URL Encode／Decode：分開提供 component 與完整 URL 模式，分別使用等價於 `encodeURIComponent` 與保留 URL 結構的邏輯；malformed percent encoding 顯示錯誤。
- HTML Entity Encode／Decode：預設編碼 `& < > " '` 等必要字元；Decode 不得把結果當 HTML 插入 DOM，必須以純文字顯示，防止 XSS。
- Unicode Escape／Unescape：支援 `\uXXXX` 與需要時的 surrogate pairs；對 code point 格式提供明確模式；malformed escape 不得部分吞掉內容。

### 5.5 Color Tools 詳細驗收

- Universal Color Converter 只有一個主要輸入，可接受支援格式並顯示辨識結果；格式無法唯一判斷時顯示格式選擇，不自行猜測 CMYK／RGB 數字序列。
- 輸出至少同時列出 HEX、RGB(A)、HSL(A)、HSV／HSB、HWB、CMYK、LAB、LCH、OKLab、OKLCH、XYZ D50、XYZ D65；每一列有格式名稱、格式化值、copy button 與必要 precision／gamut 狀態。
- HEX 輸出預設 uppercase 或 lowercase 必須全站一致；建議預設 uppercase，並提供設定切換。Alpha 為 1 時預設輸出 6 digits，使用者選擇保留 alpha 時輸出 8 digits。
- RGB channel 範圍為 0–255，alpha 為 0–1；HSL／HSV／HWB hue 正規化到 0–360；百分比值限制 0–100%；輸入超界需 validation error，不可默默 modulo／clamp，只有使用者明確執行 gamut mapping 才可調整。
- CMYK 是裝置無關近似顯示，不宣稱印刷色彩精準；UI 顯示簡短限制。XYZ 每個結果都標示 white point。
- Color Picker 使用 Dice UI 官方 Color Picker，value 由共用 color model 控制；不得另做自製 picker。可視色塊、文字輸入與 slider 必須同步且不產生更新迴圈。
- Contrast Checker 可選前景與背景色並考慮 alpha compositing；顯示 ratio、normal text／large text 的 WCAG AA／AAA 結果與 pass／fail 文字，不只以紅綠色表示。
- Lighten／Darken／Saturation 預設在 OKLCH 或選定的 perceptual color space 操作，UI 明確標示 space 與調整量；不得把 channel 簡單加減後宣稱感知均勻。
- Complementary Color 明確標示使用的 color space 與 hue rotation；Palette Generator 至少提供 complementary、analogous、triadic、tetradic、monochromatic，並讓每個 swatch 可 copy。
- Tailwind preset 只輸出 arbitrary value，例如 `bg-[#3B82F6]` 或可被 Tailwind v4 接受的 color function；不得假造不存在的 Tailwind palette token。

### 5.6 JWT、Hash／Crypto 詳細驗收

- JWT Decoder：只解析三段 compact token 的 header／payload，支援 Base64URL 與 UTF-8 JSON；顯示 `alg`、`typ`、registered claims；始終顯示「Decode 不代表簽章有效」。格式錯誤時不得嘗試執行 payload。
- JWT Expiration：`exp`／`nbf`／`iat` 以 NumericDate seconds 解析，顯示原值、使用者本地時間與 UTC；狀態分為 expired、not yet valid、active、unknown。僅 decode 時不得顯示「Valid signature」。
- JWT Secret Generator／Random Secret Generator：使用 `crypto.getRandomValues`；提供 byte length 與輸出 encoding（Base64URL／Base64／HEX）；預設至少 32 bytes，顯示 entropy 對應資訊但不誇大安全保證。
- MD5／SHA-1：允許為相容性／checksum 使用，但顯示不適合密碼與安全簽章；SHA-256／384／512 優先使用 Web Crypto。
- HMAC：secret 只存在記憶體，支援 UTF-8／HEX／Base64 明確 key encoding 與 HEX／Base64 output；錯誤 key encoding 必須拒絕。
- 所有 secret input 預設可遮罩，提供明確 show／hide 控制；Clear 時清除相關 state；頁面卸載後不持久化。

### 5.7 Date／Time 與 Text Tools 詳細驗收

- Unix Timestamp Converter：明確切換 seconds／milliseconds，提供合理 magnitude 偵測建議但不靜默改單位；同時顯示 UTC ISO 8601 與使用者本地時間。
- Date to Unix：輸入需包含或選擇 timezone；沒有 timezone 時明確使用 browser local timezone 並顯示名稱／offset，避免把 local time 誤當 UTC。
- ISO Date Formatter：接受合法 ISO 8601，保留並顯示原 offset，提供 UTC 與 local 結果；invalid date 不可 rollover 成另一日期。
- Timezone Display：至少顯示 IANA zone、UTC offset、locale-formatted time；不自行維護過期 timezone 表，使用平台 `Intl` 能力。
- Case Converter：至少支援 camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASE、Title Case、Sentence case；定義 acronym、數字與 Unicode 的處理，結果可逐項 copy。
- Slug Generator：預設 lowercase、hyphen separator、trim duplicate separators；Unicode 預設保留或 transliterate 的策略必須在 UI 顯示並可切換，不能無聲刪除全部非拉丁文字。
- Counter：同時顯示 UTF-16 length、Unicode code points、grapheme count、words、lines 與 UTF-8 bytes，label 不得只寫模糊的「characters」。
- UUID Generator：至少提供 UUID v4；使用 `crypto.randomUUID` 或可信實作；支援產生數量、uppercase／lowercase 與 copy all；輸入數量設合理上限防止凍結 UI。

### 5.8 P1／P2 工具最低功能邊界

P1／P2 可在 MVP 完成後實作，但一旦 registry 標示為 enabled，就必須是可完整使用的工具，不得只放 Coming Soon 空頁。最低要求如下：

- Diff：左右輸入、語法-aware 或 line diff、清楚新增／刪除標示、行號、copy／download；大型內容需避免主執行緒長時間阻塞。
- CSV／XML／SQL／Markdown：提供明確 dialect／language options；formatter 不改資料語意；輸出有對應語法高亮與行號。
- RegExp Tester：pattern、flags、test text 分離；顯示 matches、groups、indices；防範 catastrophic backtracking 卡住 UI，必要時使用 Web Worker／timeout。
- Cron Parser：明確 cron dialect 與 timezone；顯示接下來數次執行時間；不宣稱不同平台 cron 完全相容。
- URL／Query Parser：使用標準 `URL`／`URLSearchParams`；保留 duplicate query keys；顯示 protocol、host、port、path、query、fragment。
- Docker Compose Validator：只在瀏覽器 parse YAML 與可靜態檢查的 schema；不得聲稱已驗證本機 image、volume 或 daemon 狀態。
- `.env` Parser：保留 comments／空行，secret value 預設遮罩；不得送往後端、log 或 URL。
- JWT Sign／Verify：清楚區分演算法與 key type；禁止接受 `alg=none` 作為安全驗證；顯示驗證結果但不保存 key。
- AES：優先 AES-GCM；清楚顯示 key derivation、salt、IV、auth tag、encoding；隨機 IV 不得重用。AES-CBC 必須提示不提供完整性保護，且不可作為預設。
- File／Image：使用 browser File API／Web Crypto，顯示進度、大小限制與 cancel；檔案不得上傳。
- QR Code：內容在瀏覽器生成；提供尺寸、error correction、foreground／background 與下載，並驗證對比度。
- Lookup／Parser 類：能以本地靜態資料完成者優先本地；DNS 等必須連網者要明確標示資料將送往何處，未經明確需求不得納入 local-only MVP。

## 6. 頁面與資訊架構

### 6.1 主要路由

建議使用 Next.js App Router：

```text
/
/tools
/tools/[slug]
/categories/[category]
```

### 6.2 首頁

首頁不是行銷頁，第一屏應直接是可用的工具入口：

- 搜尋框
- 常用工具
- 最近使用工具
- 工具分類
- local-first / privacy 提示

### 6.3 工具列表頁

`/tools` 顯示：

- 搜尋
- 分類篩選
- 工具名稱
- 工具描述
- tags
- 是否 local-only

### 6.4 工具詳情頁

每個 `/tools/[slug]` 頁面包含：

- 工具標題
- 簡短描述
- 輸入區
- 操作列
- 輸出區
- 錯誤訊息
- Copy / Clear / Swap / Download 等常用操作
- 範例輸入
- 注意事項或安全提醒

工具頁不要放大段教學文案；必要說明保持短且靠近相關操作。

## 7. 共用 UI

建立一致的工具頁骨架：

- `ToolLayout`
- `ToolHeader`
- `ToolInput`
- `ToolOutput`
- `ToolActions`
- `ToolError`
- `ToolExample`
- `CopyButton`
- `ClearButton`
- `DownloadButton`
- `SwapButton`
- `ToolMetadataBadges`
- `HighlightedCode`
- `CodeOutput`

共用行為：

- 輸入變更後即時輸出。
- 無效輸入時保留原輸入，顯示清楚錯誤。
- 成功 copy 後用 toast 回饋。
- 大輸出內容支援一鍵 copy。
- 所有輸入輸出區使用等寬字體。

### 7.1 App Shell 與官方 shadcn Sidebar

網站主要框架必須使用 shadcn/ui 官方 `sidebar` 元件，並依官方 CLI 與文件安裝、組合。至少使用適用的 `SidebarProvider`、`Sidebar`、`SidebarHeader`、`SidebarContent`、`SidebarGroup`、`SidebarMenu`、`SidebarInset`、`SidebarTrigger` 與 `SidebarRail`；不得自行仿製另一套 sidebar。

側邊欄需完整且適合高頻使用：

- Header 顯示網站名稱／識別與全站搜尋入口。
- Content 依工具分類建立群組，顯示工具圖示、名稱、目前頁 active state，並可顯示該工具使用次數。
- 提供最近使用與常用工具入口；資料只儲存 tool slug。
- Footer 可放 theme、local-first 狀態或必要設定，但不可塞入大段說明。
- Desktop 支援展開與 icon-only 收合；收合後使用官方 Tooltip 顯示工具名稱。
- Sidebar collapse 狀態需沿用官方 API 與儲存方式，不得自行建立互相衝突的狀態。
- 主內容使用 `SidebarInset`，header／toolbar 在捲動時保持可操作，內容不得被側邊欄遮住。
- 分類順序固定由 registry 的 category order 決定；工具依 priority、名稱穩定排序，不因 hydration 或 usage count 改變而跳動。最近使用區才可依時間排序。
- Sidebar 搜尋入口放在 Header，分類與工具放在 Content，設定放在 Footer；不使用多層巢狀卡片，不讓工具清單被裝飾性內容擠壓。
- 工具項目需有一致高度與 icon 尺寸；長名稱單行 ellipsis，完整名稱透過 Tooltip／accessible name 取得。使用次數使用低視覺權重的 badge 或文字，不得造成 menu item 寬度跳動。
- Sidebar 的展開／收合、mobile open 狀態使用官方 context；只有持久化的 collapsed preference 可跨頁保存，mobile open 不持久化。

### 7.2 程式碼顯示、語法高亮與行號

所有程式碼、結構化資料、設定檔與 formatter 輸出必須使用統一的 `HighlightedCode`／`CodeOutput` 顯示，不得以無高亮的純文字區塊代替。適用內容至少包含 JSON、YAML、INI／CONF、Nginx CONF、XML、SQL、Markdown、JavaScript、TypeScript、CSS、JWT header／payload 與轉換後的程式碼片段。

必要行為：

- 使用成熟、維護中的 syntax highlighting engine；建議優先使用 Shiki，或沿用專案既有且能力相當的 highlighter。Syntax highlighter 是內容呈現 dependency，不視為 UI library。
- 每一行都顯示穩定、不可選取的行號，從 1 開始；換行、長行水平捲動與複製時不得破壞實際內容。
- Copy 必須只複製原始內容，不包含行號或高亮產生的 HTML。
- 顯示正確 language label，並依內容選擇 grammar；無法辨識時明確使用 plain text。
- 支援 light／dark theme，色彩對比需符合可及性要求。
- 大型輸出需限制同步渲染成本，必要時 lazy load highlighter、設定可接受的顯示上限或採用虛擬化。
- 高亮失敗時仍需顯示 escaped plain text 與行號，不可插入未清理 HTML，也不可讓 formatter 功能失效。
- 行號欄寬需依總行數穩定計算，右對齊並與內容保持固定間距；1 位數變 2／3 位數時不得推動整個頁面 layout。
- `HighlightedCode` 接收 typed props，例如 `code`、`language`、`fileName?`、`showLineNumbers`、`wrap`、`maxHeight?`；預設顯示行號且不 wrap，formatter 頁可讓使用者切換 wrap。
- 高亮 HTML 必須由可信 highlighter 產生並安全 render；不得直接把使用者字串放入 `dangerouslySetInnerHTML`。若使用該 API，只能注入 highlighter 的 escaped output，並以測試覆蓋 `<script>`、event handler、HTML entity 等輸入。

## 8. shadcn Command Palette、搜尋與 Ctrl/Cmd+K

必須使用 shadcn/ui 官方 `command` 搭配官方 `dialog` 組合實作全站 command palette，不得自行手刻或替換成其他 command menu library：

- Windows / Linux：`Ctrl+K`
- macOS：`Cmd+K`

功能：

- 搜尋工具名稱
- 搜尋工具描述
- 搜尋 tags
- 可用鍵盤上下選擇與 Enter 開啟
- 支援分類快速跳轉
- 顯示最近使用與常用工具
- 工具頁開啟時可執行目前工具支援的動作，例如 Copy、Clear、Swap、Download、Load Example
- 每個 command 需有明確名稱、可用狀態與鍵盤操作；不支援的工具動作不得顯示
- Sidebar header 與全站 header 都需提供可見的搜尋按鈕，顯示 `Ctrl+K` 或 `⌘K` 提示
- Command palette 在 mobile 使用適合窄螢幕的寬度與可捲動結果區

元件：

- 優先使用 shadcn/ui `command`、`dialog` 或官方建議組合。
- 不得自行手刻 command palette。
- 所有內部項目使用官方 `CommandInput`、`CommandList`、`CommandEmpty`、`CommandGroup`、`CommandItem` 與 `CommandSeparator` 等適用元件。

Command 行為與快捷鍵：

- `Ctrl+K`／`Cmd+K`：在任何非組字狀態開啟／關閉 palette；需呼叫 `preventDefault` 避免瀏覽器搜尋衝突。
- `Escape`：先關閉 palette，不清除工具輸入；focus 回到開啟 palette 的 trigger。
- `ArrowUp`／`ArrowDown`：移動 active item；`Enter` 執行；disabled item 不可被執行。
- 搜尋 trim 前後空白並做 case-insensitive matching；比對 name、description、tags、aliases 與 category，不比對使用者工具內容。
- 空 query 依序顯示 Actions（若在工具頁）、Recent Tools、Popular／All Tools；有 query 時依名稱 exact／prefix、tag／alias、description 的穩定權重排序。
- 選擇導航項後關閉 palette 並前往頁面；選擇 action 後執行一次、提供頁面內狀態或 toast，且不因 palette 關閉重複執行。
- IME 組字期間不得攔截 Enter 或誤觸 command；需測試繁體中文輸入。

搜尋資料：

- 初期使用 local static metadata。
- 建議建立 `tools.registry.ts` 作為唯一工具註冊來源。

## 9. 資料與安全原則

- 使用者輸入預設只存在 React state，不寫入 server。
- 不得自動傳送使用者輸入至 API、analytics、logging、error tracking。
- 不要把 secret、JWT、token、private key 寫入 URL query。
- localStorage 僅可儲存偏好設定與匿名本裝置統計，例如 theme、recent tools、layout preference、tool slug usage counts。
- 若儲存最近使用工具，只儲存 tool slug，不儲存輸入內容。
- Crypto 功能優先使用 Web Crypto API。
- Random secret 必須使用 `crypto.getRandomValues`，不得使用 `Math.random`。
- JWT decode 可在 browser 解析 header / payload；verify/sign 需要清楚要求 secret/key，且不得保存。
- 所有錯誤訊息不得包含完整 secret 或 token。

## 10. 工具使用次數統計

網站必須記錄：

- 各個工具的被使用次數。
- 全站工具使用總次數。

### 10.1 統計事件定義

一次「工具使用」定義為：

- 使用者在工具頁產生一次有效輸出；或
- 使用者明確點擊執行按鈕產生結果；或
- 對於即時轉換工具，在 debounce 後由無效狀態轉為有效結果時記錄一次。

不得在每次 keystroke 記錄使用次數。

### 10.2 統計資料範圍

允許記錄：

- `toolSlug`
- `category`
- `usedAt` 或日期 bucket
- count increment

禁止記錄：

- 使用者輸入內容
- 工具輸出內容
- JWT、secret、token、private key
- IP address
- User-Agent 原文
- 可識別個人的 fingerprint

### 10.3 優先實作方式

MVP 必須至少支援本機統計：

- 使用 browser localStorage 或 IndexedDB 記錄本裝置統計。
- localStorage 只保存 tool slug 與 count。
- 首頁或工具列表顯示全站總使用次數時，若沒有後端，只能顯示「本裝置總使用次數」。

本機 storage 規格固定如下：

- Key 使用帶版本的單一 namespace，例如 `developer-tools:usage:v1`。
- Value 只包含 schema version、`total` 與 `tools: Record<ToolSlug, number>`；若保存 `lastUsedAt` 供最近使用，只放在獨立、同樣有版本的 key，且值只包含 slug 與 ISO timestamp。
- 初始化時使用 runtime validation；資料缺失採 0，負數、非整數、`NaN`、未知 slug 或損壞 JSON 必須忽略／修復，不可讓頁面 crash。
- Increment 先以 functional update 更新畫面，再嘗試寫入 storage；storage quota、privacy mode 或存取失敗時工具仍正常運作，並避免反覆 toast 干擾。
- 多分頁需監聽 `storage` event 同步顯示，合併時不得把相同成功事件重複累加。
- 設定頁或統計區提供「清除本裝置使用紀錄」並使用 shadcn Alert Dialog 二次確認；只清除 usage／recent keys，不清除 theme 或其他網站資料。

若需要跨使用者、跨裝置的全站累計，才使用後端：

- 使用 `C:\nginx-1.18.0\react\iistw.com\backend`。
- 僅提供匿名 aggregate counter API。
- API 不接受 raw input/output。
- API payload 僅允許 tool slug 或預先定義的 event name。
- 後端必須 validate tool slug 是否存在於允許清單。
- 後端不得儲存 request body 中的任意額外欄位。

### 10.4 建議 API

只有需要跨裝置統計時才建立：

```http
POST /api/tool-usage
Content-Type: application/json

{
  "toolSlug": "json-formatter"
}
```

```http
GET /api/tool-usage
```

回傳：

```json
{
  "total": 1280,
  "tools": [
    {
      "toolSlug": "json-formatter",
      "count": 320
    }
  ]
}
```

### 10.5 UI 呈現

- 工具列表可顯示每個工具使用次數。
- 首頁可顯示總使用次數。
- 若是 local-only 統計，UI 文案需明確標示為本裝置統計。
- 若使用後端 aggregate 統計，UI 文案可標示為全站統計。
- 統計失敗不得影響工具本身使用。
- 每個 count 使用一致 number formatting；0 顯示 `0`，不可用 `--` 混淆尚未載入與零次。hydration 前可顯示 skeleton，載入後不造成明顯 layout shift。
- Tool Header 成功執行後的 count 應立即更新；Sidebar、工具列表與首頁總數需共享同一 store／hook，不得各自讀取造成不同步。

## 11. 專案目錄建議

```text
src/
  app/
    page.tsx
    tools/
      page.tsx
      [slug]/
        page.tsx
    categories/
      [category]/
        page.tsx
  components/
    app/
      app-shell.tsx
      command-menu.tsx
      tool-sidebar.tsx
    tools/
      tool-layout.tsx
      tool-header.tsx
      tool-panel.tsx
      tool-actions.tsx
      highlighted-code.tsx
      code-output.tsx
      copy-button.tsx
      tool-error.tsx
    ui/
      ...shadcn generated components
  features/
    tools/
      registry.ts
      types.ts
      categories.ts
      usage.ts
    json/
      json-formatter.tsx
      json.logic.ts
      json.test.ts
    config/
      yaml-formatter.tsx
      ini-conf-formatter.tsx
      nginx-conf-formatter.tsx
      config.logic.ts
      config.test.ts
    encoding/
      base64.tsx
      url-codec.tsx
      encoding.logic.ts
      encoding.test.ts
    color/
      color-converter.tsx
      color.logic.ts
      color.test.ts
    jwt/
      jwt-decoder.tsx
      jwt.logic.ts
      jwt.test.ts
    crypto/
      hash-generator.tsx
      crypto.logic.ts
      crypto.test.ts
    datetime/
      timestamp-converter.tsx
      datetime.logic.ts
      datetime.test.ts
  lib/
    result.ts
    clipboard.ts
    download.ts
    storage.ts
    validation.ts
    cn.ts
```

原則：

- `components/ui/` 僅放官方安裝產物。
- 工具核心邏輯放在 `*.logic.ts`。
- React component 不直接塞大量轉換邏輯。
- 測試靠近功能檔案。

Docker 與文件檔案需位於前端專案根目錄：

```text
README.md
Dockerfile
docker-compose.yml
.dockerignore
```

若使用後端 aggregate 統計，需同步確認或補齊後端的 Docker Compose 串接方式。

## 12. TypeScript 規範

嚴格要求：

- 禁止 `any`。
- 禁止 `any[]`。
- 禁止用 `as any` 繞過型別。
- 避免過度使用 type assertion。
- API boundary、parser、storage 讀寫必須有明確型別或 validation。
- 優先使用 discriminated union 表達成功與失敗狀態。

建議共用型別：

```ts
export type ToolCategory =
  | "json"
  | "encoding"
  | "color"
  | "jwt"
  | "crypto"
  | "datetime"
  | "text";

export type ToolExecutionResult<T> =
  | { ok: true; value: T; warnings?: string[] }
  | { ok: false; error: ToolError };

export type ToolError = {
  code: string;
  message: string;
  hint?: string;
};
```

`unknown` 使用規則：

- 外部輸入可先用 `unknown`。
- 必須經過 narrowing、schema validation 或 parser 後才能使用。
- 不得把 `unknown` 直接轉成任意型別。

## 13. Coding Principles

Codex 必須遵守：

- 先閱讀現有專案規範與既有程式碼風格。
- 以現有架構為主，不任意改技術棧。
- 小步提交、聚焦改動。
- 不做 unrelated refactor。
- 不新增不必要 dependency。
- 不建立「萬用」抽象。
- 工具邏輯需可測試、可重用。
- UI 與 business logic 分離。
- 命名要清楚，不使用模糊縮寫。
- 錯誤狀態要顯式處理。
- 避免 silent failure。
- 優先使用標準 Web API 與既有專案 helper。

## 14. 狀態管理與 Validation

### 14.1 狀態管理

- 優先使用 React local state。
- 跨頁偏好可使用 localStorage。
- 不引入 Redux、Zustand、Jotai 等狀態管理工具，除非已有專案慣例或需求明確需要。
- URL 可以保存 tool slug、category、search query，但不得保存使用者輸入的 secret/token。

### 14.2 Validation

- 每個工具都需有輸入驗證。
- 無效輸入不得 throw 到 UI。
- logic function 回傳 `ToolExecutionResult<T>`。
- JSON、JWT、URL、color 等 parser 必須處理 malformed input。
- 表單型工具可使用專案既有 schema validation；若無既有方案，優先保持簡單，不為少量欄位新增大型 dependency。

## 15. 錯誤處理

錯誤訊息需：

- 清楚描述問題。
- 告訴使用者如何修正。
- 不洩漏完整敏感資料。
- 不顯示 raw stack trace。

範例：

```text
Invalid JSON: expected property name after "{". Check whether keys are wrapped in double quotes.
```

不建議：

```text
SyntaxError: Unexpected token...
```

## 16. 可及性

必須做到：

- 所有互動元件可用鍵盤操作。
- 所有 input / textarea 需要 label。
- icon-only button 需要 accessible name。
- command menu 可用鍵盤搜尋與選取。
- toast 不應是唯一回饋；重要錯誤需顯示在頁面上。
- color contrast checker 結果需用文字與數值呈現，不只靠顏色。
- focus state 不可被移除。
- 使用語意化 HTML。
- 以 WCAG 2.2 AA 為目標；一般文字、控制項、focus indicator 與色彩工具 swatch 均需符合適用對比要求。
- 頁首提供 skip link 跳到主要內容；Sidebar、main、navigation、search 使用正確 landmark 與 accessible name。
- Dialog／Sheet／Command 開啟時 focus trap、初始 focus、Escape 與關閉後 focus restoration 必須正常，直接沿用官方元件行為。
- Formatter error 以 `aria-describedby`／適合的 live region 關聯輸入；頻繁即時轉換不得每次按鍵都大聲播報。
- 尊重 `prefers-reduced-motion`，不以動畫作為理解狀態的唯一方式。

## 17. RWD

支援：

- Mobile：360px 起
- Tablet
- Desktop
- Wide desktop

行為：

- 手機版工具輸入與輸出上下排列。
- 桌面版可左右分欄。
- Desktop 與 wide desktop 使用 shadcn 官方 Sidebar，支援完整展開、icon-only 收合與 `SidebarRail`。
- Mobile 與 tablet 的側邊欄行為必須沿用 shadcn Sidebar 官方 mobile Sheet 實作，透過 `SidebarTrigger` 開關；選擇工具後自動關閉，且 focus 回到合理位置。
- 不得另外手刻第二套 mobile navigation，也不得同時顯示 desktop sidebar 與 mobile Sheet。
- Sidebar、header、command palette、工具 toolbar 與主內容在 360px 起均不得重疊、截斷或造成不可預期的水平頁面捲動。
- 手機版程式碼輸出保留行號，長行在 code viewport 內水平捲動，不得撐寬整個頁面。
- 長文字、長 token、長 hash 必須可換行或水平捲動，不得撐破版面。
- 工具列按鈕在窄寬度需自動換行或收合。

驗證 viewport 固定包含：

- Mobile narrow：360 × 800。
- Mobile：390 × 844。
- Tablet：768 × 1024。
- Desktop：1280 × 800。
- Wide desktop：1536 × 960 或更寬。

Layout 決策：

- 小於 shadcn Sidebar desktop breakpoint 時使用官方 mobile Sheet；不得自行選另一個 breakpoint 導致 hydration 前後不同步。
- 工具主內容最大寬度保持適合長程式碼閱讀，但 code viewport 可吃滿可用寬度；頁面左右 padding 在 mobile 至少 12–16px，desktop 依 theme spacing 增加。
- 雙欄輸入／輸出只在每欄仍有可用閱讀寬度時啟用；不足時改上下排列，不用極窄兩欄硬塞。
- 固定 toolbar／header 必須計算 safe area 與自身高度，不能遮住 error、第一行輸入或 anchor target。

## 18. 效能

- 首頁與工具列表使用 static metadata。
- 重型工具邏輯需 lazy load。
- 大輸入處理需避免卡住 UI；必要時 debounce 或使用 Web Worker。
- 避免把所有工具頁 component 一次打包進首頁。
- 不因搜尋功能引入大型 client search dependency；MVP 可用簡單 local filtering。
- large text transform 需考慮輸入大小限制與錯誤提示。
- 初始首頁不得載入所有 parser、color science 與 highlighter grammars；依工具頁 dynamic import，只載入目前 language／feature 所需程式碼。
- 一般 100KB 文字格式化目標在常見桌機上不阻塞互動超過約 100ms；可能較慢的工作顯示 processing state，超過合理門檻改用 Web Worker。
- 預設文字輸入上限建議 1MB；工具可依演算法設定更低／更高上限，但必須在 UI 顯示並在執行前驗證。檔案工具另訂上限與 progress。
- 避免每次 render 重新建立 registry、Shiki highlighter、parser instance 或大型派生陣列；使用 module cache 或適度 memoization，但不要為微小計算堆疊 abstraction。
- Production build 不得有 hydration mismatch、React key warning、unhandled promise rejection 或 browser console error。

## 19. SEO、Metadata、Robots、Sitemap 與 Viewport

### 19.1 全站 SEO 原則

- 使用 Next.js App Router Metadata API，不以散落的手寫 `<head>` tags 管理 metadata。
- 所有可索引頁面必須有唯一 title、description、canonical URL、Open Graph 與 Twitter metadata；內容來自 typed site config 與 `tools.registry.ts`。
- 首頁、分類頁與工具頁需 server render 可理解的 H1、短描述與主要內容摘要。互動工具可使用 client component，但 page shell 不得只輸出空白 loading container。
- SEO 文案以使用者實際能完成的動作為主，明確寫「在瀏覽器本機處理」；不得聲稱絕對安全、匿名、零風險或未實作的功能。
- 每頁只使用一個主要 H1；後續標題依 H2／H3 層級排列，不用 heading 只為放大文字。
- URL slug 使用 lowercase kebab-case、穩定且語意清楚，例如 `/tools/json-formatter`；改名時需提供 permanent redirect，不留下重複頁。
- 禁止 keyword stuffing、隱藏文字、假評價、假下載數與重複生成只換關鍵字的薄內容頁。

### 19.2 Site Config 與環境變數

建立單一 typed site config，至少包含：

```ts
type SiteConfig = {
  name: string;
  shortName: string;
  description: string;
  siteUrl: string;
  locale: "zh_TW";
  ogImagePath: "/og.png";
};
```

- Production canonical origin 由 `NEXT_PUBLIC_SITE_URL` 提供，值必須是無結尾 slash 的完整 `https://` origin。
- 本機開發／Docker 未設定時 fallback 為 `http://localhost:6011`，確保 metadata build 不 crash；README 必須提醒正式部署設定 production URL。
- `metadataBase` 使用驗證後的 `siteUrl`。不可從未信任 request header 直接組 canonical，避免 host header 汙染。
- Production 若仍使用 localhost fallback，build 或啟動 log 需有清楚 warning，但不得阻止 `docker compose up -d --force-recreate` 的本機使用情境。

### 19.3 Root Metadata

Root layout 必須設定：

- `title.default`：`Developer Tools｜工程師工具箱`。
- `title.template`：`%s | Developer Tools`；工具頁傳入短 title 時不可重複變成兩次品牌名稱。
- `description`：簡潔說明 JSON、YAML、Color、JWT、Encoding 等工具與 local-first 特性，建議約 120–160 個可讀字元，但以自然文案優先。
- `applicationName`、`creator`／`publisher`（只有真實資料才填）、`category: "technology"`。
- `alternates.canonical`；若尚未提供真正多語內容，不得產生假的 hreflang。
- `formatDetection` 關閉不必要的 telephone／email／address 自動辨識。
- `icons` 指向實際存在的 favicon、Apple touch icon；缺少時需產出簡潔品牌 icon，不可引用不存在檔案。
- `manifest` 指向 `/site.webmanifest`。
- `openGraph.type: "website"`、site name、locale `zh_TW`、title、description、canonical URL、OG image。
- `twitter.card: "summary_large_image"`、title、description、image；沒有真實 Twitter account 時不填 `site`／`creator` handle。

### 19.4 Page-level Metadata

- 首頁 title 使用 root default，不再附加重複 suffix；description 描述完整工具箱與 local-first。
- `/tools` title 使用「所有工具」，description 說明可搜尋與依分類瀏覽。
- `/categories/[category]` 從 category registry 產生 category 名稱、描述與 canonical；未知 category 回傳 404。
- `/tools/[slug]` 從 registry 產生 tool-specific title、description、keywords／aliases（如使用）、canonical、OG title 與 OG description；未知或 disabled slug 回傳 404 並不得出現在 sitemap。
- 工具 title 建議格式：`JSON Formatter`；套用 template 後為 `JSON Formatter | Developer Tools`。
- 工具 description 必須具體，例如「在瀏覽器本機格式化、驗證與壓縮 JSON，支援行號與語法高亮。」不可所有頁共用同一句空泛描述。
- 搜尋結果、使用者可變 filter query 與 command state 不建立獨立 canonical；canonical 指回乾淨 route，避免 query 組合產生重複索引。
- 404、錯誤頁、尚未完成工具與任何內部 preview route 設定 `noindex, nofollow`。

### 19.5 Open Graph Image

- 已產出正式 OG image：`C:\nginx-1.18.0\react\iistw.com\toolbox\public\og.png`。
- 固定尺寸為 `1200 × 630` PNG，aspect ratio 約 1.91:1；檔案不得在實作時被 placeholder 覆蓋。
- Root、首頁、分類頁與尚未有專屬圖片的工具頁共用 `/og.png`。
- Metadata 必須提供 absolute image URL、`width: 1200`、`height: 630`、`type: "image/png"` 與 alt：`Developer Tools 工程師工具箱介面，包含程式碼格式化、色彩、JWT 與 Command Palette`。
- 圖上文字已包含產品名稱與主要能力；頁面 title／description 仍需完整，不能只靠圖片傳達內容。
- 未來若建立動態 tool OG image，需維持 1200×630、安全邊界、可讀字級與品牌一致，且不得把使用者輸入渲染進圖片。

### 19.6 Robots

使用 App Router `src/app/robots.ts` 產生 robots 設定：

- Production 且 `NEXT_PUBLIC_SITE_URL` 為正式 `https://` 網址時，允許一般 crawler 索引公開頁面，並提供 absolute sitemap URL。
- Development、preview、localhost 或非 production deployment 預設 `Disallow: /`，避免測試站被索引。
- 不使用 robots.txt 保護秘密；任何敏感路由仍需真正 authorization。本專案 MVP 不應存在管理或 secret route。
- 不封鎖必要的 Next.js static assets、OG image、favicon 或可索引頁面渲染所需資源。
- Robots 內容需有 unit test，分別驗證 production 與 non-production 分支。

### 19.7 Sitemap

使用 App Router `src/app/sitemap.ts` 產生 sitemap：

- 包含首頁、`/tools`、所有 enabled category pages 與所有 enabled tool pages。
- URL 必須 absolute 並使用經驗證的 production `siteUrl`；不得輸出 localhost 到正式 sitemap。
- 不包含 query URLs、404、disabled／Coming Soon tools、command state、API routes 或 client-only pseudo routes。
- `lastModified` 必須有真實來源；若無每頁內容日期，使用可重現的 build／release date 或省略，不可每次 request 都寫現在時間造成假更新。
- `changeFrequency`／`priority` 只有能合理維護時才填；首頁可高於工具頁，但不可假裝影響搜尋排名。
- Sitemap 需有測試，確保 registry 中每個 enabled tool 恰好出現一次、disabled tool 不出現、URL 無重複且皆為 absolute HTTPS production URL。

### 19.8 Viewport 與 Theme Color

使用 Next.js `Viewport` export，不把 viewport 塞進一般 metadata object：

- `width: "device-width"`。
- `initialScale: 1`。
- 不設定 `maximumScale: 1`、`userScalable: false`，必須允許使用者縮放。
- 使用 `viewportFit: "cover"` 以支援有 safe area 的裝置；sticky header／mobile Sheet 需配合 safe-area inset。
- `themeColor` 依 light／dark media query 提供與 theme token 一致的顏色，不使用不相關的高飽和品牌色。
- 不使用以 viewport width 動態縮放字體的做法；瀏覽器放大到 200% 時內容仍可操作且不重疊。

### 19.9 Manifest、Icons 與 PWA 邊界

- 提供 `src/app/manifest.ts` 或等價靜態 `site.webmanifest`，包含 name、short_name、description、start_url、display、background_color、theme_color 與實際存在的 icons。
- `display` 可使用 `standalone`，但本需求不代表必須建立 service worker、offline cache 或可安裝 PWA；沒有完整 offline strategy 時不得宣稱離線可用。
- Icons 至少涵蓋 favicon 與 Apple touch icon；manifest icon 使用正確尺寸與 MIME type，不得將 1200×630 OG 圖當 app icon。

### 19.10 Structured Data

- 首頁可輸出 `WebSite` 與 `SoftwareApplication`／`WebApplication` JSON-LD；工具頁可輸出對應 `WebApplication`，內容需與可見頁面一致。
- 只填真實欄位：name、url、description、applicationCategory、operatingSystem（例如 `Any`）與 offers（只有確實免費時可標示價格 0 與 currency）。
- 不填虛構 aggregateRating、review、downloadCount、author 或 organization logo。
- JSON-LD 必須安全 serialize，將 `<` 等危險字元 escape；不得把使用者輸入、formatter output 或 query text放入結構化資料。

### 19.11 SEO 驗收與測試

- Production build 後抽查首頁、工具列表、至少一個 category 與至少三個 tool pages 的 rendered head。
- Unit tests 覆蓋 site URL validation、title template、tool metadata、robots environment branches、sitemap registry mapping 與 viewport export。
- E2E 驗證 canonical、description、Open Graph image absolute URL、robots、sitemap、manifest 與 OG image HTTP 200。
- 使用 Lighthouse 或等價工具檢查 SEO 與 accessibility；SEO 類別目標 100，若受工具限制未達成需記錄具體原因。
- 確認 `public/og.png` 回傳 `image/png`、實際尺寸 1200×630、無 404，且社群預覽重要文字未被常見安全裁切區截斷。

## 20. 測試

### 20.1 Unit Tests

每一個完成且註冊於 `tools.registry.ts` 的工具都必須有 unit tests。不得只測少數代表工具；若新增工具但未新增對應測試，CI 必須失敗。

每個工具至少測試：

- 一個正常輸入與預期輸出。
- 一個無效輸入與結構化錯誤。
- 空值、最小值、最大合理輸入或其他適用邊界值。
- Unicode、換行、特殊字元與 round-trip；不適用時需在測試名稱或註解說明原因。
- 不可變性：輸入資料不應被意外修改。
- 使用成功時 usage count 只增加一次；驗證失敗或單純按鍵輸入不得重複計數。

類別必測案例：

- JSON formatter / validator / minifier
- YAML formatter / validator，以及 JSON / YAML round-trip
- INI / `.conf` formatter / validator，保留 comments 與 section
- Nginx CONF formatter，涵蓋 nested blocks、directives、comments 與 malformed braces
- Base64 encode / decode unicode 字元
- URL encode / decode
- HEX / RGB(A) / HSL(A) / HSV / HWB / CMYK conversion
- LAB / LCH / OKLab / OKLCH / XYZ conversion、alpha、精度與超出 sRGB 色域狀態
- CSS named colors、CSS Color 4 格式與 malformed color
- Contrast ratio
- JWT decode malformed token
- JWT exp handling
- Hash deterministic output
- Timestamp timezone / ISO conversion
- Secret generator length / charset

測試原則：

- 優先使用專案既有 test runner；新專案預設使用 Vitest。React component tests 使用 Testing Library。
- Formatter 與 converter 採 table-driven tests，避免大量難維護的重複測試。
- Random、時間與 storage dependency 必須可注入或 mock，使測試可重現。
- Parser／formatter 需使用固定 fixtures 或 golden outputs，並補 round-trip／idempotency 測試：再次 format 結果不應改變。
- Coverage 是輔助指標，不可取代案例品質；tool logic 目錄需維持至少 95% line／function coverage 與 90% branch coverage。

### 20.2 Component Tests

至少測：

- Tool page input -> output
- Invalid input error
- Copy button state
- Command menu search
- Command palette 執行目前工具 action
- Sidebar 展開、收合、active state 與 mobile open／close
- Highlighted code 顯示語言、逐行行號，且 copy 不包含行號
- Formatter output 正確選用 syntax grammar
- Usage count 顯示各工具次數與總次數

### 20.3 E2E Tests

至少涵蓋：

- 開啟首頁
- 使用搜尋進入工具
- JSON format 成功
- Base64 encode/decode 成功
- JWT decode 顯示 payload 與 decode warning
- 工具使用後 usage count 增加
- `Ctrl/Cmd+K` 開啟 shadcn Command、搜尋工具並執行工具 action
- Desktop sidebar 可收合，mobile sidebar 可開啟、選取與自動關閉
- JSON、YAML 與 Nginx CONF formatter 輸出有語法高亮與行號
- 360px mobile、tablet、desktop 與 wide desktop viewport 無版面破裂或 UI 重疊

### 20.4 測試交付與執行

- `package.json` 必須提供至少 `test`、`test:watch`、`test:coverage` 與 `test:e2e` scripts。
- `npm test` 必須能以 non-watch 模式執行全部 unit tests，失敗時回傳非零 exit code。
- 測試不得依賴外部網路、真實時間、真實 clipboard 或不可控第三方服務。
- Docker build 前或 CI 中必須執行 lint、typecheck 與 unit tests。
- README 必須列出所有測試指令、測試範圍與新增工具時應補的測試案例。

## 21. README.md 交付要求

Codex 必須輸出完整 `README.md`，且放在 `C:\nginx-1.18.0\react\iistw.com\toolbox\README.md`。

README 必須包含：

- 專案名稱與簡介。
- 技術棧。
- local-first 與 privacy 說明。
- 工具分類與已完成工具清單。
- 安裝方式。
- 本機開發啟動方式。
- Docker Compose 啟動方式。
- 測試、lint、typecheck 指令。
- 環境變數說明。
- 固定 port `6011`、`http://localhost:6011`，以及同層專案已使用 port inventory。
- 使用次數統計說明，本機統計或後端 aggregate 統計需寫清楚。
- 後端使用條件與資料安全邊界。
- UI component 來源規則：shadcn/ui 優先，缺少才用 Dice UI。
- shadcn 官方 Sidebar 與 Command palette 的操作方式。
- 程式碼語法高亮、行號與支援的 formatter languages。
- SEO、metadata、canonical、robots、sitemap、manifest、viewport 與 `NEXT_PUBLIC_SITE_URL` 部署設定。
- 正式 OG image `public/og.png` 的尺寸、用途與 alt text。
- 新增工具的步驟。
- 每個工具必要的 unit test、component test 與執行方式。
- 已知限制。

README 中必須明確列出：

```bash
docker compose up -d --force-recreate
```

並說明該指令可以直接啟動網站。

## 22. Docker Compose 交付要求

Codex 必須讓以下指令可在 `C:\nginx-1.18.0\react\iistw.com\toolbox` 直接啟動網站：

```bash
docker compose up -d --force-recreate
```

最低要求：

- 前端專案根目錄必須有 `Dockerfile`。
- 前端專案根目錄必須有 `docker-compose.yml`。
- 前端專案根目錄必須有 `.dockerignore`。
- Docker build 必須可重現安裝 dependencies。
- Container 啟動後需 expose Next.js production server。
- Toolbox container 內外一律使用 `6011`，Compose mapping 固定為 `6011:6011`，service／container name 不得與既有專案重複。
- `package.json` 的 `dev` 與 `start` scripts 必須明確使用 port `6011`；server hostname 在 container 內使用 `0.0.0.0`。
- `docker compose up -d --force-recreate` 不得依賴手動額外步驟。
- README 必須寫明預設 port 與開啟網址。
- Compose 必須有 health check，檢查 `http://127.0.0.1:6011/` 或專用無副作用 health route，並給 Next.js build／start 足夠 start period。

建議：

- 使用 multi-stage Dockerfile。
- 使用 `npm ci`，若專案使用其他 package manager，需依 lockfile 選擇對應安裝方式。
- Next.js 建議啟用 standalone output，降低 production image 體積。
- docker-compose service name 建議為 `toolbox`。

Port inventory（已於 2026-08-21 掃描 `C:\nginx-1.18.0\react\iistw.com`）：

- `6001`：backend。
- `6002`：frontend。
- `6003`：admin。
- `6004`：blog-v2。
- `6006`：blog。
- `6010`：qr-code-generator。
- `6011`：保留給 toolbox。

實作者不得選用上述其他專案已占用的 port。Docker 驗證前需再次確認 `6011`；若當下被非專案程序暫時占用，應回報該 process，不得靜默改掉專案固定 port 造成 Nginx／README 不一致。

若需要後端 aggregate usage counter：

- `docker-compose.yml` 需能同時啟動前端與必要後端，或清楚串接既有 backend compose。
- 前端需透過環境變數設定 API base URL。
- 後端不可成為工具使用的必要條件；後端統計失敗時，工具仍要可用。

## 23. 禁止事項

- 禁止使用 `any`、`any[]`、`as any`。
- 禁止自行仿製 shadcn/ui 或 Dice UI 官方元件。
- 禁止引入其他 UI library。
- 禁止把使用者輸入自動送到後端或第三方。
- 禁止記錄 secret、token、JWT、private key。
- 禁止把敏感輸入存在 URL。
- 禁止為了少量工具建立過度抽象 framework。
- 禁止 unrelated refactor。
- 禁止在 `components/ui/` 手動魔改官方元件。
- 禁止自行仿製 sidebar 或 command palette；必須使用 shadcn/ui 官方 `sidebar` 與 `command`。
- 禁止以無語法高亮、無行號的純文字區塊呈現程式碼或 formatter 輸出。
- 禁止把 DOM／HTML 的行號一起複製到使用者 clipboard。
- 禁止用不明確的單一 `CONF` parser 靜默處理所有設定檔語法。
- 禁止使用 `Math.random` 產生 secret、token、key。
- 禁止在錯誤訊息中顯示完整敏感資料。
- 禁止只做 landing page 而沒有可用工具。
- 禁止統計或儲存工具輸入與輸出內容。
- 禁止讓使用次數統計失敗阻止工具正常執行。
- 禁止交付無法用 `docker compose up -d --force-recreate` 啟動的專案。
- 禁止缺少完整 `README.md`。
- 禁止使用 `3000` 或其他已占用 port 取代 toolbox 固定 port `6011`。
- 禁止遺漏 canonical、robots、sitemap、viewport 或將 localhost URL 輸出到 production sitemap。
- 禁止覆蓋已產出的 `public/og.png`，除非使用者明確要求重新設計。
- 禁止註冊沒有對應 unit tests 的工具。
- 禁止以 snapshot-only tests 取代 formatter／converter 的明確輸入輸出 assertions。

## 24. Definition of Done

MVP 完成需滿足：

- P0 工具已實作。
- 全站 command menu 可使用 `Ctrl/Cmd+K` 開啟。
- 全站使用 shadcn/ui 官方 Sidebar，desktop 可收合，mobile 使用官方 mobile Sheet 行為。
- Command palette 使用 shadcn/ui 官方 `command`，可搜尋、跳轉並執行目前工具支援的動作。
- 工具 metadata 統一註冊。
- 每個工具有清楚輸入、輸出、錯誤與 copy 行為。
- 所有處理預設在瀏覽器完成。
- UI 元件來源符合 shadcn/ui / Dice UI 規則。
- TypeScript 無 `any`、`any[]`、`as any`。
- lint 通過。
- typecheck 通過。
- unit tests 通過。
- 每個已註冊工具都有正常、錯誤、邊界與適用 round-trip unit tests。
- tool logic coverage 達到至少 95% line／function 與 90% branch。
- 至少關鍵 E2E tests 通過。
- 所有程式碼與 formatter 輸出都有正確語法高亮及從 1 開始的行號，copy 不含行號。
- 360px mobile、tablet、desktop 與 wide desktop 版面已驗證，無重疊或破版。
- 沒有把使用者輸入傳到伺服器或第三方。
- 工具使用次數統計已完成，且至少支援本裝置統計。
- 各工具使用次數與總使用次數可被讀取與顯示。
- 統計資料不包含任何輸入、輸出、secret、token 或可識別個人資料。
- 完整 `README.md` 已產出。
- `README.md` 說明 local-first、安全限制、使用次數統計與 Docker 啟動方式。
- `README.md` 說明固定 port `6011`、production site URL 與完整 SEO 設定。
- `Dockerfile`、`docker-compose.yml`、`.dockerignore` 已產出。
- 在 `C:\nginx-1.18.0\react\iistw.com\toolbox` 執行 `docker compose up -d --force-recreate` 可直接啟動網站。
- `http://localhost:6011` 可開啟且 Compose health check 通過。
- Root／tool metadata、canonical、Open Graph、Twitter、robots、sitemap、manifest 與 viewport 均已實作並測試。
- `public/og.png` 保持 1200×630，metadata 可正確存取並具有描述性 alt。

## 25. Codex 實作順序

1. 讀取 `AGENTS.md`、README、package scripts、lint/test config、現有 coding principles。
2. 確認前端目錄為 `C:\nginx-1.18.0\react\iistw.com\toolbox`。
3. 確認後端可用目錄為 `C:\nginx-1.18.0\react\iistw.com\backend`，但只有必要時才使用。
4. 確認 Next.js、Tailwind v4、TypeScript、shadcn/ui 狀態。
5. 確認 theme 已套用 `npx shadcn@latest apply --preset b1Z5bahMm --only theme`；若已套用，不重複破壞既有設定。
6. 依官方方式安裝必要 shadcn/ui 元件。
7. 只在 shadcn/ui 缺少元件時，依官方方式安裝必要 Dice UI 元件。
8. 使用 shadcn 官方 `sidebar` 建立 responsive app shell；驗證 desktop collapse 與官方 mobile Sheet 行為。
9. 使用 shadcn 官方 `command`／`dialog` 建立 command palette、搜尋與工具 actions。
10. 建立工具 metadata registry 與分類。
11. 建立統一的 syntax highlighting／line number component，驗證 copy 不含行號。
12. 建立工具 usage count 模組，至少支援 localStorage 本裝置統計。
13. 若明確需要全站 aggregate 統計，才在 `backend` 建立匿名 counter API。
14. 建立首頁、工具列表頁、工具詳情頁與共用 tool layout／actions。
15. 先實作 P0 的 JSON、YAML、INI／CONF、Nginx CONF、Encoding、Color、JWT。
16. 再實作 Hash / Crypto、Date / Time、Text tools。
17. 每完成一個工具，立即補齊該工具的 unit tests，不得最後才集中補測試。
18. 補 component / E2E tests，包含 Sidebar、Command、syntax highlight、line number 與 RWD。
19. 建立 typed site config、root／page metadata、viewport、robots、sitemap、manifest 與 JSON-LD。
20. 串接既有 `public/og.png`，驗證 1200×630、alt、absolute URL 與 HTTP content type；不得重新生成或覆蓋。
21. 建立完整 `README.md`，包含 port inventory、SEO production 設定與測試說明。
22. 建立 `Dockerfile`、`docker-compose.yml`、`.dockerignore`，全程固定 port `6011` 並加入 health check。
23. 執行 lint、typecheck、unit tests、coverage 與 E2E tests。
24. 執行 production build，確認 metadata／robots／sitemap／manifest 與所有 enabled static routes 可產生。
25. 執行 `docker compose up -d --force-recreate`，等待 health check 通過並驗證 `http://localhost:6011`。
26. 檢查 `any`、`any[]`、`as any` 是否存在。
27. 檢查是否有非允許 UI library 或自行仿製的 shadcn 元件。
28. 檢查是否有不必要後端或資料外送。
29. 檢查 usage count 是否只記錄 tool slug 與 count。
30. 檢查 360px mobile、tablet、desktop、wide desktop RWD 與無 UI 重疊。
31. 確認 registry 中每個工具都有對應 unit tests，最後整理實作摘要、實際驗證結果與剩餘風險。

## 26. 實作備註

- 若現有 repo 已有不同目錄慣例，優先沿用既有慣例，再映射本文件要求。
- 若工具數量過多，先以 registry 支援所有 P0 metadata，再逐步實作 P0 tool UI。
- 若某功能涉及安全誤解，例如 JWT、hash、encryption，UI 必須保留短提醒。
- 若發現官方 shadcn/ui 或 Dice UI API 有版本差異，以當前專案安裝版本與官方文件為準。
