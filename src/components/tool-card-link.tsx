"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ToolCardLink({ href, title, titleKey, description, descriptionKey, label }: { href: string; title: string; titleKey?: string; description: string; descriptionKey?: string; label?: React.ReactNode }) {
  const locale = useLocale();
  const td = useTranslations("toolDescription");
  const tn = useTranslations("toolName");
  const localizedDescription = locale === "en" && descriptionKey ? td(descriptionKey) : description;
  const localizedTitle = titleKey ? tn(titleKey) : title;
  return (
    <Link href={href} prefetch={false} className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className="h-full transition-colors hover:bg-muted/50" size="sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>{localizedTitle}</CardTitle>
            {label}
          </div>
          <CardDescription>{localizedDescription}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
