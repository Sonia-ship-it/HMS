"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => { api(`/doctors/${id}`).then(setDoctor); }, [id]);

  if (!doctor) return <AppShell title="Doctor"><div className="empty">Loading…</div></AppShell>;

  return (
    <AppShell title={doctor.name} subtitle={doctor.specialization}>
      <div className="panel" style={{ padding: 28 }}>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Phone:</strong> {doctor.phone}</p>
        <p><strong>Days:</strong> {doctor.availableDays}</p>
        <p><strong>Hours:</strong> {doctor.startTime} – {doctor.endTime}</p>
      </div>
    </AppShell>
  );
}
