"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { Icon } from "@/components/icons";
import { api } from "@/lib/api";

export default function DoctorsPage() {
  const [data, setData] = useState({ content: [] });
  const [page, setPage] = useState(0);

  useEffect(() => {
    api(`/doctors?page=${page}&size=10`).then(setData);
  }, [page]);

  return (
    <AppShell title="Doctors" subtitle="Manage doctor profiles and schedules"
      action={<Link href="/doctors/new" className="btn btn-primary btn-sm"><Icon.Plus /> Add doctor</Link>}>
      <div className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {data.content?.map((d) => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.specialization}</td>
                  <td>{d.active ? <span className="badge badge-muted">Active</span> : <span className="badge">Inactive</span>}</td>
                  <td><Link href={`/doctors/${d.id}`} className="btn btn-outline btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <button type="button" className="btn btn-outline btn-sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
    </AppShell>
  );
}
