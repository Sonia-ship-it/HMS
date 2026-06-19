import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>403</h1>
      <p style={{ marginTop: 12, color: "var(--fg-muted)" }}>You do not have permission to access this page.</p>
      <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 24 }}>Go to dashboard</Link>
    </div>
  );
}
