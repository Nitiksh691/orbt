"use client";
import Link from "next/link";
import { Camera, MessageCircle, Mail, Phone } from "lucide-react";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_TEL, SUPPORT_EMAIL } from "@/lib/company";

const EXPLORE = [
  { label: "Shop All", href: "/menu" },
  { label: "New In", href: "/menu?category=new" },
  { label: "Our Story", href: "/about" },
  { label: "Track Order", href: "/orders" },
];

const SHOP = [
  { label: "Tees", href: "/menu?category=tees" },
  { label: "Hoodies", href: "/menu?category=hoodies" },
  { label: "Bottoms", href: "/menu?category=bottoms" },
  { label: "Accessories", href: "/menu?category=accessories" },
];

const SUPPORT = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "Shipping", href: "/delivery-policy" },
  { label: "Returns", href: "/cancellation-and-refund" },
  { label: "Privacy", href: "/privacy-policy" },
];

export default function Footer() {
  return (
    <footer className="ft-root">
      <style>{`
        .ft-root {
          position: relative;
          background: #050505;
          color: #F4F4F2;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 88px;
          overflow: hidden;
        }
        .ft-main {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: clamp(28px, 5vw, 64px);
          padding: clamp(44px, 7vw, 80px) 0 clamp(32px, 4vw, 48px);
        }
        .ft-brand-name {
          line-height: 1;
          margin-bottom: 14px;
          color: #F4F4F2;
        }

        .ft-brand-name svg { width: 104px; height: auto; display: block; }
        .ft-brand-tag {
          font-size: 0.56rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8A8A86;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .ft-brand-copy {
          font-size: 0.86rem;
          line-height: 1.75;
          color: #9A9A96;
          max-width: 34ch;
          margin: 0 0 22px;
        }
        .ft-socials { display: flex; gap: 8px; }
        .ft-social {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F4F4F2;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .ft-social:hover { background: #F4F4F2; color: #050505; }

        .ft-col-title {
          font-size: 0.56rem;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #6E6E6A;
          margin-bottom: 18px;
        }
        .ft-link {
          display: block;
          width: fit-content;
          color: #C9C9C5;
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 500;
          padding: 6px 0;
          transition: color 0.18s ease, transform 0.18s ease;
        }
        .ft-link:hover { color: #fff; transform: translateX(2px); }

        .ft-contact {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 0.84rem;
          color: #C9C9C5;
          padding: 6px 0;
        }
        .ft-contact svg { opacity: 0.55; flex-shrink: 0; }
        .ft-contact a { color: #C9C9C5; text-decoration: none; transition: color 0.18s ease; }
        .ft-contact a:hover { color: #fff; }

        .ft-wordmark {
          font-family: "Outfit", sans-serif;
          font-weight: 900;
          font-size: clamp(4.5rem, 20vw, 17rem);
          line-height: 0.72;
          letter-spacing: -0.045em;
          text-transform: uppercase;
          text-align: center;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.22);
          user-select: none;
          pointer-events: none;
          margin-top: clamp(10px, 3vw, 30px);
          margin-bottom: -0.06em;
          white-space: nowrap;
        }

        .ft-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 22px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ft-bottom-text {
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: #6E6E6A;
        }
        .ft-bottom-links { display: flex; gap: 18px; flex-wrap: wrap; }
        .ft-bottom-links a {
          font-size: 0.68rem;
          color: #6E6E6A;
          text-decoration: none;
          transition: color 0.18s ease;
        }
        .ft-bottom-links a:hover { color: #fff; }

        @media (max-width: 900px) {
          .ft-main { grid-template-columns: 1.1fr 1fr 1fr; gap: 28px 18px; }
          .ft-brand-col { grid-column: 1 / -1; }
          .ft-support-col { grid-column: 3; grid-row: 2; }
        }
        @media (max-width: 560px) {
          .ft-root { padding-bottom: 84px; }
          .ft-main { padding-top: 40px; gap: 24px 14px; grid-template-columns: 1.1fr 1fr 1fr; }
          .ft-brand-copy { max-width: 100%; }
          .ft-support-col { grid-column: 3; grid-row: 2; }
          .ft-link { font-size: 0.78rem; padding: 5px 0; }
          .ft-col-title { margin-bottom: 12px; }
          .ft-wordmark { -webkit-text-stroke-width: 0.8px; }
          .ft-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="kl-container">
        <div className="ft-main">
          <div className="ft-brand-col">
            <div className="ft-brand-name orbt-footer-logo">
              <svg viewBox="0 0 100 32" aria-label="ORBT">
                <circle cx="17" cy="16" r="10" fill="currentColor" />
                <ellipse cx="17" cy="16" rx="16" ry="5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-22 17 16)" />
                <circle cx="28" cy="8" r="2.3" fill="currentColor" />
                <text x="33" y="24" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="currentColor" letterSpacing="1">RBT</text>
              </svg>
            </div>
            <div className="ft-brand-tag">Street &amp; modern wear</div>
            <p className="ft-brand-copy">
              Contemporary streetwear and fashion. Considered garments, made in
              limited runs, shipped across India.
            </p>
            <div className="ft-socials">
              <a href="#" className="ft-social" aria-label="Instagram">
                <Camera size={16} />
              </a>
              <a
                href={`https://wa.me/${SUPPORT_PHONE_DISPLAY?.replace(/\D/g, "")}`}
                className="ft-social"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="ft-social" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <div className="ft-col-title">Explore</div>
            {EXPLORE.map((l) => (
              <Link key={l.label} href={l.href} className="ft-link">
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <div className="ft-col-title">Shop</div>
            {SHOP.map((l) => (
              <Link key={l.label} href={l.href} className="ft-link">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ft-support-col">
            <div className="ft-col-title">Support</div>
            {SUPPORT.map((l) => (
              <Link key={l.label} href={l.href} className="ft-link">
                {l.label}
              </Link>
            ))}
            <div className="ft-contact" style={{ marginTop: 8 }}>
              <Phone size={14} />
              <a href={SUPPORT_TEL}>{SUPPORT_PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>

        <div className="ft-wordmark" aria-hidden="true">
          ORBT
        </div>

        <div className="ft-bottom">
          <span className="ft-bottom-text">
            © {new Date().getFullYear()} ORBT. All rights reserved.
          </span>
          <div className="ft-bottom-links">
            <Link href="/terms-and-conditions">Terms</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/delivery-policy">Shipping</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
