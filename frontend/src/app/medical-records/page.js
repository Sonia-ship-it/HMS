"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

export default function MedicalRecordsPage() {
  return (
    <AppShell title="Medical records" subtitle="Patient diagnosis history"
      action={<Link href="/medical-records/new" className="btn btn-primary btn-sm">Create record</Link>}>
      <div className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Actions</th></tr></thead>
            <tbody>
              <tr>
                <td>2026-06-01</td>
                <td>Dr. Sarah Mitchell</td>
                <td>Hypertension — controlled</td>
                <td><button type="button" className="btn btn-outline btn-sm">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
