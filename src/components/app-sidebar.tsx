"use client";

import { ChevronRight, Code2, Coffee, ExternalLink, House, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileSidebarPreferences } from "@/components/preference-controls";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail
} from "@/components/ui/sidebar";
import { ToolIcon } from "@/components/tool-icon";
import { categories, tools } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const tc = useTranslations("category");
  const tnn = useTranslations("toolNavName");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu><SidebarMenuItem>
          <SidebarMenuButton render={<Link href="/" />} size="lg" tooltip="Developer Tools">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Code2 className="size-4" /></div>
            <div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">Developer Tools</span><span className="truncate text-xs">{t("brandSubtitle")}</span></div>
          </SidebarMenuButton>
        </SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation")}</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>
            <SidebarMenuItem><SidebarMenuButton render={<Link href="/" />} isActive={pathname === "/"} tooltip={t("home")}><House /><span>{t("home")}</span></SidebarMenuButton></SidebarMenuItem>
            <SidebarMenuItem><SidebarMenuButton render={<Link href="/tools" />} isActive={pathname === "/tools"} tooltip={t("allTools")}><Search /><span>{t("allTools")}</span></SidebarMenuButton></SidebarMenuItem>
          </SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("categories")}</SidebarGroupLabel>
          <SidebarGroupAction render={<Link href="/tools" />} aria-label={t("browseAll")} title={t("browseAll")}><LayoutGrid /></SidebarGroupAction>
          <SidebarGroupContent><SidebarMenu>
            {(Object.keys(categories) as ToolCategory[]).map((category) => (
              <SidebarCategory key={category} category={category} pathname={pathname} categoryName={tc(`${category}.name`)} toolName={(slug) => tnn(slug)} />
            ))}
          </SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <MobileSidebarPreferences />
        <SidebarMenu><SidebarMenuItem>
          <SidebarMenuButton render={<a href="https://www.buymeacoffee.com/iistw22788" target="_blank" rel="noreferrer" />} tooltip={t("buyMeACoffee")}><Coffee /><span>{t("buyMeACoffee")}</span><ExternalLink className="ml-auto group-data-[collapsible=icon]:hidden" /></SidebarMenuButton>
        </SidebarMenuItem></SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarCategory({ category, pathname, categoryName, toolName }: {
  category: ToolCategory;
  pathname: string;
  categoryName: string;
  toolName: (slug: string) => string;
}) {
  const categoryTools = tools.filter((tool) => tool.category === category);
  const active = pathname === `/categories/${category}` || categoryTools.some((tool) => pathname === `/tools/${tool.slug}`);
  const [open, setOpen] = useState(active || (pathname === "/" && category === "json"));

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger render={<SidebarMenuButton tooltip={categoryName} isActive={active} />}>
          <ToolIcon category={category} /><span>{categoryName}</span>
          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent><SidebarMenuSub>
          {categoryTools.map((tool) => (
            <SidebarMenuSubItem key={tool.slug}>
              <SidebarMenuSubButton
                className="h-auto min-h-7 items-start py-1.5 [&>span:last-child]:overflow-visible! [&>span:last-child]:text-clip! [&>span:last-child]:whitespace-normal!"
                render={<Link href={`/tools/${tool.slug}`} prefetch={false} />}
                isActive={pathname === `/tools/${tool.slug}`}
              ><span>{toolName(tool.slug)}</span></SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub></CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
