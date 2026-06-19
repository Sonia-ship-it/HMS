"use client";

import Link from "next/link";
import AppShell from "@/components/layout/AppShell";

const DEMO_USERS = [
  { username: "admin", role: "ADMIN", status: "Active" },
  { username: "doctor1", role: "DOCTOR", status: "Active" },
  { username: "reception", role: "RECEPTIONIST", status: "Active" },
  { username: "patient1", role: "PATIENT", status: "Active" },
];

export default function UsersPage() {
  return (
    <AppShell title="User management" subtitle="Admin-only user accounts"
      action={<Link href="/users/new" className="btn btn-primary btn-sm">Create user</Link>}>
      <div className="panel">
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {DEMO_USERS.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>{u.status}</td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
