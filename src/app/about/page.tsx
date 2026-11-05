"use client";
import { Phone, Mail, Heart, Shirt, Truck, Users } from "lucide-react";
import Footer from "@/components/Footer";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_TEL, SUPPORT_EMAIL } from "@/lib/company";

const VALUES = [
  { icon: <Shirt size={22} />, title: "Made to wear", desc: "Cuts and fabrics chosen for real days — not just the lookbook." },
  { icon: <Truck size={22} />, title: "Ships India-wide", desc: "Full doorstep addresses, tracked shipping, and clear delivery windows." },
  { icon: <Heart size={22} />, title: "Independent label", desc: "We grow by making better pieces, not by chasing every trend." },
  { icon: <Users size={22} />, title: "Community first", desc: "Drops, fits, and feedback shaped with the people who wear KLOYH." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#ffffff", minHeight: "calc(100vh - 60px)" }}>
      <section style={{
        padding: "100px 24px 60px", textAlign: "center",
      }}>
        <div className="otw-container" style={{ maxWidth: 720 }}>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15, color: "#0A0F2E" }}>
            Clothing designed to be worn.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#64748B", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 28px" }}>
            KLOYH is an independent fashion label. We skip the noise and ship contemporary clothing, denim, and accessories across India.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F1F5F9", color: "#475569", borderRadius: 999, padding: "8px 18px", fontSize: "0.85rem", fontWeight: 700 }}>
            Independent · Pan-India shipping · Easy returns
          </div>
        </div>
      </section>

      <div className="otw-container" style={{ maxWidth: 900, paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 60 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ padding: "24px 0" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9", color: "#0A0F2E", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                {v.icon}
              </div>
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0A0F2E", marginBottom: 8 }}>{v.title}</h3>
              <p style={{ color: "#64748B", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "60px 24px", borderTop: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.4rem", fontWeight: 900, color: "#0A0F2E", marginBottom: 12 }}>Say Hello</h2>
          <p style={{ color: "#64748B", marginBottom: 24, fontSize: "0.95rem" }}>Questions about a drop, fit, or wholesale? We’re a message away.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={SUPPORT_TEL} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A0F2E", color: "#fff", padding: "12px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: "0.95rem" }}>
              <Phone size={18} /> {SUPPORT_PHONE_DISPLAY}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F1F5F9", color: "#0A0F2E", padding: "12px 24px", borderRadius: 12, fontWeight: 800, textDecoration: "none", fontSize: "0.95rem" }}>
              <Mail size={18} /> Email Us
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
