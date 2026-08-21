import Link from "next/link";
import { useTranslations } from "next-intl";
import { ToolCardLink } from "@/components/tool-card-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories, tools } from "@/lib/tools/registry";

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("category");
  const tn = useTranslations("toolName");
  const featured = tools.slice(0, 12);

  return (
    <div className="grid gap-6">
      <header className="border-b pb-8 pt-2">
          <Badge className="w-fit" variant="outline">{t("localFirst")}</Badge>
          <h1 className="mt-4 text-3xl font-semibold md:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">
            {t("description")}
          </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button render={<Link href="/tools" />}>{t("start")}</Button>
          <Button variant="outline" render={<Link href="/tools/json-formatter" />}>{tn("json-formatter")}</Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {Object.keys(categories).map((slug) => (
          <ToolCardLink href={`/categories/${slug}`} title={tc(`${slug}.name`)} description={tc(`${slug}.description`)} key={slug} />
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-semibold">{t("featured")}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((tool) => (
            <ToolCardLink href={`/tools/${tool.slug}`} title={tool.name} titleKey={tool.slug} description={tool.description} descriptionKey={tool.slug} key={tool.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
