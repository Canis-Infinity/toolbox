# Developer Toolbox 備援頁

正常連線時在 HTTPS（本機可使用 localhost）安裝 `/sw.js`，僅快取本站獨立的 `/offline.html`。備援頁使用內嵌樣式與圖示，不依賴 Next.js、API 或外部字體。

頁面導覽斷網或收到 502／503／504 時顯示備援頁。API、登入狀態、表單及業務頁面不快取；一般 404 維持原回應。可直接開啟 `/offline` 預覽。

執行 `docker compose up -d --force-recreate` 後需等待安裝及建置完成。首次部署完成後先正常造訪並等待 Service Worker 啟用，再測試重啟；一般重新整理不可選用略過 Service Worker。Nginx 必須保留 502 等狀態碼，不可導向不存在的錯誤頁。

修改備援頁時同步增加 `public/sw.js` 的快取版本。快取新版本成功後才清理舊版；使用者無須清除整站資料。

回歸測試：`node --test scripts/offline-check.mjs`，涵蓋安裝失敗、502／503／504、斷網、404 與 API 排除。
