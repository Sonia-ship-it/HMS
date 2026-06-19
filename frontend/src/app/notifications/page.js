"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Bell, Calendar, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
      const response = await fetch(`${apiUrl}/notifications?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.content || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
      await fetch(`${apiUrl}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar size={20} />;
      case "QUEUE":
        return <Clock size={20} />;
      case "SUCCESS":
        return <CheckCircle size={20} />;
      case "WARNING":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "APPOINTMENT":
        return "#3b82f6";
      case "QUEUE":
        return "#f59e0b";
      case "SUCCESS":
        return "#10b981";
      case "WARNING":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <AppShell title="Notifications" subtitle="Appointment and queue updates">
        <div className="panel" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--fg-muted)" }}>Loading notifications...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Notifications" subtitle="Appointment and queue updates">
      <div className="panel">
        {notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Bell size={48} style={{ color: "var(--fg-muted)", margin: "0 auto 16px" }} />
            <p style={{ color: "var(--fg-muted)", fontSize: "0.95rem" }}>
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markAsRead(n.id)}
              style={{
                padding: "18px 22px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                backgroundColor: n.read ? "transparent" : "rgba(59, 130, 246, 0.05)",
                cursor: n.read ? "default" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: `${getIconColor(n.type)}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: getIconColor(n.type),
                  flexShrink: 0,
                }}
              >
                {getNotificationIcon(n.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{n.title}</strong>
                  {!n.read && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#3b82f6",
                        marginLeft: "12px",
                        marginTop: "4px",
                      }}
                    />
                  )}
                </div>
                
                <p style={{ color: "var(--fg-muted)", fontSize: "0.9rem", marginTop: "4px", marginBottom: "8px" }}>
                  {n.message}
                </p>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span className="badge badge-muted" style={{ fontSize: "0.75rem" }}>
                    {n.type}
                  </span>
                  <span style={{ color: "var(--fg-muted)", fontSize: "0.8rem" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
