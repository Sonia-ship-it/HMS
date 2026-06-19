"use client";

import AppShell from "@/components/layout/AppShell";

export default function CreateUserPage() {
  return (
    <AppShell title="Create user" subtitle="Add staff or admin accounts">
      <form className="panel" style={{ padding: 28, maxWidth: 400 }}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="input" />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="input" type="password" />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="select">
            <option>ADMIN</option>
            <option>DOCTOR</option>
            <option>RECEPTIONIST</option>
          </select>
        </div>
        <button type="button" className="btn btn-primary">Create</button>
      </form>
    </AppShell>
  );
}
