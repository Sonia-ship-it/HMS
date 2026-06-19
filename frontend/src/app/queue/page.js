"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LiveQueuePage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [queue, setQueue] = useState(null);

  useEffect(() => {
    api("/doctors?size=50").then((d) => {
      setDoctors(d.content || []);
      
      // Auto-select doctor if logged in user is a doctor
      if (user?.role === "DOCTOR" && user?.doctorId) {
        setDoctorId(String(user.doctorId));
      } else if (d.content?.[0]) {
        setDoctorId(String(d.content[0].id));
      }
    });
  }, [user]);

  const load = () => doctorId && api(`/queue/${doctorId}`).then(setQueue);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [doctorId]);

  const isDoctor = user?.role === "DOCTOR";

  return (
    <AppShell title="Live queue" subtitle="Real-time token and wait estimates">
      {/* Only show dropdown for non-doctors */}
      {!isDoctor && (
        <div className="form-group" style={{ maxWidth: 320, marginBottom: 20 }}>
          <label className="form-label">Doctor</label>
          <select className="select" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      )}
      
      {queue && (
        <>
          <p style={{ marginBottom: 8, fontWeight: 600 }}>Dr. {queue.doctorName}</p>
          <div className="queue-now">
            <div style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Now serving</div>
            {queue.currentToken ?? "—"}
          </div>
          <div className="panel" style={{ padding: 22 }}>
            <h3 style={{ marginBottom: 16 }}>Waiting ({queue.totalWaiting})</h3>
            <div className="queue-waiting">
              {queue.waiting?.map((w, i) => (
                <span key={w.queueEntryId} className={`token-pill ${i === 0 ? "next" : ""}`}>{w.token}</span>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Show Call Next if there are waiting patients */}
              {queue.waiting && queue.waiting.length > 0 && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => api(`/queue/${doctorId}/call-next`, { method: "POST" }).then(load)}
                >
                  Call next
                </button>
              )}
              
              {/* Show Complete button for currently serving patient */}
              {queue.currentQueueEntryId && (
                <button 
                  type="button" 
                  className="btn btn-success" 
                  onClick={() => api(`/queue/entries/${queue.currentQueueEntryId}/complete`, { method: "POST" }).then(load)}
                >
                  Complete Appointment
                </button>
              )}
              
              {/* Skip button for first waiting patient */}
              {queue.waiting?.[0] && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => api(`/queue/entries/${queue.waiting[0].queueEntryId}/skip`, { method: "POST" }).then(load)}
                >
                  Skip Next
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
