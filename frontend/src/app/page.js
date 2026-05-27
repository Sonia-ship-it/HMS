"use client";

import { useState, useEffect, useMemo } from "react";

/* ============================================
   SVG Icon Components (No external deps)
   ============================================ */
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  patients: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  ward: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  add: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  stethoscope: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  heartPulse: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  ),
  activity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
};

export default function Home() {
  // Auth state
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Patients & pagination state
  const [patients, setPatients] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms
  const [newPatient, setNewPatient] = useState({ name: "", age: "", diagnosis: "" });
  const [editingPatient, setEditingPatient] = useState({ id: "", name: "", age: "", diagnosis: "" });

  // Toast
  const [toasts, setToasts] = useState([]);

  // Check auth on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  // Fetch patients when authenticated or page changes
  useEffect(() => {
    if (user) fetchPatients();
  }, [user, page]);

  /* ============================================
     Helpers
     ============================================ */
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  /* ============================================
     Auth Operations
     ============================================ */
  const checkCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error("Auth check failed", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!usernameInput || !passwordInput) {
      setLoginError("Please enter both username and password.");
      return;
    }

    setIsLoginSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        showToast(`Welcome back, ${data.username}!`, "success");
        setUsernameInput("");
        setPasswordInput("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoginError(errData.error || "Invalid username or password.");
        showToast("Login failed", "error");
      }
    } catch (err) {
      setLoginError("Server error. Please try again later.");
      showToast("Network error during login", "error");
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        setPatients([]);
        showToast("You have been logged out", "info");
      } else {
        showToast("Logout failed", "error");
      }
    } catch (err) {
      showToast("Error logging out", "error");
    }
  };

  /* ============================================
     Patient CRUD
     ============================================ */
  const fetchPatients = async () => {
    setIsDataLoading(true);
    try {
      const res = await fetch(`/api/patients/pages?pageNo=${page}&pageSize=${pageSize}&sortBy=id`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.content || []);
        setTotalElements(data.totalElements || 0);
      } else {
        const fallbackRes = await fetch("/api/patients");
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setPatients(fallbackData);
          setTotalElements(fallbackData.length);
        } else {
          showToast("Failed to fetch patients", "error");
        }
      }
    } catch (err) {
      showToast("Network error fetching patients", "error");
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.age || !newPatient.diagnosis) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPatient.name,
          age: parseInt(newPatient.age),
          diagnosis: newPatient.diagnosis,
        }),
      });

      if (res.ok) {
        showToast("Patient created successfully", "success");
        setIsAddModalOpen(false);
        setNewPatient({ name: "", age: "", diagnosis: "" });
        fetchPatients();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Failed to create patient", "error");
      }
    } catch (err) {
      showToast("Error creating patient", "error");
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    if (!editingPatient.name || !editingPatient.age || !editingPatient.diagnosis) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      const res = await fetch(`/api/patients/${editingPatient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingPatient.name,
          age: parseInt(editingPatient.age),
          diagnosis: editingPatient.diagnosis,
        }),
      });

      if (res.ok) {
        showToast("Patient updated successfully", "success");
        setIsEditModalOpen(false);
        fetchPatients();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "Failed to update patient", "error");
      }
    } catch (err) {
      showToast("Error updating patient", "error");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!confirm("Are you sure you want to delete this patient record?")) return;

    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Patient record deleted", "success");
        fetchPatients();
      } else {
        showToast("Failed to delete patient. Admin role required.", "error");
      }
    } catch (err) {
      showToast("Error deleting patient", "error");
    }
  };

  const openEditModal = (patient) => {
    setEditingPatient({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      diagnosis: patient.diagnosis,
    });
    setIsEditModalOpen(true);
  };

  /* ============================================
     Derived Data
     ============================================ */
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.diagnosis.toLowerCase().includes(query) ||
        p.id.toString().includes(query)
    );
  }, [patients, searchQuery]);

  const stats = useMemo(() => {
    if (!patients || patients.length === 0) {
      return { total: 0, avgAge: 0, commonDiagnosis: "N/A" };
    }
    const total = totalElements || patients.length;
    const sumAge = patients.reduce((acc, p) => acc + p.age, 0);
    const avgAge = Math.round(sumAge / patients.length) || 0;

    const diagCount = {};
    patients.forEach((p) => {
      const d = p.diagnosis.split(" ")[0] || "General";
      diagCount[d] = (diagCount[d] || 0) + 1;
    });
    let commonDiagnosis = "N/A";
    let maxCount = 0;
    Object.keys(diagCount).forEach((key) => {
      if (diagCount[key] > maxCount) {
        maxCount = diagCount[key];
        commonDiagnosis = key;
      }
    });

    return { total, avgAge, commonDiagnosis };
  }, [patients, totalElements]);

  const totalPages = Math.max(1, Math.ceil((totalElements || 0) / pageSize));
  const isAdmin = user?.role === "ROLE_ADMIN";

  /* ============================================
     Toast Renderer
     ============================================ */
  const renderToasts = () => (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === "success" && <span style={{ color: "hsl(160 84% 39%)" }}>{Icons.check}</span>}
          {t.type === "error" && <span style={{ color: "hsl(347 77% 50%)" }}>{Icons.x}</span>}
          {t.type === "info" && <span style={{ color: "hsl(217 91% 60%)" }}>{Icons.info}</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );

  /* ============================================
     Loading Splash
     ============================================ */
  if (isAuthLoading) {
    return (
      <div className="login-wrapper" style={{ flexDirection: "column", gap: "20px" }}>
        <div className="avatar" style={{ width: "56px", height: "56px", fontSize: "1.3rem", animation: "pulseGlow 2s ease-in-out infinite" }}>
          H
        </div>
        <p style={{ color: "hsl(217 25% 68%)", fontSize: "0.9rem", fontWeight: "500" }}>
          Initializing secure session...
        </p>
      </div>
    );
  }

  /* ============================================
     Login View
     ============================================ */
  if (!user) {
    return (
      <div className="login-wrapper">
        {renderToasts()}
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">HMS Portal</div>
            <div className="login-subtitle">Hospital Management System</div>
          </div>
          {loginError && <div className="login-error">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">Username</label>
              <input
                id="login-username"
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button
              className="btn-primary"
              type="submit"
              style={{ width: "100%", marginTop: "8px" }}
              disabled={isLoginSubmitting}
            >
              {isLoginSubmitting ? "Authenticating..." : "Sign In"}
            </button>
          </form>
          <div style={{ marginTop: "28px", fontSize: "0.78rem", color: "hsl(217 15% 45%)", textAlign: "center", lineHeight: "1.6" }}>
            <span style={{ fontWeight: "600", color: "hsl(217 25% 68%)" }}>Demo Credentials</span>
            <br />
            admin / admin123 (Full Access) · user / user123 (View Only)
          </div>
        </div>
      </div>
    );
  }

  /* ============================================
     Dashboard View
     ============================================ */
  return (
    <div className="app-container">
      {renderToasts()}

      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="brand-logo">H</div>
            <div>
              <div className="brand-name">HMS</div>
              <div style={{ fontSize: "0.72rem", color: "hsl(217 15% 45%)", fontWeight: "500", letterSpacing: "0.5px" }}>
                SONIA MEDICAL
              </div>
            </div>
          </div>
          <ul className="nav-links">
            <li className="nav-item active">
              {Icons.dashboard}
              <span>Dashboard</span>
            </li>
            <li className="nav-item">
              {Icons.patients}
              <span>Patients</span>
            </li>
            <li className="nav-item">
              {Icons.ward}
              <span>Ward Registry</span>
            </li>
            <li className="nav-item">
              {Icons.settings}
              <span>System Settings</span>
            </li>
          </ul>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="username">{user.username}</span>
              <span className="user-role">{user.role.replace("ROLE_", "")}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            {Icons.logout}
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <div className="header-container">
          <div>
            <h1 className="welcome-title">Administration Panel</h1>
            <p className="welcome-subtitle">
              Welcome back, <strong>{user.username}</strong>. Monitor patients and manage ward admissions.
            </p>
          </div>
          {isAdmin ? (
            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
              {Icons.add}
              Add Patient
            </button>
          ) : (
            <div className="badge-admin-only">View Only Access</div>
          )}
        </div>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-info">
              <span className="stat-label">Total Patients</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-icon">{Icons.patients}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-info">
              <span className="stat-label">Average Age</span>
              <span className="stat-value">{stats.avgAge} <span style={{ fontSize: "0.8rem", fontWeight: "500" }}>yrs</span></span>
            </div>
            <div className="stat-icon">{Icons.heartPulse}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-info">
              <span className="stat-label">Leading Diagnosis</span>
              <span className="stat-value" style={{ fontSize: "1.25rem" }}>{stats.commonDiagnosis}</span>
            </div>
            <div className="stat-icon">{Icons.activity}</div>
          </div>
        </section>

        {/* Patient Records */}
        <section className="data-panel">
          <div className="panel-header">
            <h2 className="panel-title">Active Patient Records</h2>
            <div className="filter-bar">
              <input
                className="search-input"
                type="text"
                placeholder="Search by name, diagnosis or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            {isDataLoading ? (
              <div style={{ padding: "16px 0" }}>
                <div className="loading-row"></div>
                <div className="loading-row"></div>
                <div className="loading-row"></div>
                <div className="loading-row"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state">
                {Icons.stethoscope}
                <p style={{ marginTop: "12px" }}>No patient records found.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient Name</th>
                    <th>Age</th>
                    <th>Diagnosis</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td style={{ color: "hsl(217 15% 45%)", fontWeight: "500" }}>#{patient.id}</td>
                      <td>
                        <span className="patient-name">{patient.name}</span>
                      </td>
                      <td>{patient.age} years</td>
                      <td>
                        <span className="diagnosis-badge">{patient.diagnosis}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => openEditModal(patient)}
                            disabled={!isAdmin}
                            title={isAdmin ? "Edit Patient" : "Admin rights required"}
                          >
                            {Icons.edit}
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeletePatient(patient.id)}
                            disabled={!isAdmin}
                            title={isAdmin ? "Delete Patient" : "Admin rights required"}
                          >
                            {Icons.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span>
              Page {page + 1} of {totalPages} · {totalElements} total records
            </span>
            <div className="pagination-controls">
              <button
                className="btn-outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </button>
              <button
                className="btn-outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={patients.length < pageSize}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Add Patient Modal */}
      <div className={`modal-overlay ${isAddModalOpen ? "open" : ""}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">New Patient Admission</h3>
            <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>×</button>
          </div>
          <form onSubmit={handleAddPatient}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="new-name">Full Name</label>
                <input
                  id="new-name"
                  className="form-input"
                  type="text"
                  placeholder="e.g. David Miller"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-age">Age</label>
                <input
                  id="new-age"
                  className="form-input"
                  type="number"
                  placeholder="e.g. 45"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="new-diagnosis">Initial Diagnosis</label>
                <input
                  id="new-diagnosis"
                  className="form-input"
                  type="text"
                  placeholder="e.g. Pneumonia evaluation"
                  value={newPatient.diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" type="button" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                Admit Patient
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Edit Patient Modal */}
      <div className={`modal-overlay ${isEditModalOpen ? "open" : ""}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">Update Patient Records</h3>
            <button className="btn-close" onClick={() => setIsEditModalOpen(false)}>×</button>
          </div>
          <form onSubmit={handleEditPatient}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Full Name</label>
                <input
                  id="edit-name"
                  className="form-input"
                  type="text"
                  value={editingPatient.name}
                  onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-age">Age</label>
                <input
                  id="edit-age"
                  className="form-input"
                  type="number"
                  value={editingPatient.age}
                  onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-diagnosis">Diagnosis Status</label>
                <input
                  id="edit-diagnosis"
                  className="form-input"
                  type="text"
                  value={editingPatient.diagnosis}
                  onChange={(e) => setEditingPatient({ ...editingPatient, diagnosis: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                Save Updates
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
