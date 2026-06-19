"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCog, 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText,
  Activity,
  BarChart,
  Settings,
  UserPlus
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/dashboard")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = {
    ADMIN: [
      { label: "Total Patients", value: stats?.totalPatients, icon: Users, color: "#3b82f6" },
      { label: "Total Doctors", value: stats?.totalDoctors, icon: UserCog, color: "#8b5cf6" },
      { label: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: "#10b981" },
      { label: "Active Queue", value: stats?.activeQueueCount, icon: Clock, color: "#f59e0b" },
    ],
    DOCTOR: [
      { label: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: "#3b82f6" },
      { label: "Waiting Patients", value: stats?.waitingPatients, icon: Clock, color: "#f59e0b" },
      { label: "Completed Today", value: stats?.completedToday, icon: CheckCircle, color: "#10b981" },
    ],
    RECEPTIONIST: [
      { label: "Check-ins Today", value: stats?.checkInsToday, icon: CheckCircle, color: "#10b981" },
      { label: "Waiting Patients", value: stats?.waitingPatients, icon: Clock, color: "#f59e0b" },
      { label: "Scheduled", value: stats?.scheduledToday, icon: FileText, color: "#3b82f6" },
    ],
    PATIENT: [
      { label: "Upcoming Appointments", value: stats?.upcomingAppointments ?? 0, icon: Calendar, color: "#3b82f6" },
      { label: "Completed", value: stats?.completedAppointments ?? 0, icon: CheckCircle, color: "#10b981" },
      { label: "Your Queue Number", value: stats?.queueNumber ?? "—", icon: Activity, color: "#f59e0b" },
    ],
  };

  const roleCards = cards[user?.role] || cards.PATIENT;

  return (
    <AppShell 
      title={`Welcome back, ${user?.fullName || user?.username}!`} 
      subtitle="Here's what's happening today"
    >
      {/* Stats Overview */}
      <div className="dashboard-stats-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="dashboard-stat-card loading">
              <div className="stat-skeleton"></div>
            </div>
          ))
        ) : (
          roleCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div 
                key={idx} 
                className="dashboard-stat-card-modern"
              >
                <div 
                  className="stat-icon-modern" 
                  style={{ backgroundColor: card.color }}
                >
                  <IconComponent size={24} color="white" strokeWidth={2} />
                </div>
                <div className="stat-info-modern">
                  <div className="stat-label-modern">{card.label}</div>
                  <div className="stat-value-modern">
                    {card.value ?? "—"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="dashboard-actions-grid">
          {user?.role === "PATIENT" && (
            <>
              <Link href="/appointments/book" className="dashboard-action-card primary">
                <div className="action-icon"><Calendar size={24} /></div>
                <div className="action-content">
                  <h3>Book Appointment</h3>
                  <p>Schedule a visit with a doctor</p>
                </div>
              </Link>
              <Link href="/appointments/my" className="dashboard-action-card">
                <div className="action-icon"><FileText size={24} /></div>
                <div className="action-content">
                  <h3>My Appointments</h3>
                  <p>View your scheduled visits</p>
                </div>
              </Link>
              <Link href="/profile" className="dashboard-action-card">
                <div className="action-icon"><Users size={24} /></div>
                <div className="action-content">
                  <h3>My Profile</h3>
                  <p>Update your information</p>
                </div>
              </Link>
              <Link href="/queue/board" className="dashboard-action-card">
                <div className="action-icon"><Activity size={24} /></div>
                <div className="action-content">
                  <h3>Queue Board</h3>
                  <p>Check real-time queue status</p>
                </div>
              </Link>
            </>
          )}

          {(user?.role === "RECEPTIONIST" || user?.role === "ADMIN") && (
            <>
              <Link href="/appointments/book" className="dashboard-action-card primary">
                <div className="action-icon"><Calendar size={24} /></div>
                <div className="action-content">
                  <h3>Book Appointment</h3>
                  <p>Schedule for a patient</p>
                </div>
              </Link>
              <Link href="/patients" className="dashboard-action-card">
                <div className="action-icon"><Users size={24} /></div>
                <div className="action-content">
                  <h3>Manage Patients</h3>
                  <p>View and update patient records</p>
                </div>
              </Link>
              <Link href="/doctors" className="dashboard-action-card">
                <div className="action-icon"><UserCog size={24} /></div>
                <div className="action-content">
                  <h3>Doctors</h3>
                  <p>View doctor schedules</p>
                </div>
              </Link>
              <Link href="/queue" className="dashboard-action-card">
                <div className="action-icon"><Clock size={24} /></div>
                <div className="action-content">
                  <h3>Queue Management</h3>
                  <p>Manage patient queues</p>
                </div>
              </Link>
            </>
          )}

          {user?.role === "DOCTOR" && (
            <>
              <Link href="/appointments" className="dashboard-action-card primary">
                <div className="action-icon"><Calendar size={24} /></div>
                <div className="action-content">
                  <h3>My Appointments</h3>
                  <p>View today's schedule</p>
                </div>
              </Link>
              <Link href="/queue" className="dashboard-action-card">
                <div className="action-icon"><Clock size={24} /></div>
                <div className="action-content">
                  <h3>My Queue</h3>
                  <p>Manage your patient queue</p>
                </div>
              </Link>
              <Link href="/patients" className="dashboard-action-card">
                <div className="action-icon"><Users size={24} /></div>
                <div className="action-content">
                  <h3>Patients</h3>
                  <p>View patient records</p>
                </div>
              </Link>
              <Link href="/profile" className="dashboard-action-card">
                <div className="action-icon"><Users size={24} /></div>
                <div className="action-content">
                  <h3>My Profile</h3>
                  <p>Update your information</p>
                </div>
              </Link>
            </>
          )}

          {user?.role === "ADMIN" && (
            <>
              <Link href="/users" className="dashboard-action-card">
                <div className="action-icon"><UserPlus size={24} /></div>
                <div className="action-content">
                  <h3>User Management</h3>
                  <p>Manage system users</p>
                </div>
              </Link>
              <Link href="/reports" className="dashboard-action-card">
                <div className="action-icon"><BarChart size={24} /></div>
                <div className="action-content">
                  <h3>Reports</h3>
                  <p>View analytics and insights</p>
                </div>
              </Link>
              <Link href="/settings" className="dashboard-action-card">
                <div className="action-icon"><Settings size={24} /></div>
                <div className="action-content">
                  <h3>Settings</h3>
                  <p>System configuration</p>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Activity</h2>
        <div className="panel">
          <div className="panel-body">
            <div className="dashboard-timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">System initialized</div>
                  <div className="timeline-time">Welcome to SmartHMS</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
