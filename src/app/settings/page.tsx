"use client";
import Link from "next/link";
import { useApp } from "@/lib/context";

export default function SettingsPage() {
  const { profile } = useApp();

  return (
    <div style={{ minHeight: "100vh", padding: "56px 20px 100px" }}>
      <div className="otw-container" style={{ maxWidth: 800 }}>
        <p style={{ margin: "0 0 14px", color: "#9A9A96", fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          // ORBT account
        </p>
        <h1 style={{ fontSize: "clamp(1.9rem, 6vw, 3rem)", fontWeight: 900, marginBottom: "8px", color: "#F4F4F2", textTransform: "uppercase", lineHeight: 0.95 }}>Settings</h1>
        <p style={{ color: "#A8A8A4", marginBottom: "32px", fontSize: "1.05rem" }}>
          Manage your ORBT account preferences.
        </p>

        <div className="item-glass-card" style={{ padding: "32px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 16, color: "#F4F4F2" }}>Profile Information</h2>
          {profile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, color: "#C9C9C5" }}>
              <div><strong style={{ color: "#F4F4F2" }}>Name:</strong> {profile.name}</div>
              <div><strong style={{ color: "#F4F4F2" }}>Phone:</strong> {profile.phone}</div>
              <div><strong style={{ color: "#F4F4F2" }}>City / Base:</strong> {profile.college || "Not specified"}</div>
              <div><strong style={{ color: "#F4F4F2" }}>Role:</strong> {profile.role}</div>
            </div>
          ) : (
            <p style={{ color: "#A8A8A4" }}>Please log in to view settings.</p>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
          <Link href="/profile" style={{ background: "#F4F4F2", color: "#0A0A0A", borderRadius: "99px", padding: "12px 20px", textDecoration: "none", fontWeight: 800, fontSize: "0.82rem" }}>Edit profile</Link>
          <Link href="/orders" style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#F4F4F2", borderRadius: "99px", padding: "12px 20px", textDecoration: "none", fontWeight: 800, fontSize: "0.82rem" }}>View orders</Link>
        </div>
      </div>
    </div>
  );
}
