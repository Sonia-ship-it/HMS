"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", dateOfBirth: "", gender: "MALE" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    await api("/patients", { method: "POST", body: JSON.stringify({ ...form, dateOfBirth: form.dateOfBirth || null }) });
    router.push("/patients");
  };

  return (
    <AppShell title="Add patient" subtitle="Register a new patient in the system">
      <form className="panel" style={{ padding: 28, maxWidth: 560 }} onSubmit={save}>
        {["name", "email", "phone", "address"].map((f) => (
          <div className="form-group" key={f}>
            <label className="form-label">{f}</label>
            <input className="input" required={f === "name"} value={form[f]} onChange={(e) => set(f, e.target.value)} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Date of birth</label>
          <input className="input" type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select className="select" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
        </div>
      </form>
    </AppShell>
  );
}
