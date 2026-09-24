import { renderToStaticMarkup } from "react-dom/server";
import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

export const markup = renderToStaticMarkup(
  <div className="flex min-h-svh flex-col bg-background text-foreground">
    <header className="border-b px-6 py-4 text-sm font-semibold">
      Developer Toolbox
    </header>
    <main className="flex flex-1 items-center justify-center p-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WifiOff />
          </EmptyMedia>
          <EmptyTitle>
            <h1 id="title">暫時無法開啟網站</h1>
          </EmptyTitle>
          <EmptyDescription>
            網路可能已中斷，或服務正在啟動。
            <br />
            請確認連線，稍後再試。
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <form action="/" method="get">
            <Button type="submit">
              <RefreshCw data-icon="inline-start" />
              重新開啟網站
            </Button>
          </form>
        </EmptyContent>
      </Empty>
    </main>
    <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
      Developer Toolbox · 服務恢復後即可繼續使用
    </footer>
  </div>
);
