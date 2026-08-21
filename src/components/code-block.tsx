"use client";

import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, language, compact = false, large = false }: { code: string; language: string; compact?: boolean; large?: boolean }) {
  const t = useTranslations("workbench");
  const lines = code ? code.split("\n") : [""];

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline">{language}</Badge>
        <Button variant="outline" type="button" onClick={() => navigator.clipboard.writeText(code)}>
          <Copy size={16} /> {t("copy")}
        </Button>
      </div>
      <pre className={cn("code", compact ? "min-h-24" : large ? "min-h-80" : "min-h-40")} aria-label={`${language} output`}>
        {lines.map((line, index) => (
          <span className="code-line" key={`${index}-${line}`}>
            <span className="line-no">{index + 1}</span>
            <code>{line || " "}</code>
          </span>
        ))}
      </pre>
    </div>
  );
}
