"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [a, setA] = useState(null);

  useEffect(() => { api(`/appointments/${id}`).then(setA); }, [id]);

  const action = async (path, method = "POST") => {
    await api(`/appointments/${id}${path}`, { method });
    api(`/appointments/${id}`).then(setA);
  };

  if (!a) return <AppShell title="Appointment"><div className="empty">Loading…</div></AppShell>;

  return (
    <AppShell title="Appointment details" subtitle={`Token #${a.tokenNumber}`}>
      <div className="panel" style={{ padding: 28, marginBottom: 20 }}>
        <p><strong>Patient:</strong> {a.patientName}</p>
        <p><strong>Doctor:</strong> {a.doctorName}</p>
        <p><strong>When:</strong> {a.appointmentDate} at {a.appointmentTime}</p>
        <p><strong>Status:</strong> {a.status}</p>
        {a.estimatedWaitMinutes != null && <p><strong>Est. wait:</strong> {a.estimatedWaitMinutes} min</p>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {a.status === "SCHEDULED" && (
          <button type="button" className="btn btn-primary" onClick={() => action("/check-in")}>Check in</button>
        )}
        <button type="button" className="btn btn-outline" onClick={() => action("/cancel?late=false")}>Cancel</button>
        <button type="button" className="btn btn-outline" onClick={() => router.push("/appointments")}>Back</button>
      </div>
    </AppShell>
  );
}
