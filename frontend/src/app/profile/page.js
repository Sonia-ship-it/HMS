"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        if (user.role === "PATIENT" && user.patientId) {
          const patient = await api(`/patients/${user.patientId}`);
          setForm({
            name: patient.name || "",
            phone: patient.phone || "",
            dateOfBirth: patient.dateOfBirth || "",
            gender: patient.gender || "",
            address: patient.address || "",
          });
        } else if (user.role === "DOCTOR" && user.doctorId) {
          const doctor = await api(`/doctors/${user.doctorId}`);
          setForm({
            name: doctor.name || "",
            phone: doctor.phone || "",
            dateOfBirth: "",
            gender: "",
            address: "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Determine the endpoint based on user role
      let endpoint = "";
      let updateData = {};

      if (user.role === "PATIENT" && user.patientId) {
        endpoint = `/patients/${user.patientId}`;
        updateData = {
          name: form.name,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          address: form.address,
        };
      } else if (user.role === "DOCTOR" && user.doctorId) {
        endpoint = `/doctors/${user.doctorId}`;
        updateData = {
          name: form.name,
          phone: form.phone,
        };
      } else {
        throw new Error("Unable to update profile for this user type");
      }

      await api(endpoint, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      setSuccess("Profile updated successfully!");
      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // This endpoint needs to be created on the backend
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setSuccess("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordModal(false);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="My profile" subtitle="Update your account information">
      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}
      {success && (
        <div className="success-banner" style={{ marginBottom: 16, padding: 12, background: "#d4edda", color: "#155724", borderRadius: 4 }}>
          {success}
        </div>
      )}

      <form className="panel" style={{ padding: 28, maxWidth: 480 }} onSubmit={handleUpdateProfile}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email (Your unique identifier - cannot be changed)</label>
          <input
            className="input"
            type="email"
            value={user?.email || ""}
            disabled
            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
          />
          <small style={{ display: "block", marginTop: "6px", fontSize: "0.75rem", color: "#718096" }}>
            This is your permanent login identifier
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>

        {user?.role === "PATIENT" && (
          <>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="input"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="select"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="input"
                rows="3"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="input" defaultValue={user?.username || ""} disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} />
        </div>

        <div className="form-group">
          <label className="form-label">Role (Cannot be changed)</label>
          <input className="input" defaultValue={user?.role || ""} disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update profile"}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          style={{ marginLeft: 12 }}
          onClick={() => setShowPasswordModal(true)}
        >
          Change password
        </button>
      </form>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginLeft: 12 }}
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

