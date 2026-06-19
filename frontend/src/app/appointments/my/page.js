"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ content: [] });
  const [status, setStatus] = useState("");

  const load = () => {
    const q = new URLSearchParams({ page: 0, size: 20, sortBy: "appointmentDate", sortDir: "desc" });
    if (status) q.set("status", status);
    if (user?.patientId) q.set("patientId", user.patientId);
    api(`/appointments?${q}`).then(setData).catch(console.error);
  };

  useEffect(() => { if (user) load(); }, [user, status]);

  return (
    <AppShell title="My Appointments" subtitle="Your scheduled appointments"
      action={<Link href="/appointments/book" className="btn btn-primary btn-sm">Book New</Link>}>
      <div className="panel">
        <div className="panel-head">
          <select className="select" style={{ maxWidth: 160 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {["SCHEDULED", "CHECKED_IN", "IN_QUEUE", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Token</th><th></th></tr></thead>
            <tbody>
              {data.content?.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctorName}</td>
                  <td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td>
                  <td><span className="badge badge-muted">{a.status}</span></td>
                  <td>{a.tokenNumber}</td>
                  <td><Link href={`/appointments/${a.id}`} className="btn btn-outline btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
