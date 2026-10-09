import SettingsForm from "@/components/admin/SettingsForm";
import { adminDb } from "@/lib/firebase/admin";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  const db = adminDb();
  let saved: Partial<SiteSettings> = {};
  if (db) {
    try {
      const doc = await db.collection("settings").doc("site").get();
      if (doc.exists) saved = doc.data() as Partial<SiteSettings>;
    } catch { /* fall back to the built-in values */ }
  }
  const settings: SiteSettings = {
    phone: saved.phone ?? SITE.phone,
    phoneAlt: saved.phoneAlt ?? SITE.phoneAlt,
    email: saved.email ?? SITE.email,
    whatsapp: saved.whatsapp ?? SITE.whatsappHref,
    announcement: saved.announcement ?? "Sustainable Hospitality Solutions for Hotels & Businesses",
    hours: saved.hours ?? SITE.hours,
  };

  return (
    <>
      <div className="admin__head">
        <div>
          <h1>Settings</h1>
          <p className="admin__hint">Contact details shown across the site.</p>
        </div>
      </div>
      <div className="admin-card"><SettingsForm settings={settings} /></div>
    </>
  );
}
