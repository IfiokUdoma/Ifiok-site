import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export type ContentEntry = {
  id: string; title: string; slug: string; kind: string; status: string;
  excerpt: string | null; body_markdown: string | null; cover_image_path: string | null;
  seo_title: string | null; seo_description: string | null; tags?: string[] | null;
  published_at: string | null; created_at: string;
};

export async function getPublishedContent(kinds?: string[], limit = 50): Promise<ContentEntry[]> {
  try {
    const sb = await createClient();
    if (!sb) return [];
    let query = sb.from("content").select("id,title,slug,kind,status,excerpt,body_markdown,cover_image_path,seo_title,seo_description,tags,published_at,created_at").eq("status", "published").order("published_at", { ascending: false }).limit(limit);
    if (kinds?.length) query = query.in("kind", kinds);
    const { data, error } = await query;
    if (error) { console.error("Unable to load published content", error.message); return []; }
    return (data || []) as ContentEntry[];
  } catch (error) {
    console.error("Unable to load published content", error);
    return [];
  }
}

export async function getPublishedBySlug(slug: string): Promise<ContentEntry | null> {
  try {
    const sb = await createClient();
    if (!sb) return null;
    const { data, error } = await sb.from("content").select("id,title,slug,kind,status,excerpt,body_markdown,cover_image_path,seo_title,seo_description,tags,published_at,created_at").eq("slug", slug).eq("status", "published").maybeSingle();
    if (error) { console.error("Unable to load content", error.message); return null; }
    return data as ContentEntry | null;
  } catch { return null; }
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    return part;
  });
}

export function ContentBody({ markdown }: { markdown: string | null }) {
  const lines = (markdown || "").split(/\r?\n/);
  const nodes: React.ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flushParagraph = () => { if (paragraph.length) { nodes.push(<p key={`p-${nodes.length}`}>{inline(paragraph.join(" "))}</p>); paragraph = []; } };
  const flushList = () => { if (list.length) { nodes.push(<ul key={`ul-${nodes.length}`}>{list.map((x, i) => <li key={i}>{inline(x)}</li>)}</ul>); list = []; } };
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) { flushParagraph(); flushList(); return; }
    const media = line.match(/^@\[(video|audio)\]\((https?:\/\/[^)]+)\)$/i);
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    const pdf = line.match(/^\[PDF(?::\s*([^\]]+))?\]\((https?:\/\/[^)]+)\)$/i);
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (media || image || pdf || heading || bullet) { flushParagraph(); flushList(); }
    if (media) {
      nodes.push(media[1].toLowerCase() === "video" ? <video key={index} controls preload="metadata" src={media[2]} className="content-media" /> : <audio key={index} controls preload="metadata" src={media[2]} className="content-audio" />);
    } else if (image) {
      nodes.push(<figure key={index} className="content-figure"><img src={image[2]} alt={image[1]} /><figcaption>{image[1]}</figcaption></figure>);
    } else if (pdf) {
      nodes.push(<p key={index}><a className="textlink" href={pdf[2]} target="_blank" rel="noreferrer">📄 {pdf[1] || "Open PDF document"} ↗</a></p>);
    } else if (heading) {
      const content = inline(heading[2]);
      if (heading[1].length === 1) nodes.push(<h2 key={index}>{content}</h2>);
      else if (heading[1].length === 2) nodes.push(<h3 key={index}>{content}</h3>);
      else nodes.push(<h4 key={index}>{content}</h4>);
    } else if (bullet) list.push(bullet[1]);
    else if (line.startsWith("> ")) nodes.push(<blockquote key={index}>{inline(line.slice(2))}</blockquote>);
    else paragraph.push(line);
  });
  flushParagraph(); flushList();
  return <div className="content-body">{nodes.length ? nodes : <p className="muted">This content has no body text yet.</p>}</div>;
}

export function ContentCard({ entry }: { entry: ContentEntry }) {
  return <article className="card content-card" key={entry.id}>
    {entry.cover_image_path && <Link href={`/content/${entry.slug}`}><img className="content-cover" src={entry.cover_image_path} alt="" /></Link>}
    <span className="pill blue">{entry.kind === "teaching" ? "Faith-based teaching" : entry.kind === "article" ? "Thought leadership" : entry.kind}</span>
    <h3><Link href={`/content/${entry.slug}`}>{entry.title}</Link></h3>
    {entry.excerpt && <p>{entry.excerpt}</p>}
    <p><Link className="textlink" href={`/content/${entry.slug}`}>Read more →</Link></p>
  </article>;
}
