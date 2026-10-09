"use client";

import { useState, type FormEvent } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setMsg(null);
    const res = await saveSettings(new FormData(e.currentTarget));
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: "Saved." } : { ok: false, text: res.message ?? "Could not save." });
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {msg && <div role="status" className={`admin-msg admin-msg--${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      <div className="row2">
        <label>Phone<input type="text" name="phone" defaultValue={settings.phone} /></label>
        <label>Second phone<input type="text" name="phoneAlt" defaultValue={settings.phoneAlt} /></label>
      </div>
      <div className="row2">
        <label>Email<input type="email" name="email" defaultValue={settings.email} /></label>
        <label>WhatsApp link<input type="text" name="whatsapp" defaultValue={settings.whatsapp} /></label>
      </div>
      <label>Business hours<input type="text" name="hours" defaultValue={settings.hours} /></label>
      <label>
        Announcement bar
        <input type="text" name="announcement" defaultValue={settings.announcement} maxLength={160} />
        <span className="hint">The strip across the very top of every page.</span>
      </label>
      <div className="admin-actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Saving…" : "Save settings"}</button>
      </div>
    </form>
  );
}
