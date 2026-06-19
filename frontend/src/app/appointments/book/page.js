"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId: "", patientId: "", appointmentDate: "", appointmentTime: "", notes: "" });
  const [error, setError] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoadingDoctors(true);
    api("/doctors?size=50")
      .then((d) => {
        setDoctors(d.content || d || []);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try refreshing the page.");
      })
      .finally(() => setLoadingDoctors(false));
    
    if (user?.role !== "PATIENT") {
      api("/patients?size=50")
        .then((p) => setPatients(p.content || p || []))
        .catch((err) => console.error("Error fetching patients:", err));
    } else if (user?.patientId) {
      setForm((f) => ({ ...f, patientId: String(user.patientId) }));
    }
  }, [user]);

  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      setLoadingSlots(true);
      setError("");
      api(`/appointments/slots?doctorId=${form.doctorId}&date=${form.appointmentDate}`)
        .then((slotsData) => {
          setSlots(slotsData || []);
          if (!slotsData || slotsData.length === 0) {
            setError("No available time slots for this date. Please choose another date.");
          }
        })
        .catch((err) => {
          console.error("Error fetching slots:", err);
          setError("Failed to load available time slots.");
          setSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [form.doctorId, form.appointmentDate]);

  const book = async () => {
    setError("");
    setSubmitting(true);
    try {
      await api("/appointments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          doctorId: Number(form.doctorId),
          patientId: Number(form.patientId),
        }),
      });
      router.push(user?.role === "PATIENT" ? "/appointments/my" : "/appointments");
    } catch (e) {
      setError(e.message || "Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === Number(form.doctorId));

  return (
    <AppShell title="Book appointment" subtitle="Schedule an appointment with a doctor">
      <div className="steps">
        {[
          { num: 1, label: "Select Doctor" },
          { num: 2, label: "Choose Date" },
          { num: 3, label: "Select Time" },
          { num: 4, label: "Confirm" }
        ].map((s) => (
          <div key={s.num} className={`step ${step === s.num ? "active" : step > s.num ? "done" : ""}`}>
            <strong>{s.num}</strong> {s.label}
          </div>
        ))}
      </div>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="panel" style={{ padding: 32, maxWidth: 600 }}>
        {step === 1 && (
          <>
            <h3 style={{ marginBottom: 20, fontSize: "1.2rem" }}>Select a doctor</h3>
            {loadingDoctors ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
                <p style={{ marginTop: 12, color: "var(--fg-muted)" }}>Loading doctors...</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Doctor</label>
                  <select className="select" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                    <option value="">Choose a doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.name} — {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button type="button" className="btn btn-primary" disabled={!form.doctorId} onClick={() => setStep(2)}>
                    Next: Choose Date
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ marginBottom: 20, fontSize: "1.2rem" }}>Choose appointment date</h3>
            {selectedDoctor && (
              <div style={{ marginBottom: 20, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius)" }}>
                <strong>Selected Doctor:</strong> Dr. {selectedDoctor.name} — {selectedDoctor.specialization}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input 
                className="input" 
                type="date" 
                value={form.appointmentDate} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} 
              />
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
              <button type="button" className="btn btn-primary" disabled={!form.appointmentDate} onClick={() => setStep(3)}>
                Next: Select Time
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ marginBottom: 20, fontSize: "1.2rem" }}>Select time slot</h3>
            {selectedDoctor && (
              <div style={{ marginBottom: 20, padding: 12, background: "var(--bg-muted)", borderRadius: "var(--radius)" }}>
                <strong>Doctor:</strong> Dr. {selectedDoctor.name}<br />
                <strong>Date:</strong> {form.appointmentDate}
              </div>
            )}
            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
                <p style={{ marginTop: 12, color: "var(--fg-muted)" }}>Loading available slots...</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Available Time Slots</label>
                  <select className="select" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}>
                    <option value="">Choose a time...</option>
                    {slots.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {user?.role !== "PATIENT" && (
                  <div className="form-group">
                    <label className="form-label">Patient</label>
                    <select className="select" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                      <option value="">Choose a patient...</option>
                      {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea 
                    className="input" 
                    rows="3" 
                    placeholder="Any additional information..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    disabled={!form.appointmentTime || (user?.role !== "PATIENT" && !form.patientId)} 
                    onClick={() => setStep(4)}
                  >
                    Next: Confirm
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 4 && (
          <>
            <h3 style={{ marginBottom: 20, fontSize: "1.2rem" }}>Confirm your appointment</h3>
            <div style={{ padding: 20, background: "var(--bg-muted)", borderRadius: "var(--radius)", marginBottom: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <strong>Doctor:</strong> Dr. {selectedDoctor?.name} ({selectedDoctor?.specialization})
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Date:</strong> {form.appointmentDate}
              </div>
              <div style={{ marginBottom: 12 }}>
                <strong>Time:</strong> {form.appointmentTime}
              </div>
              {form.notes && (
                <div>
                  <strong>Notes:</strong> {form.notes}
                </div>
              )}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={book}
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
