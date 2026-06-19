"use client";

import { useEffect, useState } from "react";
import { Clock, Play, Pause, Settings, RefreshCw, Activity, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";

export default function SchedulersPage() {
  const [schedulers, setSchedulers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingScheduler, setEditingScheduler] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusDetails, setStatusDetails] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    fetchSchedulers();
    const interval = setInterval(fetchSchedulers, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedulers = async () => {
    try {
      setError(null);
      const data = await api("/schedulers");
      console.log("Fetched schedulers:", data);
      setSchedulers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch schedulers:", error);
      setError(error.message || "Failed to load schedulers");
    } finally {
      setLoading(false);
    }
  };

  const getSchedulerDetails = async (taskName) => {
    try {
      setLoadingStatus(true);
      const data = await api(`/schedulers/${taskName}`);
      console.log("Scheduler details:", data);
      setEditingScheduler(data);
      setShowEditModal(true);
    } catch (error) {
      console.error("Failed to get scheduler details:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  const getSchedulerStatus = async (taskName) => {
    try {
      setLoadingStatus(true);
      const status = await api(`/schedulers/${taskName}/status`);
      console.log("Scheduler status:", status);
      setStatusDetails({ taskName, status });
      setShowStatusModal(true);
    } catch (error) {
      console.error("Failed to get scheduler status:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingStatus(false);
    }
  };

  const toggleScheduler = async (scheduler) => {
    try {
      const action = scheduler.enabled ? "disable" : "enable";
      await api(`/schedulers/${scheduler.taskName}/${action}`, { method: "POST" });
      await fetchSchedulers();
      alert(`Scheduler ${action}d successfully!`);
    } catch (error) {
      console.error(`Failed to ${scheduler.enabled ? 'disable' : 'enable'} scheduler:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const closeEditModal = () => {
    setEditingScheduler(null);
    setShowEditModal(false);
  };

  const saveScheduler = async () => {
    try {
      await api(`/schedulers/${editingScheduler.id}`, {
        method: "PUT",
        body: JSON.stringify({
          cronExpression: editingScheduler.cronExpression || null,
          fixedRateMs: editingScheduler.fixedRateMs || null,
          enabled: editingScheduler.enabled,
          description: editingScheduler.description
        })
      });
      await fetchSchedulers();
      closeEditModal();
      alert("Scheduler updated successfully!");
    } catch (error) {
      console.error("Failed to update scheduler:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const formatLastExecuted = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getScheduleText = (scheduler) => {
    if (scheduler.cronExpression) {
      return `Cron: ${scheduler.cronExpression}`;
    } else if (scheduler.fixedRateMs) {
      const minutes = Math.floor(scheduler.fixedRateMs / 60000);
      const seconds = Math.floor((scheduler.fixedRateMs % 60000) / 1000);
      return minutes > 0 ? `Every ${minutes} min` : `Every ${seconds} sec`;
    }
    return "No schedule configured";
  };

  if (loading) {
    return (
      <AppShell title="Scheduler Management" subtitle="Manage system scheduled tasks">
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <RefreshCw size={48} style={{ animation: "spin 1s linear infinite", color: "var(--fg-muted)", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--fg-muted)" }}>Loading schedulers...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Scheduler Management" subtitle="Manage system scheduled tasks">
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <AlertCircle size={48} style={{ color: "#ef4444", margin: "0 auto 16px" }} />
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>
          <button onClick={fetchSchedulers} className="btn btn-primary">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </AppShell>
    );
  }

  if (!schedulers || schedulers.length === 0) {
    return (
      <AppShell title="Scheduler Management" subtitle="Manage system scheduled tasks">
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <Clock size={48} style={{ color: "var(--fg-muted)", margin: "0 auto 16px" }} />
          <p style={{ color: "var(--fg-muted)", marginBottom: 8 }}>No schedulers configured</p>
          <small style={{ color: "var(--fg-muted)" }}>
            Schedulers will be created automatically on application startup
          </small>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Scheduler Management" subtitle="Manage system scheduled tasks">
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 24 }}>
        <div className="stat-card">
          <span className="label">Total Schedulers</span>
          <div className="value">{schedulers.length}</div>
        </div>
        <div className="stat-card">
          <span className="label">Active</span>
          <div className="value" style={{ color: "#10b981" }}>
            {schedulers.filter(s => s.enabled).length}
          </div>
        </div>
        <div className="stat-card">
          <span className="label">Disabled</span>
          <div className="value" style={{ color: "#6b7280" }}>
            {schedulers.filter(s => !s.enabled).length}
          </div>
        </div>
        <div className="stat-card">
          <span className="label">Total Executions</span>
          <div className="value">
            {schedulers.reduce((sum, s) => sum + (s.executionCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Scheduler Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
        {schedulers.map((scheduler) => (
          <div key={scheduler.id} className="panel" style={{ padding: 0 }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: scheduler.enabled ? "#10b98115" : "#6b728015",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: scheduler.enabled ? "#10b981" : "#6b7280"
                    }}
                  >
                    {scheduler.enabled ? <Activity size={20} /> : <Pause size={20} />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{scheduler.taskName}</h3>
                    <span
                      className={`badge ${scheduler.enabled ? "badge-success" : "badge-muted"}`}
                      style={{ marginTop: 4 }}
                    >
                      {scheduler.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => getSchedulerDetails(scheduler.taskName)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                  disabled={loadingStatus}
                >
                  <Settings size={14} /> Edit
                </button>
              </div>

              <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", margin: "12px 0" }}>
                {scheduler.description || "No description"}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginBottom: 4 }}>
                    <Clock size={14} style={{ display: "inline", marginRight: 4 }} />
                    Schedule
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {getScheduleText(scheduler)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginBottom: 4 }}>
                    <Activity size={14} style={{ display: "inline", marginRight: 4 }} />
                    Executions
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {scheduler.executionCount || 0} times
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginBottom: 4 }}>
                  <Calendar size={14} style={{ display: "inline", marginRight: 4 }} />
                  Last Executed
                </div>
                <div style={{ fontSize: "0.9rem" }}>
                  {formatLastExecuted(scheduler.lastExecuted)}
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 20px", backgroundColor: "var(--bg-secondary)", display: "flex", justifyContent: "space-between", gap: 8 }}>
              <button
                onClick={() => toggleScheduler(scheduler)}
                className={`btn btn-sm ${scheduler.enabled ? "btn-outline" : "btn-primary"}`}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {scheduler.enabled ? (
                  <>
                    <Pause size={14} /> Disable
                  </>
                ) : (
                  <>
                    <Play size={14} /> Enable
                  </>
                )}
              </button>

              <button
                onClick={() => getSchedulerStatus(scheduler.taskName)}
                className="btn btn-outline btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
                disabled={loadingStatus}
              >
                <Activity size={14} /> Status
              </button>

              <button
                onClick={fetchSchedulers}
                className="btn btn-outline btn-sm"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingScheduler && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={closeEditModal}
        >
          <div
            className="panel"
            style={{ width: "90%", maxWidth: 600, padding: 24, maxHeight: "90vh", overflow: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Edit Scheduler: {editingScheduler.taskName}</h2>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Description
              </label>
              <textarea
                value={editingScheduler.description || ""}
                onChange={(e) => setEditingScheduler({ ...editingScheduler, description: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid var(--border)" }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                Cron Expression
              </label>
              <input
                type="text"
                value={editingScheduler.cronExpression || ""}
                onChange={(e) => setEditingScheduler({ ...editingScheduler, cronExpression: e.target.value, fixedRateMs: null })}
                placeholder="e.g., 0 0 * * * * (every hour)"
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid var(--border)" }}
              />
              <small style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>
                Format: second minute hour day month dayOfWeek
              </small>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                OR Fixed Rate (milliseconds)
              </label>
              <input
                type="number"
                value={editingScheduler.fixedRateMs || ""}
                onChange={(e) => setEditingScheduler({ ...editingScheduler, fixedRateMs: e.target.value ? parseInt(e.target.value) : null, cronExpression: null })}
                placeholder="e.g., 300000 (5 minutes)"
                style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid var(--border)" }}
              />
              <small style={{ color: "var(--fg-muted)", fontSize: "0.85rem" }}>
                Example: 300000ms = 5 minutes, 60000ms = 1 minute
              </small>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={editingScheduler.enabled}
                  onChange={(e) => setEditingScheduler({ ...editingScheduler, enabled: e.target.checked })}
                />
                <span>Enabled</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={closeEditModal} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={saveScheduler} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && statusDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="panel"
            style={{ width: "90%", maxWidth: 500, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Scheduler Status</h2>
            <div style={{ 
              backgroundColor: "var(--bg-secondary)", 
              padding: 16, 
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>
              {statusDetails.status}
            </div>
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button onClick={() => setShowStatusModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
