"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Package } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const router = useRouter();

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#F4F4F2", padding: "56px 20px 100px" }}>
      <style>{`
        .track-page-card { max-width: 620px; margin: 0 auto; }
        .track-page-eyebrow { display: inline-flex; align-items: center; gap: 8px; color: #8A8A86; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
        .track-page-live { width: 6px; height: 6px; border-radius: 50%; background: #F4F4F2; box-shadow: 0 0 0 5px rgba(255,255,255,0.12); }
        .track-page-title { margin: 0 0 14px; font-family: Outfit, sans-serif; font-size: clamp(2rem, 8vw, 4rem); font-weight: 900; line-height: 0.95; letter-spacing: -0.05em; text-transform: uppercase; }
        .track-page-copy { max-width: 52ch; margin: 0 0 30px; color: #A8A8A4; font-size: 0.92rem; line-height: 1.8; }
        .track-page-form { display: flex; gap: 8px; padding: 10px; background: #171717; border: 1px solid #242424; }
        .track-page-input { flex: 1; min-width: 0; background: #050505; border: 1px solid #2B2B2B; color: #fff; padding: 15px 16px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; outline: none; }
        .track-page-input::placeholder { color: #5F5F5B; }
        .track-page-input:focus { border-color: #F4F4F2; }
        .track-page-button { width: 52px; flex-shrink: 0; display: grid; place-items: center; background: #F4F4F2; color: #0A0A0A; border: 0; cursor: pointer; }
        .track-page-help { display: flex; align-items: flex-start; gap: 12px; margin-top: 16px; padding: 16px; background: #171717; border: 1px solid #242424; color: #A8A8A4; font-size: 0.8rem; line-height: 1.7; }
        .track-page-help strong { display: block; color: #F4F4F2; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px; }
        @media (max-width: 480px) {
          .track-page-form { flex-direction: column; }
          .track-page-button { width: 100%; min-height: 50px; }
        }
      `}</style>

      <div className="track-page-card">
        <span className="track-page-eyebrow"><span className="track-page-live" /> // Dispatch vault</span>
        <h1 className="track-page-title">Track your order</h1>
        <p className="track-page-copy">
          Enter your order ID to see dispatch, shipping, and delivery updates. Tracking is live from
          the moment your parcel leaves the studio.
        </p>

        <form
          className="track-page-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (orderId.trim()) router.push(`/track/${orderId.trim()}`);
          }}
        >
          <label className="track-page-input" style={{ display: "none" }} htmlFor="track-order-id">Order ID</label>
          <input
            id="track-order-id"
            className="track-page-input"
            type="text"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="ENTER ORDER ID"
            autoComplete="off"
          />
          <button type="submit" className="track-page-button" aria-label="Find order">
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="track-page-help">
          <Package size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>Need help?</strong>
            Your order ID is in the confirmation email and under My Orders in your account.
          </div>
        </div>
      </div>
    </div>
  );
}
