"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shirt, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useApp } from "@/lib/context";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount, profile } = useApp();
  const mounted = useMounted();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/vendor")
  )
    return null;
  if (cartCount > 0) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .bnav-root { display: none !important; }
        }

        .bnav-root {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 900;
          background: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: stretch;
          justify-content: space-around;
          height: 62px;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .bnav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          text-decoration: none;
          color: #6E6E6A;
          flex: 1;
          padding: 6px 4px 4px;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.18s ease;
          position: relative;
        }

        .bnav-tab.active { color: #F4F4F2; }

        .bnav-tab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          position: relative;
        }

        .bnav-dot {
          display: none;
          position: absolute;
          bottom: -3px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #F4F4F2;
        }
        .bnav-tab.active .bnav-dot { display: block; }

        .bnav-tab-label {
          font-size: 0.54rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1;
        }

        .bnav-cart-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
          text-decoration: none;
        }

        .bnav-cart {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #F4F4F2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #080808;
          position: relative;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .bnav-cart:active { transform: scale(0.92); }

        .bnav-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 17px;
          height: 17px;
          background: #080808;
          color: #fff;
          font-size: 0.54rem;
          font-weight: 900;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #F4F4F2;
          padding: 0 2px;
        }

        .bnav-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .bnav-avatar-init {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #F4F4F2;
          color: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.64rem;
        }

        .bnav-tab.active .bnav-avatar,
        .bnav-tab.active .bnav-avatar-init {
          box-shadow: 0 0 0 1.5px #F4F4F2;
        }
      `}</style>

      <nav className="bnav-root" role="navigation" aria-label="Main navigation">
        <Link href="/" className={`bnav-tab ${isActive("/") ? "active" : ""}`}>
          <div className="bnav-tab-icon">
            <Sparkles size={20} strokeWidth={isActive("/") ? 2.4 : 1.8} />
            <span className="bnav-dot" />
          </div>
          <span className="bnav-tab-label">Drops</span>
        </Link>

        <Link href="/menu" className={`bnav-tab ${isActive("/menu") ? "active" : ""}`}>
          <div className="bnav-tab-icon">
            <Shirt size={20} strokeWidth={isActive("/menu") ? 2.4 : 1.8} />
            <span className="bnav-dot" />
          </div>
          <span className="bnav-tab-label">Index</span>
        </Link>

        <Link href="/cart" className="bnav-cart-wrap" aria-label="Cart">
          <div className="bnav-cart">
            <ShoppingBag size={19} strokeWidth={2.4} />
            {cartCount > 0 && (
              <div className="bnav-badge">{cartCount > 9 ? "9+" : cartCount}</div>
            )}
          </div>
        </Link>

        <Link href="/orders" className={`bnav-tab ${isActive("/orders") ? "active" : ""}`}>
          <div className="bnav-tab-icon">
            <ClipboardList size={20} strokeWidth={isActive("/orders") ? 2.4 : 1.8} />
            <span className="bnav-dot" />
          </div>
          <span className="bnav-tab-label">Vault</span>
        </Link>

        <Link href="/profile" className={`bnav-tab ${isActive("/profile") ? "active" : ""}`}>
          <div className="bnav-tab-icon">
            {mounted && profile?.image ? (
              <img src={profile.image} alt="Profile" className="bnav-avatar" />
            ) : mounted && profile?.name ? (
              <div className="bnav-avatar-init">{profile.name[0].toUpperCase()}</div>
            ) : (
              <User size={20} strokeWidth={isActive("/profile") ? 2.4 : 1.8} />
            )}
            <span className="bnav-dot" />
          </div>
          <span className="bnav-tab-label">ID</span>
        </Link>
      </nav>
    </>
  );
}
