"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { Icon } from "@/components/icons";
import { useEffect } from "react";

const NAV = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: Icon.Dashboard },
    { href: "/patients", label: "Patients", icon: Icon.Patients },
    { href: "/doctors", label: "Doctors", icon: Icon.Doctors },
    { href: "/appointments", label: "Appointments", icon: Icon.Calendar },
    { href: "/queue", label: "Live Queue", icon: Icon.Queue },
    { href: "/queue/board", label: "Queue Board", icon: Icon.Queue },
    { href: "/reports", label: "Reports", icon: Icon.Chart },
    { href: "/admin/schedulers", label: "Schedulers", icon: Icon.Settings },
    { href: "/users", label: "Users", icon: Icon.Users },
    { href: "/settings", label: "Settings", icon: Icon.Settings },
  ],
  DOCTOR: [
    { href: "/dashboard", label: "Dashboard", icon: Icon.Dashboard },
    { href: "/patients", label: "Patients", icon: Icon.Patients },
    { href: "/appointments", label: "Appointments", icon: Icon.Calendar },
    { href: "/queue", label: "Live Queue", icon: Icon.Queue },
    { href: "/medical-records", label: "Medical Records", icon: Icon.Records },
  ],
  RECEPTIONIST: [
    { href: "/dashboard", label: "Dashboard", icon: Icon.Dashboard },
    { href: "/patients", label: "Patients", icon: Icon.Patients },
    { href: "/doctors", label: "Doctors", icon: Icon.Doctors },
    { href: "/appointments", label: "Appointments", icon: Icon.Calendar },
    { href: "/appointments/book", label: "Book Appointment", icon: Icon.Calendar },
    { href: "/queue", label: "Live Queue", icon: Icon.Queue },
  ],
  PATIENT: [
    { href: "/dashboard", label: "Dashboard", icon: Icon.Dashboard },
    { href: "/appointments/book", label: "Book Appointment", icon: Icon.Calendar },
    { href: "/appointments/my", label: "My Appointments", icon: Icon.Calendar },
    { href: "/profile", label: "Profile", icon: Icon.Patients },
  ],
};

export default function AppShell({ children, title, subtitle, action }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're sure there's no user and not loading
    if (!loading && !user) {
      // Use window.location to ensure clean navigation
      window.location.href = "/login";
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading Smart Hospital…</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const links = NAV[user.role] || NAV.PATIENT;
  const initials = (user.fullName || user.username || "?").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon"><Icon.Logo /></span>
          <div>
            <span className="brand-title">SmartHMS</span>
            <span className="brand-tag">Queue &amp; Care</span>
          </div>
        </div>
        <nav className="nav">
          {links.map(({ href, label, icon: I }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <I />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <Link href="/notifications" className="nav-link">
            <Icon.Bell /> Notifications
          </Link>
          <Link href="/profile" className="nav-link">
            <Icon.Patients /> Profile
          </Link>
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{user.fullName || user.username}</strong>
              <span className="role-badge">{user.role}</span>
            </div>
          </div>
          <button type="button" className="btn-ghost full" onClick={() => { logout(); router.push("/login"); }}>
            <Icon.Logout /> Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </header>
        {children}
      </main>
    </div>
  );
}
