"use client";

import AppShell from "@/components/layout/AppShell";

export default function NewMedicalRecordPage() {
  return (
    <AppShell title="Create medical record" subtitle="Document visit findings">
      <form className="panel" style={{ padding: 28, maxWidth: 560 }}>
        <div className="form-group"><label className="form-label">Symptoms</label><textarea className="textarea" rows={3} /></div>
        <div className="form-group"><label className="form-label">Diagnosis</label><input className="input" /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="textarea" rows={3} /></div>
        <div className="form-group"><label className="form-label">Prescription</label><textarea className="textarea" rows={2} /></div>
        <button type="button" className="btn btn-primary">Save record</button>
      </form>
    </AppShell>
  );
}
