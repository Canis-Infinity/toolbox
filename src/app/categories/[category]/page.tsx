import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolCardLink } from "@/components/tool-card-link";
import { categories, getToolsByCategory } from "@/lib/tools/registry";
import type { ToolCategory } from "@/lib/tools/types";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  return {
    title: categories[category].name,
    description: categories[category].description
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const list = getToolsByCategory(category);
  const tc = await getTranslations("category");

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-semibold">{tc(`${category}.name`)}</h1>
        <p className="text-muted-foreground">{tc(`${category}.description`)}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((tool) => (
          <ToolCardLink href={`/tools/${tool.slug}`} title={tool.name} titleKey={tool.slug} description={tool.description} descriptionKey={tool.slug} key={tool.slug} />
        ))}
      </div>
    </div>
  );
}

function isCategory(value: string): value is ToolCategory {
  return value in categories;
}
