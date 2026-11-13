
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function EditorContent() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState("article");
  const [status, setStatus] = useState("draft");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverImagePath, setCoverImagePath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const sb = createClient();
        const {
          data: { user },
        } = await sb.auth.getUser();

        if (!user) {
          router.replace("/admin");
          return;
        }

        if (id) {
          const { data, error } = await sb
            .from("content")
            .select("*")
            .eq("id", id)
            .single();

          if (error) throw error;

          if (alive && data) {
            setTitle(data.title || "");
            setSlug(data.slug || "");
            setKind(data.kind || "article");
            setStatus(data.status || "draft");
            setExcerpt(data.excerpt || "");
            setBody(data.body_markdown || "");
            setCoverImagePath(data.cover_image_path || "");
            setSeoTitle(data.seo_title || "");
            setSeoDescription(data.seo_description || "");
          }
        }
      } catch (error) {
        if (alive) {
          setMsg(
            error instanceof Error
              ? error.message
              : "Unable to load content."
          );
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [id, router]);

  async function uploadMedia(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["image/", "video/", "audio/", "application/pdf"];
    if (!allowed.some((type) => type.endsWith("/") ? file.type.startsWith(type) : file.type === type)) {
      setMsg("Choose an image, video, audio file, or PDF.");
      event.target.value = "";
      return;
    }
    const maxBytes = file.type.startsWith("video/") ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMsg(file.type.startsWith("video/") ? "Videos must be 50 MB or smaller." : "Files must be 20 MB or smaller.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setMsg("Uploading media...");
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) throw new Error("Please sign in first.");
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error } = await sb.storage.from("site-media").upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = sb.storage.from("site-media").getPublicUrl(path);
      const url = data.publicUrl;
      if (file.type.startsWith("image/")) {
        setBody((current) => `${current}${current.trim() ? "\n\n" : ""}![${file.name}](${url})`);
        setCoverImagePath(url);
        setMsg("Image uploaded and inserted into the body.");
      } else if (file.type.startsWith("video/")) {
        setBody((current) => `${current}${current.trim() ? "\n\n" : ""}@[video](${url})`);
        setMsg("Video uploaded and inserted into the body.");
      } else if (file.type.startsWith("audio/")) {
        setBody((current) => `${current}${current.trim() ? "\n\n" : ""}@[audio](${url})`);
        setMsg("Audio uploaded and inserted into the body.");
      } else {
        setBody((current) => `${current}${current.trim() ? "\n\n" : ""}[PDF: ${file.name}](${url})`);
        setMsg("PDF uploaded and link inserted into the body.");
      }
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Media upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMsg("");

    try {
      const sb = createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();

      if (!user) throw new Error("Please sign in first.");

      const now = new Date().toISOString();

      const payload = {
        title,
        slug,
        kind,
        status,
        excerpt,
        body_markdown: body,
        cover_image_path: coverImagePath || null,
        seo_title: seoTitle,
        seo_description: seoDescription,
        updated_at: now,
        published_at: status === "published" ? now : null,
      };

      const result = id
        ? await sb.from("content").update(payload).eq("id", id).select("id").single()
        : await sb.from("content").insert(payload).select("id").single();

      if (result.error) throw result.error;

      setMsg("Content saved successfully.");

      if (!id && result.data?.id) {
        router.replace("/admin/editor?id=" + result.data.id);
      }
    } catch (error) {
      setMsg(
        error instanceof Error ? error.message : "Unable to save content."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <div className="adminbar">
        <strong>Content editor</strong>
        <a href="/admin/dashboard">Back to dashboard</a>
      </div>

      <div className="adminmain">
        <h1 style={{ fontFamily: "Manrope" }}>
          {id ? "Edit content" : "New content"}
        </h1>

        <p className="muted">
          Write your content using Markdown. Rich-text tools and media uploads
          have not been implemented yet.
        </p>

        <form className="form card" onSubmit={save}>
          <label>
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            URL slug
            <input
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9-]+/g, "-")
                    .replace(/--+/g, "-")
                )
              }
              required
            />
          </label>

          <div className="two">
            <label>
              Content type
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
              >
                <option value="article">Thought leadership article</option>
                <option value="teaching">Faith-based teaching</option>
                <option value="project">Product / venture update</option>
                <option value="engineering">Engineering work</option>
                <option value="publication">Publication / technical note</option>
              </select>
            </label>

            <label>
              Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>

          <label>
            Excerpt
            <textarea
              rows={3}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </label>

          <label>
            Cover image URL (optional)
            <input
              value={coverImagePath}
              onChange={(event) => setCoverImagePath(event.target.value)}
              placeholder="Upload an image below or paste an image URL"
            />
          </label>

          <div className="media-upload card">
            <h3>Media library · Upload files</h3>
            <p className="muted small">Images, videos, audio and PDFs. Images, audio and PDFs: up to 20 MB. Videos: up to 50 MB.</p>
            <input type="file" accept="image/*,video/*,audio/*,application/pdf" onChange={uploadMedia} disabled={uploading} />
            {uploading && <p className="muted">Uploading file, please wait...</p>}
            <p className="muted small">Uploaded media is inserted into the body automatically. For a cover image, copy its URL from the inserted Markdown and paste it into the cover image field.</p>
          </div>

          <label>
            Body (Markdown)
            <textarea
              rows={16}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your content here..."
            />
          </label>

          <label>
            SEO title
            <input
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
            />
          </label>

          <label>
            SEO description
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
            />
          </label>

          {msg && <p role="status" className="notice">{msg}</p>}

          <div className="row">
            <button className="btn" disabled={busy}>
              {busy ? "Saving..." : "Save content"}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={() => router.push("/admin/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
export default function Editor() {
  return (
    <Suspense fallback={<main className="admin-shell">Loading editor...</main>}>
      <EditorContent />
    </Suspense>
  );
}