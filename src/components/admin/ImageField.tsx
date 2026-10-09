"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/app/admin/actions";

/** Path or URL input with an optional upload straight to Firebase Storage. */
export default function ImageField({
  name, label, defaultValue, folder, hint,
}: { name: string; label: string; defaultValue?: string; folder: "products" | "blog"; hint?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    fd.set("name", file.name.replace(/\.[^.]+$/, ""));
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok && res.url) setValue(res.url);
    else setError(res.message ?? "Upload failed.");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <label>
      {label}
      <input type="text" name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="/images/products/slug.jpg" />
      {hint && <span className="hint">{hint}</span>}
      <span className="admin-actions" style={{ marginTop: "0.35rem" }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPick} style={{ fontSize: "var(--text-xs)", fontWeight: 400 }} />
        {busy && <span className="hint">Uploading…</span>}
      </span>
      {error && <span className="hint" style={{ color: "var(--color-error)" }}>{error}</span>}
    </label>
  );
}
