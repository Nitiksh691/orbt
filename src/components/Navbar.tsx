"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, User, Menu, X, Search } from "lucide-react";
import { useApp } from "@/lib/context";
import AuthModal from "./AuthModal";

const MARQUEE_ITEMS = [
  "No restocks once sold out",
  "Free shipping over ₹1999",
  "Drop 004 live now",
  "Easy 7-day exchanges",
  "Members get early access",
];

export default function Navbar() {
  const { user, cartCount, isSidebarOpen, setSidebarOpen } = useApp();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/vendor")
  ) {
    return null;
  }

  return (
    <>
      <style>{`
        .nav-announcement {
          background: #ffffb2;
          color: #0A0A0A;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .nav-marquee-track {
          display: flex;
          width: max-content;
          animation: nav-marquee 32s linear infinite;
        }

        .nav-marquee-track span {
          display: inline-flex;
          align-items: center;
          gap: 26px;
          padding: 9px 26px 9px 0;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .nav-marquee-track span::after {
          content: "✦";
          font-size: 0.52rem;
          color: rgba(0, 0, 0, 0.35);
        }

        @keyframes nav-marquee {
          to { transform: translateX(-50%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nav-marquee-track { animation: none; }
          .nav-marquee-track span:nth-child(2) { display: none; }
        }

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 56px;
          background: #000000;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          height: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 clamp(14px, 3vw, 40px);
        }

        .nav-left,
        .nav-right {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1 1 0%;
          min-width: 0;
        }

        .nav-right { justify-content: flex-end; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-link {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.62);
          text-decoration: none;
          padding: 6px 0;
          border-bottom: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #fff;
          border-color: #fff;
        }

        .nav-logo {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          text-decoration: none;
          line-height: 1;
          transition: opacity 0.2s ease;
        }

        .nav-logo svg { width: 72px; height: auto; display: block; }
        .orbt-logo-sub {
          font-size: 0.52rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.58);
          white-space: nowrap;
        }

        .nav-logo:hover { opacity: 0.7; }

        .nav-icon {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #fff;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .nav-icon:hover { background: rgba(255, 255, 255, 0.08); }

        .nav-menu-toggle { display: none; }

        .nav-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          border-radius: 99px;
          background: #fff;
          color: #0A0A0A;
          font-size: 0.54rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .nav-links { display: none; }
          .nav-menu-toggle { display: flex; }
        }

        @media (max-width: 480px) {
          .nav-root { height: 52px; }
          .nav-inner { gap: 8px; padding: 0 14px; }
          .nav-right { gap: 0; }
          .nav-logo svg { width: 58px; }
          .orbt-logo-sub { display: none; }
          .nav-icon { width: 34px; height: 34px; }
          .nav-marquee-track span {
            font-size: 0.5rem;
            letter-spacing: 0.13em;
            padding-block: 8px;
          }
        }
      `}</style>

      <div className="nav-announcement" aria-label="ORBT store announcements">
        <div className="nav-marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy} aria-hidden={copy === 1}>
              {MARQUEE_ITEMS.join(" · ")}
            </span>
          ))}
        </div>
      </div>

      <header className="nav-root">
        <div className="nav-inner">
          <div className="nav-left">
            <button
              className="nav-icon"
              onClick={() => setSidebarOpen?.(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <Link href="/" className="nav-logo orbt-logo" aria-label="ORBT home">
            <svg viewBox="0 0 100 32" aria-hidden="true">
              <circle cx="17" cy="16" r="10" fill="currentColor" />
              <ellipse cx="17" cy="16" rx="16" ry="5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-22 17 16)" />
              <circle cx="28" cy="8" r="2.3" fill="currentColor" />
              <text x="33" y="24" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="currentColor" letterSpacing="1">RBT</text>
            </svg>
            <span className="orbt-logo-sub">Shop drops</span>
          </Link>

          <div className="nav-right">
            <Link href="/menu" className="nav-icon" aria-label="Shop">
              <Search size={18} />
            </Link>

            {user ? (
              <Link href="/profile" className="nav-icon" aria-label="Account">
                <User size={18} />
              </Link>
            ) : (
              <button
                className="nav-icon"
                onClick={() => setShowAuthModal(true)}
                aria-label="Log in"
              >
                <User size={18} />
              </button>
            )}

            <Link href="/cart" className="nav-icon" aria-label="Shopping bag">
              <ShoppingBag size={19} />
              {cartCount > 0 && (
                <span className="nav-badge">{cartCount > 9 ? "9+" : cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(uid) => {
            localStorage.setItem("otw_user_id", uid);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
