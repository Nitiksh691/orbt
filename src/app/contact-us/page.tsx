import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MessageCircle, ArrowRight, FileText, Shield, Truck, RefreshCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — ORBT",
  description: "Get in touch with ORBT for order support, shipping queries, payment issues, and general questions.",
};

export default function ContactUsPage() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        .cu-wrap {
          max-width: 640px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero */
        .cu-hero {
          background: #000000;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 64px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cu-hero::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 0; right: 0;
          height: 80px;
          background: #080808;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .cu-hero-icon {
          width: 72px; height: 72px;
          border-radius: 22px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          backdrop-filter: blur(8px);
        }
        .cu-hero h1 {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2rem, 6vw, 3rem);
          font-weight: 900;
          color: #fff;
          margin: 0 0 12px;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }
        .cu-hero p {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.65;
          font-weight: 500;
        }

        /* Contact methods */
        .cu-methods {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: -20px;
          position: relative;
          z-index: 2;
        }
        .cu-method {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 22px;
          background: #0F0F0F;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          text-decoration: none;
          color: #F4F4F2;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cu-method:hover {
          border-color: rgba(255,255,255,0.32);
          background: #171717;
          transform: translateY(-2px);
        }
        .cu-method-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cu-method-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #9A9A96;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 3px;
        }
        .cu-method-val {
          font-size: 1.05rem;
          font-weight: 800;
          line-height: 1.2;
          color: #F4F4F2;
        }
        .cu-method-sub {
          font-size: 0.78rem;
          color: #9A9A96;
          margin-top: 3px;
          font-weight: 500;
        }
        .cu-method-arrow {
          margin-left: auto;
          color: #6E6E6A;
          transition: color 0.2s, transform 0.2s;
        }
        .cu-method:hover .cu-method-arrow {
          color: #F4F4F2;
          transform: translateX(3px);
        }

        /* Section heading */
        .cu-section-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #9A9A96;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 36px 0 14px;
        }

        /* Policy grid */
        .cu-policy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .cu-policy-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: #0F0F0F;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          text-decoration: none;
          color: #C9C9C5;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.2s;
        }
        .cu-policy-btn:hover {
          background: #171717;
          border-color: rgba(255,255,255,0.32);
          color: #F4F4F2;
        }
        .cu-policy-btn svg { flex-shrink: 0; }

        /* CTA banner */
        .cu-cta {
          margin-top: 40px;
          background: #000000;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 4px;
          padding: 36px 28px;
          text-align: center;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .cu-cta::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .cu-cta h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .cu-cta p { opacity: 0.75; margin: 0 0 24px; font-size: 0.92rem; }
        .cu-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F4F4F2;
          color: #0A0A0A;
          padding: 13px 28px;
          border-radius: 99px;
          font-weight: 900;
          text-decoration: none;
          font-size: 0.95rem;
          box-shadow: 0 4px 0 rgba(0,0,0,0.2);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .cu-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 0 rgba(0,0,0,0.2); }
      `}</style>

      {/* Hero */}
      <div className="cu-hero">
        <div className="cu-hero-icon">
          <MessageCircle size={32} color="white" />
        </div>
        <h1 style={{ letterSpacing: ".65px" }}>Contact Us</h1>
        <p>We&apos;re here to help — orders, delivery, payments, anything.</p>
      </div>

      <div className="cu-wrap">
        {/* Contact Methods */}
        <div className="cu-methods">
          <a href="tel:+918130939274" className="cu-method">
            <div className="cu-method-icon" style={{ background: "linear-gradient(135deg, #0135FB, #2A55FF)", boxShadow: "0 6px 16px rgba(1,53,251,0.25)" }}>
              <Phone size={22} color="white" />
            </div>
            <div>
              <div className="cu-method-label">Call Us</div>
              <div className="cu-method-val" style={{ color: "#0135FB" }}>+91 81309 39274</div>
              <div className="cu-method-sub">Tap to call directly</div>
            </div>
            <ArrowRight size={18} className="cu-method-arrow" />
          </a>

          <a href="https://wa.me/918130939274" target="_blank" rel="noopener noreferrer" className="cu-method">
            <div className="cu-method-icon" style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 6px 16px rgba(34,197,94,0.25)" }}>
              <MessageCircle size={22} color="white" />
            </div>
            <div>
              <div className="cu-method-label">WhatsApp</div>
              <div className="cu-method-val" style={{ color: "#16A34A" }}>+91 81309 39274</div>
              <div className="cu-method-sub">Fastest response · Usually within minutes</div>
            </div>
            <ArrowRight size={18} className="cu-method-arrow" />
          </a>

          <a href="mailto:nitikshpal@gmail.com" className="cu-method">
            <div className="cu-method-icon" style={{ background: "linear-gradient(135deg, #7C3AED, #9333EA)", boxShadow: "0 6px 16px rgba(124,58,237,0.25)" }}>
              <Mail size={22} color="white" />
            </div>
            <div>
              <div className="cu-method-label">Email Us</div>
              <div className="cu-method-val" style={{ color: "#7C3AED" }}>nitikshpal@gmail.com</div>
              <div className="cu-method-sub">We reply within a few hours</div>
            </div>
            <ArrowRight size={18} className="cu-method-arrow" />
          </a>
        </div>

        {/* Policies */}
        <div className="cu-section-label">Helpful Policies</div>
        <div className="cu-policy-grid">
          {[
            { label: "Terms & Conditions", href: "/terms-and-conditions", icon: <FileText size={16} color="#0135FB" /> },
            { label: "Privacy Policy", href: "/privacy-policy", icon: <Shield size={16} color="#0135FB" /> },
            { label: "Delivery Policy", href: "/delivery-policy", icon: <Truck size={16} color="#0135FB" /> },
            { label: "Cancellation & Refund", href: "/cancellation-and-refund", icon: <RefreshCcw size={16} color="#0135FB" /> },
          ].map(link => (
            <Link key={link.href} href={link.href} className="cu-policy-btn">
              {link.icon} {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="cu-cta">
          <h2 style={{ color: "white" }}>Ready to order?</h2>
          <p style={{ color: "white" }}>Contemporary clothing, shipped across India.</p>
          <Link href="/" className="cu-cta-btn">
            Browse Menu <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
