"use client";
import { Mail, Phone, MessageSquare, MapPin, ChevronRight, HelpCircle } from "lucide-react";

export default function SupportPage() {
  const CONTACTS = [
    { icon: <Phone size={24} />, title: "Call Us", desc: "+91 81309 39274", action: "Call now", link: "tel:+918130939274", color: "#F4F4F2", bg: "rgba(255,255,255,0.08)" },
    { icon: <Mail size={24} />, title: "Email Us", desc: "nitikshpal@gmail.com", action: "Send email", link: "mailto:nitikshpal@gmail.com", color: "#F4F4F2", bg: "rgba(255,255,255,0.08)" },
    { icon: <MessageSquare size={24} />, title: "WhatsApp", desc: "Fastest response", action: "Start chat", link: "https://wa.me/918130939274", color: "#F4F4F2", bg: "rgba(255,255,255,0.08)" },
    { icon: <MapPin size={24} />, title: "Track Order", desc: "See dispatch updates", action: "View map", link: "/track", color: "#F4F4F2", bg: "rgba(255,255,255,0.08)" },
  ];

  const FAQS = [
    { q: "How long does shipping take?", a: "Standard shipping is 3–5 business days. Express is 1–2 days where available." },
    { q: "Can I cancel my order?", a: "You can cancel before the order is packed. After that, use returns." },
    { q: "Do you offer refunds?", a: "Yes — damaged, wrong, or approved return items are refunded to the original payment method in 5–7 days." }
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "24px 20px 80px" }}>
      <div className="otw-container" style={{ maxWidth: 600 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "20px" }}>
          <div style={{ display: "inline-flex", padding: "16px", background: "#171717", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50%", color: "#F4F4F2", marginBottom: "20px" }}>
            <HelpCircle size={48} />
          </div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, marginBottom: "12px", color: "#F4F4F2", letterSpacing: "-0.5px", textTransform: "uppercase" }}>How can we help?</h1>
          <p style={{ color: "#A8A8A4", fontSize: "1rem" }}>
            We're here to assist you with any questions or issues.
          </p>
        </div>
        
        {/* Contact Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          {CONTACTS.map((c, i) => (
            <a key={i} href={c.link} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "16px", background: "#0F0F0F", padding: "20px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", transition: "transform 0.2s" }} className="hover-lift">
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: c.bg, color: c.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: "#F4F4F2", fontSize: "1.05rem", marginBottom: "2px" }}>{c.title}</div>
                <div style={{ color: "#A8A8A4", fontSize: "0.85rem", fontWeight: 600 }}>{c.desc}</div>
              </div>
              <ChevronRight size={20} color="#6E6E6A" />
            </a>
          ))}
        </div>

        {/* FAQs */}
        <h2 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "20px", color: "#F4F4F2", textTransform: "uppercase" }}>Frequently Asked Questions</h2>
        <div style={{ background: "#0F0F0F", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ padding: "24px", borderBottom: i !== FAQS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#F4F4F2", marginBottom: "8px" }}>{faq.q}</h3>
              <p style={{ color: "#A8A8A4", fontSize: "0.95rem", lineHeight: 1.5, fontWeight: 500 }}>{faq.a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
