import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/SiteShell";
import { ContentBody, getPublishedBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedBySlug(slug);
  if (!item) return { title: "Content not found" };
  return { title: item.seo_title || item.title, description: item.seo_description || item.excerpt || undefined, openGraph: { title: item.seo_title || item.title, description: item.seo_description || item.excerpt || undefined, images: item.cover_image_path ? [item.cover_image_path] : undefined } };
}
export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedBySlug(slug);
  if (!item) notFound();
  const kindLabel = item.kind === "teaching" ? "Faith-based teaching" : item.kind === "article" ? "Thought leadership" : item.kind;
  return <Shell><main><section className="pagehero"><div className="wrap"><div className="eyebrow">{kindLabel}</div><h1>{item.title}</h1>{item.excerpt && <p className="lead">{item.excerpt}</p>}<p className="muted small">{item.published_at ? new Date(item.published_at).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" }) : ""}</p></div></section><section className="section"><article className="wrap content content-article">{item.cover_image_path && <img className="article-cover" src={item.cover_image_path} alt="" />}<ContentBody markdown={item.body_markdown} />{item.tags?.length ? <p className="muted small">Topics: {item.tags.join(" · ")}</p> : null}</article></section></main></Shell>;
}
