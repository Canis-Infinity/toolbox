import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolWorkbench } from "@/components/tool-workbench";
import { getTool, tools } from "@/lib/tools/registry";
import { getCanonical, getSiteUrl, siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const siteUrl = getSiteUrl();
  return {
    title: tool.name,
    description: tool.description,
    keywords: [...tool.tags, ...tool.aliases],
    alternates: {
      canonical: getCanonical(`/tools/${tool.slug}`)
    },
    openGraph: {
      title: `${tool.name} | Developer Tools`,
      description: tool.description,
      url: getCanonical(`/tools/${tool.slug}`),
      images: [
        {
          url: `${siteUrl}/og.png`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: siteConfig.ogAlt
        }
      ]
    }
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  return <ToolWorkbench tool={tool} />;
}
