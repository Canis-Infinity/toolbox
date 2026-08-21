import { ToolCardLink } from "@/components/tool-card-link";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import { tools } from "@/lib/tools/registry";

export const metadata = {
  title: "全部工具",
  description: "瀏覽所有 Developer Tools。"
};

export default async function ToolsPage() {
  const t = await getTranslations("common");
  const tc = await getTranslations("category");
  return (
    <div className="grid gap-4">
      <h1 className="text-3xl font-semibold">{t("allTools")}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <ToolCardLink
            href={`/tools/${tool.slug}`}
            title={tool.name}
            titleKey={tool.slug}
            description={tool.description}
            descriptionKey={tool.slug}
            label={<Badge variant="outline">{tc(`${tool.category}.name`)}</Badge>}
            key={tool.slug}
          />
        ))}
      </div>
    </div>
  );
}
