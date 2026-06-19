"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Filter } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function AppointmentsPage() {
  const [data, setData] = useState({ content: [] });
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const load = () => {
    const q = new URLSearchParams({ page: 0, size: 20, sortBy: "appointmentDate", sortDir: "desc" });
    if (date) q.set("date", date);
    if (status) q.set("status", status);
    api(`/appointments?${q}`).then(setData);
  };

  // Auto-filter as user changes inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [date, status]);

  return (
    <AppShell title="Appointments" subtitle="View and manage all appointments"
      action={<Link href="/appointments/book" className="btn btn-primary btn-sm"><Calendar size={16} /> Book</Link>}>
      <div className="panel">
        <div className="panel-head">
          <h3>All Appointments</h3>
          <div style={{ display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
              <input 
                className="input" 
                type="date" 
                style={{ maxWidth: 180, paddingLeft: 36 }} 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)', pointerEvents: 'none' }} />
              <select 
                className="select" 
                style={{ maxWidth: 180, paddingLeft: 36 }} 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                {["SCHEDULED", "CHECKED_IN", "IN_QUEUE", "SERVING", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Token</th><th></th></tr></thead>
            <tbody>
              {data.content?.length ? data.content.map((a) => (
                <tr key={a.id}>
                  <td>{a.patientName}</td><td>{a.doctorName}</td><td>{a.appointmentDate}</td>
                  <td>{a.appointmentTime}</td><td><span className="badge badge-muted">{a.status}</span></td>
                  <td>{a.tokenNumber}</td>
                  <td><Link href={`/appointments/${a.id}`} className="btn btn-outline btn-sm">View</Link></td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="empty">No appointments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
