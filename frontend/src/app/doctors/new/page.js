"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function NewDoctorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", specialization: "", email: "", phone: "",
    availableDays: "Mon,Tue,Wed,Thu,Fri", startTime: "09:00", endTime: "17:00", active: true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    await api("/doctors", { method: "POST", body: JSON.stringify(form) });
    router.push("/doctors");
  };

  return (
    <AppShell title="Add doctor" subtitle="Create a new doctor profile">
      <form className="panel" style={{ padding: 28, maxWidth: 560 }} onSubmit={save}>
        {["name", "specialization", "email", "phone", "availableDays"].map((f) => (
          <div className="form-group" key={f}>
            <label className="form-label">{f}</label>
            <input className="input" required={f === "name"} value={form[f]} onChange={(e) => set(f, e.target.value)} />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label">Start time</label>
          <input className="input" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">End time</label>
          <input className="input" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">Save</button>
      </form>
    </AppShell>
  );
}
