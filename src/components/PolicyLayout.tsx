"use client";
import Link from "next/link";
import { ArrowLeft, FileText, Clock } from "lucide-react";

interface PolicySection {
  heading: string;
  content: string;
}

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
}

/** Renders bold (**text**) and bullet lists (• text) from plain string content */
function PolicyContent({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: "6px" }} />;

        // Bullet point
        if (trimmed.startsWith("•")) {
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", paddingLeft: "4px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F4F4F2", flexShrink: 0, marginTop: "8px" }} />
              <span style={{ color: "#C9C9C5", lineHeight: 1.7, fontSize: "0.93rem" }}>
                {renderInline(trimmed.slice(1).trim())}
              </span>
            </div>
          );
        }

        return (
          <p key={i} style={{ color: "#C9C9C5", lineHeight: 1.75, fontSize: "0.93rem", margin: 0 }}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#F4F4F2", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const POLICY_NAV = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Delivery Policy", href: "/delivery-policy" },
  { label: "Cancellation & Refund", href: "/cancellation-and-refund" },
  { label: "Contact Us", href: "/contact-us" },
];

export default function PolicyLayout({ title, lastUpdated, sections }: PolicyLayoutProps) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`
        @keyframes policy-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .policy-section {
          animation: policy-fade-up 0.4s ease both;
        }
        .policy-section:nth-child(2) { animation-delay: 0.05s; }
        .policy-section:nth-child(3) { animation-delay: 0.1s; }
        .policy-section:nth-child(4) { animation-delay: 0.15s; }
        .policy-section:nth-child(5) { animation-delay: 0.2s; }
        .policy-nav-link {
          display: block;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 0.83rem;
          font-weight: 600;
          color: #A8A8A4;
          transition: all 0.15s;
          border: 1px solid transparent;
        }
        .policy-nav-link:hover {
          background: #171717;
          color: #F4F4F2;
        }
        .policy-nav-link.active {
          background: #F4F4F2;
          color: #0A0A0A;
          font-weight: 800;
        }
        @media (max-width: 768px) {
          .policy-grid { grid-template-columns: 1fr !important; }
          .policy-sidebar { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#000000",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "48px 24px 40px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "rgba(255,255,255,0.65)", textDecoration: "none",
              fontSize: "0.82rem", fontWeight: 600, marginBottom: "20px",
              transition: "color 0.15s",
            }}
          >
            <ArrowLeft size={15} /> Back to Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "10px" }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}>
              <FileText size={22} color="white" />
            </div>
            <h1 style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
            }}>{title}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "8px" }}>
            <Clock size={13} color="rgba(255,255,255,0.45)" />
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
              Last updated: {lastUpdated}
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 60px" }}>
        <div className="policy-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "32px", alignItems: "start" }}>

          {/* Sidebar nav */}
          <aside className="policy-sidebar" style={{
            background: "#0F0F0F",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "4px",
            padding: "20px 14px",
            position: "sticky",
            top: "80px",
          }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#6E6E6A", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: "12px", paddingLeft: "6px" }}>
              Policies
            </p>
            {POLICY_NAV.map(nav => (
              <Link
                key={nav.href}
                href={nav.href}
                className={`policy-nav-link ${nav.label === title ? "active" : ""}`}
              >
                {nav.label}
              </Link>
            ))}
          </aside>

          {/* Main content */}
          <main style={{ minWidth: 0 }}>
            {/* Mobile quick-nav pills */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: "4px", marginBottom: "24px", scrollbarWidth: "none" }}>
              {POLICY_NAV.map(nav => (
                <Link
                  key={nav.href}
                  href={nav.href}
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "7px 14px", borderRadius: "999px",
                    background: nav.label === title ? "#F4F4F2" : "#0F0F0F",
                    color: nav.label === title ? "#0A0A0A" : "#A8A8A4",
                    border: `1px solid ${nav.label === title ? "#F4F4F2" : "rgba(255,255,255,0.16)"}`,
                    textDecoration: "none", fontSize: "0.78rem", fontWeight: 700,
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {nav.label}
                </Link>
              ))}
            </div>


            {/* Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="policy-section"
                  style={{
                    background: "#0F0F0F",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    padding: "24px 22px",
                    borderLeft: "3px solid #F4F4F2",
                  }}
                >
                  <h2 style={{
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    color: "#F4F4F2",
                    marginBottom: "14px",
                    letterSpacing: "0.1px",
                    lineHeight: 1.3,
                  }}>
                    {section.heading}
                  </h2>
                  <PolicyContent text={section.content} />
                </div>
              ))}
            </div>

            {/* Footer contact strip */}
            <div style={{
              marginTop: "28px",
              background: "linear-gradient(135deg, #0A0F2E 0%, #1a2460 100%)",
              borderRadius: "16px",
              padding: "24px 22px",
              color: "#fff",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: "1rem", marginBottom: "4px" }}>Have questions?</div>
                <div style={{ fontSize: "0.83rem", opacity: 0.7 }}>We&apos;re happy to help.</div>
              </div>
              <Link
                href="/contact-us"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#0135FB", color: "#fff",
                  padding: "11px 22px", borderRadius: "10px",
                  fontWeight: 800, textDecoration: "none",
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.25)",
                  whiteSpace: "nowrap",
                }}
              >
                Contact Us
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
