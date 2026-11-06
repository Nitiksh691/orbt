"use client";
export default function OffersPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "56px 20px 100px" }}>
      <div className="otw-container" style={{ maxWidth: 800 }}>
        <p style={{ margin: "0 0 14px", color: "#9A9A96", fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>// Drop offers</p>
        <h1 style={{ fontSize: "clamp(1.9rem, 6vw, 3rem)", fontWeight: 900, marginBottom: "8px", color: "#F4F4F2", textTransform: "uppercase", lineHeight: 0.95 }}>Offers & Promos</h1>
        <p style={{ color: "#A8A8A4", marginBottom: "32px", fontSize: "1.05rem" }}>
          Current deals available on ORBT clothing.
        </p>
        <div className="item-glass-card" style={{ padding: "56px 32px", textAlign: "center", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✦</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#F4F4F2" }}>No offers right now</h2>
          <p style={{ color: "#A8A8A4", marginTop: 8 }}>Check back for the next drop code.</p>
        </div>
      </div>
    </div>
  );
}
