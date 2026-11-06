"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import {
  Package,
  Heart,
  ShoppingCart,
  MapPin,
  Tag,
  HelpCircle,
  ShieldCheck,
  Box,
  ClipboardList,
  User,
  Home,
  Shirt,
  ChevronRight,
  X,
} from "lucide-react";
import { useApp } from "@/lib/context";
import AuthModal from "./AuthModal";

const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

export default function GlobalSidebar() {
  const { user, profile, isSidebarOpen, setSidebarOpen } = useApp();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const mounted = useMounted();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (touchStart - touchEnd > minSwipeDistance && isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor")
  )
    return null;

  return (
    <>
      <style>{`
        .gsb-root {
          position: fixed;
          top: 0;
          left: 0;
          width: 290px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0A0A0A;
          color: #F4F4F2;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          padding: 20px 14px calc(20px + env(safe-area-inset-bottom));
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 1002;
          gap: 4px;
          transform: translateX(-100%);
          visibility: hidden;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s;
          scrollbar-width: none;
        }
        .gsb-root::-webkit-scrollbar { display: none; }
        .gsb-root.mobile-open {
          transform: translateX(0);
          visibility: visible;
        }

        .gsb-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1001;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .gsb-overlay.mobile-open {
          opacity: 1;
          pointer-events: auto;
        }

        @media (min-width: 1024px) {
          .gsb-root.desktop-closed { display: none !important; }
          .app-sidebar-slot.desktop-closed { width: 0 !important; }
        }

        .gsb-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 4px 8px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          margin-bottom: 12px;
          flex-shrink: 0;
        }
        .gsb-brand-text {
          font-family: "Outfit", sans-serif;
          font-weight: 900;
          font-size: 1.15rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          line-height: 1;
          color: #F4F4F2;
        }
        .gsb-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 0;
          color: #F4F4F2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .gsb-section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.56rem;
          font-weight: 800;
          color: #6E6E6A;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 18px 10px 8px;
        }
        .gsb-section-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #6E6E6A;
          flex-shrink: 0;
        }

        .gsb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 10px;
          border-radius: 9px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.86rem;
          color: #B8B8B4;
          transition: background 0.18s ease, color 0.18s ease;
          position: relative;
        }
        .gsb-item:hover {
          color: #F4F4F2;
          background: rgba(255, 255, 255, 0.06);
        }
        .gsb-item.active {
          color: #F4F4F2;
          background: rgba(255, 255, 255, 0.1);
          font-weight: 700;
        }

        .gsb-item-icon {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: inherit;
        }
        .gsb-item-label { flex: 1; min-width: 0; }
        .gsb-item-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.15s ease, transform 0.15s ease;
          color: #F4F4F2;
        }
        .gsb-item:hover .gsb-item-arrow,
        .gsb-item.active .gsb-item-arrow {
          opacity: 0.7;
          transform: translateX(0);
        }

        .gsb-admin-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          color: #F4F4F2;
          font-size: 0.5rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-left: auto;
          flex-shrink: 0;
        }

        .gsb-spacer { flex: 1; min-height: 20px; }

        .gsb-user-card {
          border-radius: 12px;
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          flex-shrink: 0;
        }
        .gsb-user-card-inner {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .gsb-user-card-inner:hover { background: rgba(255, 255, 255, 0.05); }
        .gsb-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #F4F4F2;
          color: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .gsb-user-info { flex: 1; min-width: 0; }
        .gsb-user-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #F4F4F2;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gsb-user-sub {
          font-size: 0.68rem;
          color: #8A8A86;
          font-weight: 500;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gsb-user-more { color: #8A8A86; display: flex; flex-shrink: 0; }

        .gsb-login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 14px;
          background: #F4F4F2;
          color: #0A0A0A;
          border: none;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.64rem;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          flex-shrink: 0;
          transition: background 0.2s ease;
        }
        .gsb-login-btn:hover { background: #fff; }
      `}</style>

      <div
        className={`gsb-overlay ${isSidebarOpen ? "mobile-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`app-sidebar-slot ${isSidebarOpen ? "" : "desktop-closed"}`}>
        <aside
          className={`gsb-root ${isSidebarOpen ? "mobile-open" : "desktop-closed"}`}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-label="Menu"
        >
          <div className="gsb-brand">
            <div className="gsb-brand-text">
              <svg viewBox="0 0 100 32" aria-label="ORBT" style={{ width: 72, height: "auto", display: "block", color: "#F4F4F2" }}>
                <circle cx="17" cy="16" r="10" fill="currentColor" />
                <ellipse cx="17" cy="16" rx="16" ry="5" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(-22 17 16)" />
                <circle cx="28" cy="8" r="2.3" fill="currentColor" />
                <text x="33" y="24" fontFamily="Outfit, sans-serif" fontSize="22" fontWeight="900" fill="currentColor" letterSpacing="1">RBT</text>
              </svg>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="gsb-close"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="gsb-section-label">
            <div className="gsb-section-dot" />
            Shop
          </div>
          <SidebarItem
            href="/menu"
            icon={<Home size={17} />}
            label="All Products"
            active={pathname.startsWith("/menu")}
          />
          <SidebarItem
            href="/menu?category=new"
            icon={<Shirt size={17} />}
            label="New Arrivals"
            active={pathname.startsWith("/menu?category=new")}
          />
          <SidebarItem
            href="/menu?category=tees"
            icon={<Shirt size={17} />}
            label="Tops & Tees"
            active={pathname.startsWith("/menu?category=tees")}
          />
          <SidebarItem
            href="/menu?category=hoodies"
            icon={<Tag size={17} />}
            label="Hoodies & Sweats"
            active={pathname.startsWith("/menu?category=hoodies")}
          />
          <SidebarItem
            href="/menu?category=bottoms"
            icon={<Box size={17} />}
            label="Bottoms & Denim"
            active={pathname.startsWith("/menu?category=bottoms")}
          />
          <SidebarItem
            href="/#edit"
            icon={<ShieldCheck size={17} />}
            label="Lookbook"
            active={pathname === "/"}
          />

          {mounted && !user && (
            <button type="button" onClick={() => setShowAuthModal(true)} className="gsb-login-btn">
              <User size={16} /> Log in
            </button>
          )}

          <div className="gsb-section-label">
            <div className="gsb-section-dot" />
            Account
          </div>
          <SidebarItem
            href="/orders"
            icon={<Package size={17} />}
            label="My Orders"
            active={pathname.startsWith("/orders")}
          />
          <SidebarItem
            href="/orders"
            icon={<MapPin size={17} />}
            label="Track Order"
            active={pathname.startsWith("/orders")}
          />
          <SidebarItem
            href="/wishlist"
            icon={<Heart size={17} />}
            label="Wishlist"
            active={pathname.startsWith("/wishlist")}
          />
          <SidebarItem
            href="/cart"
            icon={<ShoppingCart size={17} />}
            label="Bag"
            active={pathname.startsWith("/cart")}
          />

          <div className="gsb-section-label">
            <div className="gsb-section-dot" />
            Company
          </div>
          <SidebarItem
            href="/about"
            icon={<HelpCircle size={17} />}
            label="Our Story"
            active={pathname.startsWith("/about")}
          />
          <SidebarItem
            href="/support"
            icon={<HelpCircle size={17} />}
            label="Help & Support"
            active={pathname.startsWith("/support")}
          />

          {profile?.role === "admin" && (
            <>
              <div className="gsb-section-label">
                <div className="gsb-section-dot" />
                Admin
                <span className="gsb-admin-badge">Panel</span>
              </div>
              <SidebarItem
                href="/admin"
                icon={<ShieldCheck size={17} />}
                label="Dashboard"
                active={pathname === "/admin"}
              />
              <SidebarItem
                href="/admin/menu"
                icon={<Box size={17} />}
                label="Products"
                active={pathname.startsWith("/admin/menu")}
              />
              <SidebarItem
                href="/admin/orders"
                icon={<ClipboardList size={17} />}
                label="Orders"
                active={pathname.startsWith("/admin/orders")}
              />
            </>
          )}

          <div className="gsb-spacer" />

          {mounted && user ? (
            <div className="gsb-user-card">
              <Link href="/profile" className="gsb-user-card-inner">
                <div className="gsb-user-avatar">
                  {profile?.image ? (
                    <img
                      src={profile.image}
                      alt="Profile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    profile?.name?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div className="gsb-user-info">
                  <div className="gsb-user-name">{profile?.name || "User"}</div>
                  <div className="gsb-user-sub">
                    {profile?.phone || profile?.college || "ORBT member"}
                  </div>
                </div>
                <div className="gsb-user-more">
                  <ChevronRight size={15} />
                </div>
              </Link>
            </div>
          ) : null}
        </aside>
      </div>

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

function SidebarItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href} className={`gsb-item${active ? " active" : ""}`}>
      <div className="gsb-item-icon">{icon}</div>
      <span className="gsb-item-label">{label}</span>
      <ChevronRight size={13} className="gsb-item-arrow" />
    </Link>
  );
}
