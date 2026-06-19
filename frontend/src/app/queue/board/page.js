"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function QueueBoardPage() {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    const load = () => api("/queue/board").then(setBoard);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", padding: 48 }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <p style={{ letterSpacing: "0.3em", fontSize: "0.85rem", opacity: 0.5 }}>SMART HOSPITAL</p>
        <h1 style={{ fontSize: "3rem", fontWeight: 700, letterSpacing: "-0.04em" }}>NOW SERVING</h1>
      </div>
      <div className="board-grid">
        {board.map((room) => (
          <div key={room.doctorId} className="board-room">
            <div className="room">{room.room}</div>
            <div style={{ opacity: 0.7, marginTop: 8 }}>{room.doctorName}</div>
            <div className="token">{room.currentToken ?? "—"}</div>
            <div className="label">Token</div>
            <p style={{ marginTop: 16, fontSize: "0.8rem", opacity: 0.4 }}>{room.waitingCount} waiting</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", marginTop: 48, opacity: 0.35, fontSize: "0.8rem" }}>
        <a href="/queue" style={{ color: "#fff" }}>Staff view</a>
      </p>
    </div>
  );
}
