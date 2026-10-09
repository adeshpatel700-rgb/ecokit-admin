"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deletePost, savePost } from "@/app/admin/actions";
import type { BlogPost } from "@/lib/types";
import ImageField from "@/components/admin/ImageField";

export default function PostForm({ post }: { post: BlogPost | null }) {
  const router = useRouter();
  const isNew = post === null;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    const res = await savePost(new FormData(e.currentTarget));
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Saved." });
      if (isNew && res.slug) router.replace(`/admin/blog/${res.slug}`);
      router.refresh();
    } else setMsg({ ok: false, text: res.message ?? "Could not save." });
  }

  async function onDelete() {
    if (!post) return;
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await deletePost(post.slug);
    setBusy(false);
    if (res.ok) router.push("/admin/blog");
    else setMsg({ ok: false, text: res.message ?? "Could not delete." });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {msg && <div role="status" className={`admin-msg admin-msg--${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}

      <div className="row2">
        <label>
          Title
          <input type="text" name="title" defaultValue={post?.title} required maxLength={160} />
        </label>
        <label>
          Slug (web address)
          <input type="text" name="slug" defaultValue={post?.slug} required readOnly={!isNew}
                 pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="why-bamboo-beats-plastic" />
        </label>
      </div>

      <label>
        Summary
        <textarea name="excerpt" defaultValue={post?.excerpt} maxLength={320} style={{ minHeight: 70 }} />
        <span className="hint">Shown on the blog list and in search results.</span>
      </label>

      <label>
        Body
        <textarea name="body" defaultValue={post?.body} required style={{ minHeight: 320 }} />
        <span className="hint">
          Plain text. Blank line starts a new paragraph. A line beginning with ## becomes a heading,
          and one beginning with - becomes a bullet.
        </span>
      </label>

      <ImageField name="coverImage" label="Cover image" folder="blog" defaultValue={post?.coverImage ?? ""} />

      <div className="row2">
        <label>
          Cover image description
          <input type="text" name="coverAlt" defaultValue={post?.coverAlt ?? ""} maxLength={200} />
        </label>
        <label>
          Tags
          <input type="text" name="tags" defaultValue={post?.tags.join(", ")} placeholder="sustainability, hotels" />
          <span className="hint">Separated by commas.</span>
        </label>
      </div>

      <div className="row2">
        <label>
          Status
          <select name="status" defaultValue={post?.status ?? "draft"}>
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — live on the site</option>
          </select>
        </label>
        <label>
          Date
          <input type="text" name="publishedAt" defaultValue={(post?.publishedAt ?? today).slice(0, 10)} placeholder="YYYY-MM-DD" />
        </label>
      </div>

      <label>
        Author
        <input type="text" name="author" defaultValue={post?.author ?? "EcoKit"} maxLength={80} />
      </label>

      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save post"}</button>
        {!isNew && <button type="button" className="cart-line__remove" onClick={onDelete} disabled={busy}>Delete</button>}
      </div>
    </form>
  );
}
