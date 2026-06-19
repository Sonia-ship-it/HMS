"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState({ content: [] });

  useEffect(() => {
    api(`/patients/${id}`).then(setPatient);
    api(`/appointments?patientId=${id}&size=20`).catch(() => ({ content: [] })).then(setAppointments);
  }, [id]);

  if (!patient) return <AppShell title="Patient"><div className="empty">Loading…</div></AppShell>;

  return (
    <AppShell title={patient.name} subtitle="Patient details & history">
      <div className="stats-grid">
        <div className="stat-card"><span className="label">No-show risk</span><div className="value">{patient.noShowRiskScore}</div></div>
        <div className="stat-card"><span className="label">Missed</span><div className="value">{patient.missedAppointments}</div></div>
        <div className="stat-card"><span className="label">Late cancels</span><div className="value">{patient.lateCancellations}</div></div>
      </div>
      <div className="panel" style={{ marginBottom: 20, padding: 22 }}>
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
        <p><strong>Address:</strong> {patient.address}</p>
        <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        {patient.highRisk && <p style={{ marginTop: 12 }}><span className="badge badge-risk">High no-show risk — flag for reception</span></p>}
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Appointment history</h3></div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Token</th></tr></thead>
            <tbody>
              {(appointments.content || []).map((a) => (
                <tr key={a.id}><td>{a.doctorName}</td><td>{a.appointmentDate}</td><td>{a.appointmentTime}</td><td>{a.status}</td><td>{a.tokenNumber}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
