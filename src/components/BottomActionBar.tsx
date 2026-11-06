"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, Plus, Minus, X, Trash2, Navigation } from "lucide-react";
import { useApp } from "@/lib/context";
import { useState, useEffect, useRef } from "react";
import { fetchActiveOrder } from "@/lib/activeOrder";
import type { Order } from "@/lib/types";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

export default function BottomActionBar() {
  const { cartCount, cartTotal, cart, updateQuantity, removeFromCart, profile } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const isDelivery =
        profile?.role === "delivery" ||
        (typeof window !== "undefined" && !!localStorage.getItem("otw_delivery_id"));
      if (isDelivery) {
        setHasActiveOrder(false);
        setActiveOrder(null);
        return;
      }
      const active = await fetchActiveOrder();
      if (!cancelled) {
        if (active && active.status !== "delivered" && active.status !== "cancelled") {
          setHasActiveOrder(true);
          setActiveOrder(active);
        } else {
          setHasActiveOrder(false);
          setActiveOrder(null);
        }
      }
    };

    check();
    window.addEventListener("otw:active-order", check);
    window.addEventListener("storage", check);
    return () => {
      cancelled = true;
      window.removeEventListener("otw:active-order", check);
      window.removeEventListener("storage", check);
    };
  }, [profile?.role]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handle = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [drawerOpen]);

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/track/")
  )
    return null;

  if (
    profile?.role === "delivery" ||
    (typeof window !== "undefined" && !!localStorage.getItem("otw_delivery_id"))
  )
    return null;

  const isCartPage = pathname === "/cart";
  const hasCartItems = cartCount > 0 && !isCartPage;
  const showTrackBar = hasActiveOrder && !!activeOrder && !hasCartItems;

  const statusText =
    activeOrder?.status === "out_for_delivery"
      ? "On the way"
      : activeOrder?.status === "preparing"
      ? "Preparing"
      : "Confirmed";

  return (
    <>
      <style>{`
        .bcart-track {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 58px;
          z-index: 925;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 16px;
          background: #141414;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          color: #F4F4F2;
          font-family: inherit;
        }
        .bcart-track-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .bcart-track-info span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bcart-track-link {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F4F4F2;
          color: #0A0A0A;
          border-radius: 99px;
          padding: 6px 12px;
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
        }

        .bcart-root {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 980;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
          background: #0A0A0A;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.4);
          font-family: inherit;
        }
        .bcart-summary {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          background: transparent;
          border: 0;
          color: #F4F4F2;
          cursor: pointer;
          padding: 2px;
          text-align: left;
        }
        .bcart-summary-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .bcart-summary-count {
          font-size: 0.56rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8A8A86;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 3px;
        }
        .bcart-summary-total {
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .bcart-checkout {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F4F4F2;
          color: #0A0A0A;
          border: 0;
          border-radius: 99px;
          padding: 13px 20px;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .bcart-checkout:hover { background: #fff; }

        .bcart-backdrop {
          position: fixed;
          inset: 0;
          z-index: 990;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(3px);
          animation: bcart-fade 0.2s ease both;
        }
        @keyframes bcart-fade { from { opacity: 0; } to { opacity: 1; } }

        .bcart-drawer {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 74px;
          z-index: 991;
          max-height: 72vh;
          max-width: 560px;
          margin: 0 auto;
          background: #101010;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: none;
          border-radius: 20px 20px 0 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.55);
          font-family: inherit;
          animation: bcart-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes bcart-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

        .bcart-drawer-head {
          padding: 16px 18px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .bcart-drawer-title {
          color: #F4F4F2;
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .bcart-drawer-title span { color: #8A8A86; margin-left: 8px; font-weight: 600; }
        .bcart-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 0;
          color: #F4F4F2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .bcart-list {
          overflow-y: auto;
          flex: 1;
          padding: 8px 18px;
          display: flex;
          flex-direction: column;
        }
        .bcart-line {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .bcart-thumb {
          width: 52px;
          height: 64px;
          border-radius: 3px;
          overflow: hidden;
          position: relative;
          background: #1C1C1C;
          flex-shrink: 0;
        }
        .bcart-details { flex: 1; min-width: 0; }
        .bcart-name {
          color: #F4F4F2;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bcart-variant {
          font-size: 0.66rem;
          color: #8A8A86;
          margin-top: 2px;
        }
        .bcart-price {
          font-size: 0.78rem;
          font-weight: 700;
          color: #F4F4F2;
          margin-top: 4px;
        }
        .bcart-qty {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 99px;
          padding: 4px 8px;
          flex-shrink: 0;
        }
        .bcart-qty button {
          background: none;
          border: none;
          cursor: pointer;
          color: #C9C9C5;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .bcart-qty span {
          color: #F4F4F2;
          font-weight: 700;
          font-size: 0.78rem;
          min-width: 14px;
          text-align: center;
        }

        .bcart-foot {
          padding: 14px 18px calc(16px + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: #0A0A0A;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-shrink: 0;
        }
        .bcart-foot-label {
          font-size: 0.54rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8A8A86;
          font-weight: 700;
        }
        .bcart-foot-total {
          font-size: 1.1rem;
          font-weight: 800;
          color: #F4F4F2;
          margin-top: 2px;
        }

        @media (min-width: 768px) {
          .bcart-track { bottom: 0; }
          .bcart-root {
            max-width: 560px;
            margin: 0 auto;
            bottom: 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 99px;
            padding: 10px 12px 10px 14px;
          }
          .bcart-drawer { bottom: 90px; border-radius: 20px; border-bottom: 1px solid rgba(255,255,255,0.12); }
        }
      `}</style>

      {showTrackBar && activeOrder && (
        <div className="bcart-track">
          <div className="bcart-track-info">
            <Navigation size={13} />
            <span>
              Order #{activeOrder.id.slice(-6).toUpperCase()} · {statusText}
            </span>
          </div>
          <Link href={`/track/${activeOrder.id}`} className="bcart-track-link">
            Track <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {drawerOpen && <div className="bcart-backdrop" onClick={() => setDrawerOpen(false)} />}

      {drawerOpen && (
        <div ref={drawerRef} className="bcart-drawer">
          <div className="bcart-drawer-head">
            <div className="bcart-drawer-title">
              Your bag <span>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
            </div>
            <button className="bcart-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
              <X size={15} />
            </button>
          </div>

          <div className="bcart-list">
            {cart.map((cartItem) => {
              const customPrice = (cartItem.selectedCustomizations || []).reduce(
                (sum, c) => sum + (c.price || 0),
                0
              );
              const effectivePrice = (cartItem.item.price || 0) + customPrice;
              const lineTotal = effectivePrice * cartItem.quantity;

              return (
                <div key={cartItem.cartItemId} className="bcart-line">
                  <div className="bcart-thumb">
                    {cartItem.item.image ? (
                      <Image
                        src={getOptimizedImageUrl(cartItem.item.image, 120)}
                        alt={cartItem.item.name}
                        fill
                        sizes="52px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#6E6E6A",
                        }}
                      >
                        ✦
                      </div>
                    )}
                  </div>

                  <div className="bcart-details">
                    <div className="bcart-name">{cartItem.item.name}</div>
                    {cartItem.selectedCustomizations && cartItem.selectedCustomizations.length > 0 && (
                      <div className="bcart-variant">
                        {cartItem.selectedCustomizations.map((c) => c.option).join(", ")}
                      </div>
                    )}
                    <div className="bcart-price">₹{lineTotal}</div>
                  </div>

                  <div className="bcart-qty">
                    <button
                      onClick={() => {
                        if (cartItem.quantity === 1) removeFromCart(cartItem.cartItemId);
                        else updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
                      }}
                      aria-label="Decrease quantity"
                    >
                      {cartItem.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bcart-foot">
            <div>
              <div className="bcart-foot-label">Total</div>
              <div className="bcart-foot-total">₹{cartTotal}</div>
            </div>
            <button
              className="bcart-checkout"
              onClick={() => {
                setDrawerOpen(false);
                router.push("/cart");
              }}
            >
              Go to bag <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {hasCartItems && (
        <div className="bcart-root">
          <button className="bcart-summary" onClick={() => setDrawerOpen((p) => !p)}>
            <span className="bcart-summary-icon">
              <ShoppingBag size={17} />
            </span>
            <span>
              <span className="bcart-summary-count">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
              <span className="bcart-summary-total" style={{ display: "block" }}>
                ₹{cartTotal}
              </span>
            </span>
          </button>

          <Link href="/cart" className="bcart-checkout">
            Checkout <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </>
  );
}
