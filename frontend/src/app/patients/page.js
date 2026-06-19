"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function PatientsPage() {
  const [data, setData] = useState({ content: [], totalElements: 0 });
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const q = new URLSearchParams({ page, size: 10, sortBy: "name", sortDir: "asc" });
    if (name) q.set("name", name);
    if (phone) q.set("phone", phone);
    api(`/patients?${q}`).then(setData).finally(() => setLoading(false));
  };

  // Auto-search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [name, phone]);

  useEffect(() => { load(); }, [page]);

  return (
    <AppShell
      title="Patients"
      subtitle="Search, view, and manage patient records"
      action={<Link href="/patients/new" className="btn btn-primary btn-sm"><UserPlus size={16} /> Add patient</Link>}
    >
      <div className="panel">
        <div className="panel-head">
          <h3>All Patients</h3>
          <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
              <input 
                className="input" 
                style={{ maxWidth: 200, paddingLeft: 36 }} 
                placeholder="Search by name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
              <input 
                className="input" 
                style={{ maxWidth: 180, paddingLeft: 36 }} 
                placeholder="Search by phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Risk</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="empty">Loading…</td></tr>
              ) : data.content?.length ? data.content.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>{p.highRisk ? <span className="badge badge-risk">High {p.noShowRiskScore}</span> : <span className="badge badge-muted">{p.noShowRiskScore}</span>}</td>
                  <td>
                    <Link href={`/patients/${p.id}`} className="btn btn-outline btn-sm">View</Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="empty">No patients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>{data.totalElements} patients</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button type="button" className="btn btn-outline btn-sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
