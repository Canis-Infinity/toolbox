"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { categories, tools } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const tc = useTranslations("category");
  const tn = useTranslations("toolName");
  const toolSlug = pathname.startsWith("/tools/") ? pathname.slice("/tools/".length) : undefined;
  const tool = toolSlug ? tools.find((item) => item.slug === toolSlug) : undefined;
  const categorySlug = pathname.startsWith("/categories/") ? pathname.slice("/categories/".length) : tool?.category;
  const category = categorySlug && categorySlug in categories ? (categorySlug as ToolCategory) : undefined;

  if (pathname === "/") {
    return <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>{t("home")}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>;
  }

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem><BreadcrumbLink render={<Link href="/" />}>{t("home")}</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        {category ? (
          <>
            <BreadcrumbItem className="hidden sm:inline-flex">
              {tool ? <BreadcrumbLink render={<Link href={`/categories/${category}`} />}>{tc(`${category}.name`)}</BreadcrumbLink> : <BreadcrumbPage>{tc(`${category}.name`)}</BreadcrumbPage>}
            </BreadcrumbItem>
            {tool ? <BreadcrumbSeparator className="hidden sm:list-item" /> : null}
          </>
        ) : null}
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate">{tool ? tn(tool.slug) : pathname === "/tools" ? t("allTools") : t("page")}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
