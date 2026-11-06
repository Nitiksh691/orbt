"use client";
import { Phone, Mail, Heart, Shirt, Truck, Users, Sparkles, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_TEL, SUPPORT_EMAIL } from "@/lib/company";
import Link from "next/link";

const VALUES = [
  { icon: <Shirt size={22} />, title: "Precision Silhouette", desc: "Every tee, hoodie, and denim cut is engineered for structure, drape, and daily wear." },
  { icon: <Truck size={22} />, title: "Doorstep Express Shipping", desc: "Pan-India tracked courier delivery right to your exact flat, house, or office address." },
  { icon: <Heart size={22} />, title: "Independent Design Label", desc: "We build limited drops with premium heavyweight cotton rather than mass chasing fleeting trends." },
  { icon: <Users size={22} />, title: "Streetwear Community", desc: "Our cuts, wash finishes, and graphics are shaped directly with our community of creators." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0A0A0A", color: "#FFFFFF", minHeight: "100vh" }}>
      <style>{`
        .about-hero {
          background: #000000;
          padding: 100px 24px 60px;
          text-align: center;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: relative;
        }
        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #F4F4F2;
          color: #0A0A0A;
          padding: 4px 14px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .about-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4.5rem);
          font-weight: 900;
          line-height: 0.95;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 20px;
        }
        .about-sub {
          font-size: 1.05rem;
          color: #A3A3A3;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 32px;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin: 64px 0;
        }
        .value-card {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 32px 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .value-card:hover {
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        .value-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: #222222;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .contact-box {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          text-align: center;
          padding: 60px 24px;
          margin-bottom: 80px;
        }
      `}</style>

      {/* Hero */}
      <section className="about-hero">
        <div style={{ maxWidth: 840, margin: "0 auto" }}>
          <div className="about-badge">
            <Sparkles size={12} /> Independent Indian Fashion Label
          </div>
          <h1 className="about-title">
            Designed to be worn.<br />
            Built to endure.
          </h1>
          <p className="about-sub">
            ORBT creates contemporary streetwear and modern essentials. High-grade textiles, oversized tailored fits, and secure pan-India doorstep delivery.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link
              href="/menu"
              style={{
                background: "#ffffff",
                color: "#000000",
                padding: "14px 28px",
                borderRadius: 6,
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Shop All Pieces <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <div className="values-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="value-card">
              <div className="value-icon-box">{v.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem", textTransform: "uppercase", color: "#ffffff", marginBottom: 10, letterSpacing: "0.02em" }}>
                {v.title}
              </h3>
              <p style={{ color: "#A3A3A3", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Contact section */}
        <div className="contact-box">
          <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#F4F4F2", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
            Direct Support
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 900, textTransform: "uppercase", color: "#ffffff", margin: "0 0 12px" }}>
            Connect With Our Team
          </h2>
          <p style={{ color: "#A3A3A3", marginBottom: 28, fontSize: "0.92rem", maxWidth: 440, margin: "0 auto 28px" }}>
            Have questions about fit, fabric specifications, tracking, or bulk orders? We're available 7 days a week.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={SUPPORT_TEL}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                color: "#000000",
                padding: "12px 24px",
                borderRadius: 6,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Phone size={16} /> {SUPPORT_PHONE_DISPLAY}
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#222222",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "12px 24px",
                borderRadius: 6,
                fontWeight: 800,
                textDecoration: "none",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Mail size={16} /> Email Inquiries
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
