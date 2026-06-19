"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Calendar, Users, TrendingUp, Activity } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { generateReportPDF } from "@/lib/pdfGenerator";

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/dashboard"),
      api("/appointments?page=0&size=100"),
      api("/patients?page=0&size=100"),
      api("/doctors?page=0&size=50")
    ])
      .then(([dashData, apptData, patientData, doctorData]) => {
        setStats(dashData);
        setAppointments(apptData.content || []);
        setPatients(patientData.content || []);
        setDoctors(doctorData.content || []);
      })
      .catch(err => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  const generateAppointmentsReport = () => {
    const reportData = {
      title: 'Appointments Report',
      dateRange: `Last 7 Days - ${new Date().toLocaleDateString()}`,
      stats: [
        { label: 'Total Appointments', value: appointments.length },
        { label: 'Scheduled', value: appointments.filter(a => a.status === 'SCHEDULED').length },
        { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length },
        { label: 'Cancelled', value: appointments.filter(a => a.status === 'CANCELLED').length },
      ],
      tableHeaders: ['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Reason'],
      tableData: appointments.slice(0, 50).map(a => [
        a.appointmentDate || 'N/A',
        a.appointmentTime || 'N/A',
        a.patientName || 'Unknown',
        a.doctorName || 'Unknown',
        a.status || 'N/A',
        a.reason || 'General Checkup'
      ])
    };
    
    generateReportPDF(reportData, 'appointments_report');
  };

  const generateDoctorWorkloadReport = () => {
    const doctorAppointments = {};
    appointments.forEach(a => {
      const docId = a.doctorId;
      if (!doctorAppointments[docId]) {
        doctorAppointments[docId] = { 
          name: a.doctorName || 'Unknown', 
          total: 0, 
          scheduled: 0, 
          completed: 0 
        };
      }
      doctorAppointments[docId].total++;
      if (a.status === 'SCHEDULED') doctorAppointments[docId].scheduled++;
      if (a.status === 'COMPLETED') doctorAppointments[docId].completed++;
    });

    const reportData = {
      title: 'Doctor Workload Report',
      dateRange: `Generated on ${new Date().toLocaleDateString()}`,
      stats: [
        { label: 'Active Doctors', value: doctors.length },
        { label: 'Total Appointments', value: appointments.length },
        { label: 'Average per Doctor', value: doctors.length ? Math.round(appointments.length / doctors.length) : 0 },
      ],
      tableHeaders: ['Doctor Name', 'Specialization', 'Total Appts', 'Scheduled', 'Completed', 'Workload'],
      tableData: doctors.map(d => {
        const apptData = doctorAppointments[d.id] || { total: 0, scheduled: 0, completed: 0 };
        return [
          d.name || 'Unknown',
          d.specialization || 'General',
          apptData.total,
          apptData.scheduled,
          apptData.completed,
          apptData.total > 10 ? 'Heavy' : apptData.total > 5 ? 'Moderate' : 'Light'
        ];
      })
    };
    
    generateReportPDF(reportData, 'doctor_workload_report');
  };

  const generateFullSystemReport = () => {
    const reportData = {
      title: 'Complete System Report',
      dateRange: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      stats: [
        { label: 'Total Patients', value: patients.length },
        { label: 'Total Doctors', value: doctors.length },
        { label: 'Total Appointments', value: appointments.length },
        { label: 'Scheduled', value: appointments.filter(a => a.status === 'SCHEDULED').length },
        { label: 'Completed', value: appointments.filter(a => a.status === 'COMPLETED').length },
        { label: 'Cancelled', value: appointments.filter(a => a.status === 'CANCELLED').length },
      ],
      tableHeaders: ['Category', 'Count', 'Details', 'Status'],
      tableData: [
        ['Patients', patients.length, `${patients.filter(p => p.gender === 'MALE').length} Male, ${patients.filter(p => p.gender === 'FEMALE').length} Female`, 'Active'],
        ['Doctors', doctors.length, doctors.map(d => d.specialization).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'Various', 'Active'],
        ['Scheduled Appointments', appointments.filter(a => a.status === 'SCHEDULED').length, 'Upcoming visits', 'Pending'],
        ['Completed Appointments', appointments.filter(a => a.status === 'COMPLETED').length, 'Successfully finished', 'Done'],
        ['Cancelled Appointments', appointments.filter(a => a.status === 'CANCELLED').length, 'Cancelled by patient/doctor', 'Cancelled'],
        ['Checked-in Appointments', appointments.filter(a => a.status === 'CHECKED_IN').length, 'Waiting for doctor', 'In Progress'],
      ]
    };
    
    generateReportPDF(reportData, 'full_system_report');
  };

  return (
    <AppShell title="Reports & Analytics" subtitle="Generate and download system reports">
      {/* Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="report-card">
          <div className="report-card-icon" style={{ backgroundColor: '#3b82f6' }}>
            <Calendar size={24} color="white" />
          </div>
          <div className="report-card-content">
            <h3>Appointments Report</h3>
            <p>Daily appointment statistics and trends</p>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={generateAppointmentsReport}
              disabled={loading}
              style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon" style={{ backgroundColor: '#8b5cf6' }}>
            <Users size={24} color="white" />
          </div>
          <div className="report-card-content">
            <h3>Doctor Workload</h3>
            <p>Appointments per doctor and workload distribution</p>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={generateDoctorWorkloadReport}
              disabled={loading}
              style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-icon" style={{ backgroundColor: '#10b981' }}>
            <TrendingUp size={24} color="white" />
          </div>
          <div className="report-card-content">
            <h3>Complete System Report</h3>
            <p>Comprehensive overview of all metrics</p>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={generateFullSystemReport}
              disabled={loading}
              style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <span className="label">Total Appointments</span>
          <div className="value">{loading ? '...' : appointments.length}</div>
        </div>
        <div className="stat-card">
          <span className="label">Total Patients</span>
          <div className="value">{loading ? '...' : patients.length}</div>
        </div>
        <div className="stat-card">
          <span className="label">Total Doctors</span>
          <div className="value">{loading ? '...' : doctors.length}</div>
        </div>
        <div className="stat-card">
          <span className="label">Completed Today</span>
          <div className="value">{loading ? '...' : appointments.filter(a => a.status === 'COMPLETED').length}</div>
        </div>
      </div>

      {/* Recent Appointments Details */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Appointments</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--fg-muted)' }}>Showing last 10 appointments</span>
          </div>
        </div>
        <div className="panel-body">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty">Loading...</td></tr>
                ) : appointments.length > 0 ? (
                  appointments.slice(0, 10).map((a) => (
                    <tr key={a.id}>
                      <td>{a.appointmentDate || 'N/A'}</td>
                      <td>{a.appointmentTime || 'N/A'}</td>
                      <td><strong>{a.patientName || 'Unknown'}</strong></td>
                      <td>{a.doctorName || 'Unknown'}</td>
                      <td>{a.reason || 'General Checkup'}</td>
                      <td>
                        <span className={`badge ${
                          a.status === 'COMPLETED' ? 'badge-success' : 
                          a.status === 'SCHEDULED' ? 'badge-primary' : 
                          a.status === 'CANCELLED' ? 'badge-risk' : 'badge-warning'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className="empty">No appointments available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Doctor Workload Details */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-head">
          <h3>Doctor Workload Analysis</h3>
        </div>
        <div className="panel-body">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Total Appointments</th>
                  <th>Scheduled</th>
                  <th>Completed</th>
                  <th>Workload</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="empty">Loading...</td></tr>
                ) : doctors.length > 0 ? (
                  doctors.map((d) => {
                    const doctorAppts = appointments.filter(a => a.doctorId === d.id);
                    const scheduled = doctorAppts.filter(a => a.status === 'SCHEDULED').length;
                    const completed = doctorAppts.filter(a => a.status === 'COMPLETED').length;
                    const total = doctorAppts.length;
                    
                    return (
                      <tr key={d.id}>
                        <td><strong>{d.name || 'Unknown'}</strong></td>
                        <td>{d.specialization || 'General'}</td>
                        <td><strong>{total}</strong></td>
                        <td>{scheduled}</td>
                        <td>{completed}</td>
                        <td>
                          <span className={`badge ${
                            total > 10 ? 'badge-risk' : 
                            total > 5 ? 'badge-warning' : 'badge-success'
                          }`}>
                            {total > 10 ? 'Heavy' : total > 5 ? 'Moderate' : 'Light'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={6} className="empty">No doctors available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Statistics */}
      <div className="panel">
        <div className="panel-head">
          <h3>Patient Demographics</h3>
        </div>
        <div className="panel-body">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Total Appointments</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="empty">Loading...</td></tr>
                ) : patients.length > 0 ? (
                  patients.slice(0, 10).map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name || 'Unknown'}</strong></td>
                      <td>{p.gender || 'N/A'}</td>
                      <td>{p.phoneNumber || 'N/A'}</td>
                      <td>{p.address || 'N/A'}</td>
                      <td><strong>{appointments.filter(a => a.patientId === p.id).length}</strong></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="empty">No patients available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
