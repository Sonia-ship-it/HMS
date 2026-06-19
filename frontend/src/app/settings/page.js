"use client";

import AppShell from "@/components/layout/AppShell";

export default function SettingsPage() {
  return (
    <AppShell title="Hospital settings" subtitle="Configure hospital profile and notifications">
      <form className="panel" style={{ padding: 28, maxWidth: 560 }}>
        <div className="form-group">
          <label className="form-label">Hospital name</label>
          <input className="input" defaultValue="Smart City General Hospital" />
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="input" defaultValue="123 Health Avenue" />
        </div>
        <div className="form-group">
          <label className="form-label">Contact</label>
          <input className="input" defaultValue="+1 (555) 010-2000" />
        </div>
        <div className="form-group">
          <label className="form-label">Working hours</label>
          <input className="input" defaultValue="Mon–Sat 8:00 AM – 8:00 PM" />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" defaultChecked /> Enable notifications
        </label>
        <button type="button" className="btn btn-primary" style={{ marginTop: 20 }}>Save settings</button>
      </form>
    </AppShell>
  );
}
