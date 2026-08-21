"use client";

import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { DesktopPreferences } from "@/components/preference-controls";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const CommandPalette = dynamic(() => import("@/components/command-palette").then((module) => module.CommandPalette), { ssr: false });

export function AppHeader() {
  const t = useTranslations("common");
  const isMobile = useIsMobile();
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    if (isMobile) return;
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isMobile]);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 flex-nowrap items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2"><SidebarTrigger /><AppBreadcrumb /></div>
        <div className="hidden min-w-0 items-center gap-2 md:flex">
          <Button aria-label={t("search")} className="h-8" size="sm" variant="outline" onClick={() => setCommandOpen(true)}>
            <Search /><span className="hidden sm:inline">{t("search")}</span><kbd className="ml-1 hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:inline">Ctrl K</kbd>
          </Button>
          <DesktopPreferences />
        </div>
      </header>
      {commandOpen ? <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} /> : null}
    </>
  );
}
