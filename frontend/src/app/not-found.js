import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
      <p style={{ color: "var(--fg-muted)" }}>Page not found</p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 24 }}>Home</Link>
    </div>
  );
}
