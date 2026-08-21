"use client";

import { useTranslations } from "next-intl";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("common");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        <footer className="mx-4 border-t py-5 text-center text-sm text-muted-foreground md:mx-6">
          <span>© 2026 </span>
          <a className="font-medium underline-offset-4 hover:text-foreground hover:underline" href="https://iistw.com" target="_blank" rel="noreferrer">{t("company")}</a>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
