"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApp } from "@/lib/context";
import { setActiveOrderId, getActiveOrderId } from "@/lib/activeOrder";
import { STORAGE_KEYS, PIN_REGEX } from "@/lib/constants";
import { INDIAN_STATES } from "@/lib/types";
import { formatShippingAddress } from "@/components/LocationModal";
import { normalizeCartLines } from "@/lib/orderLine";
import { Minus, Plus, Trash2, MapPin, Tag, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import RazorpayButton from "@/components/RazorpayButton";


function CartItemThumbnail({ item, quantity }: { item: any; quantity: number }) {
  const [imgErr, setImgErr] = useState(false);
  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  const isCoffee = cat.includes("coffee") || name.includes("coffee") || name.includes("latte") || name.includes("cappuccino") || name.includes("mocha");
  const isDrink = cat.includes("drink") || cat.includes("mojito") || name.includes("mojito") || name.includes("tea");
  const isSnack = cat.includes("munchies") || cat.includes("snack") || name.includes("lays") || name.includes("chips") || name.includes("biscuit");
  const isFood = cat.includes("meal") || cat.includes("burger") || cat.includes("sandwich") || name.includes("burger");

  const fallbackEmoji = isCoffee ? "✦" : isDrink ? "✦" : isSnack ? "👜" : isFood ? "🧥" : "✦";
  const fallbackBg = isCoffee
    ? "linear-gradient(135deg, #F5F5F5 0%, #E5E5E5 100%)"
    : isDrink
    ? "linear-gradient(135deg, #ECFEFF 0%, #CFFAFE 100%)"
    : isSnack
    ? "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
    : "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)";

  return (
    <div style={{
      width: 74, height: 74, borderRadius: 14,
      background: fallbackBg,
      position: "relative", overflow: "hidden", flexShrink: 0,
      border: "1.5px solid rgba(0, 0, 0, 0.08)",
      boxShadow: "0 2px 8px rgba(15,23,42,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      {item.image && !imgErr ? (
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="74px"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{fallbackEmoji}</span>
          <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" }}>
            {item.category?.slice(0, 7) || "Style"}
          </span>
        </div>
      )}

      {/* Quantity badge if > 1 */}
      {quantity > 1 && (
        <div style={{
          position: "absolute", bottom: 4, right: 4,
          background: "#000000", color: "#fff",
          fontSize: "0.62rem", fontWeight: 900,
          padding: "1px 5px", borderRadius: 6,
          zIndex: 2, boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
        }}>
          {quantity}x
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const { user, profile, cart, updateQuantity, removeFromCart, clearCart, cartTotal, syncProfile } = useApp();
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Meme Coupon State
  const [memePopup, setMemePopup] = useState<{ image: string; sound: string; visible: boolean } | null>(null);
  const [name, setName] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(20);
  const [minOrderValue, setMinOrderValue] = useState(69);
  const [freeDeliveryConfig, setFreeDeliveryConfig] = useState<{ enabled: boolean; minAmount: number } | null>(null);
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(false);
  const [paymentFailures, setPaymentFailures] = useState(0);
  const [showCodModal, setShowCodModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("Standard");
  const [customTime, setCustomTime] = useState("");
  const [locationNotes, setLocationNotes] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState<"home" | "work" | "other">("home");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const TIME_SLOTS = [
    { label: "Standard", sub: "3–5 days", icon: "📦" },
    { label: "Express", sub: "1–2 days", icon: "⚡" },
    { label: "Custom Time", sub: "Pick a slot", icon: "🗓️" },
  ];

  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, [cart]);

  // Restore post-checkout screen after refresh (only when cart is empty)
  useEffect(() => {
    const activeId = getActiveOrderId();
    if (!activeId) return;
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
      if (savedCart && JSON.parse(savedCart).length > 0) return;
    } catch { /* ignore */ }
    setPlacedOrderId(activeId);
  }, []);

  // Pre-fill shipping address from storage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.deliveryLocationData);
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.line1) setAddrLine1(data.line1);
        if (data.line2) setAddrLine2(data.line2);
        if (data.landmark) setLocationNotes(data.landmark);
        if (data.city) setCity(data.city);
        if (data.state) setStateName(data.state);
        if (data.pincode) setPincode(data.pincode);
        if (data.addressType) setAddressType(data.addressType);
      }
      const saved = localStorage.getItem(STORAGE_KEYS.deliveryLocation);
      if (saved) setLocation(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.deliveryFee !== undefined) setDeliveryFee(data.deliveryFee);
          if (data.onlinePaymentEnabled !== undefined) setOnlinePaymentEnabled(data.onlinePaymentEnabled);
          if (data.codEnabled !== undefined) setCodEnabled(data.codEnabled);
          if (data.minOrderValue !== undefined) setMinOrderValue(data.minOrderValue);
          if (data.homeLayout?.freeDelivery) {
            setFreeDeliveryConfig({
              enabled: data.homeLayout.freeDelivery.enabled !== false,
              minAmount: Number(data.homeLayout.freeDelivery.minAmount) || 199,
            });
          }
        }
      })
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.name) setName(profile.name);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = /^[6-9]\d{9}$/.test(phoneDigits);

  const isTimeValid = () => {
    if (scheduledTime !== "Custom Time") return true;
    return Boolean(customTime);
  };

  const isAddressValid =
    addrLine1.trim().length > 2 &&
    city.trim().length > 1 &&
    stateName.trim().length > 1 &&
    PIN_REGEX.test(pincode.trim());

  const formattedAddress = formatShippingAddress({
    line1: addrLine1,
    line2: addrLine2,
    landmark: locationNotes,
    city,
    state: stateName,
    pincode,
  });

  // Apparel orders get free shipping above the configured threshold
  const hasOnndawayFoodOrCoffee = false;

  // Minimum order feature disabled for ORBT clothing orders.
  // Keeping the variables keeps the existing payment summary code safe.
  const targetMinOrder = 0;
  const isMinOrderMet = true;
  const minOrderShortfall = 0;
  const minOrderPct = 100;

  // Free delivery check:
  // Onndaway food & coffee ALWAYS get free delivery!
  // Non-food items get free delivery if cart total >= free delivery min amount (e.g. ₹199)
  const isFreeDeliveryEligible = hasOnndawayFoodOrCoffee || (
    freeDeliveryConfig?.enabled !== false &&
    freeDeliveryConfig?.minAmount !== undefined &&
    cartTotal >= freeDeliveryConfig.minAmount
  );
  const effectiveDeliveryFee = isFreeDeliveryEligible ? 0 : deliveryFee;

  const canPlace = cart.length > 0 && isAddressValid && isPhoneValid && name.trim().length > 0 && isTimeValid() && isMinOrderMet;

  const addressSteps = [
    { label: "Contact", done: name.trim().length > 0 && isPhoneValid },
    { label: "Address", done: isAddressValid },
    { label: "Delivery", done: isTimeValid() },
  ];
  const addressDone = addressSteps.filter((step) => step.done).length;

  const handleApplyCoupon = async () => {
    const code = couponCode.toUpperCase();
    if (!code) return;
    try {
      const res = await fetch(`/api/coupons?code=${code}`);
      if (res.ok) {
        const coupon = await res.json();
        setAppliedCoupon(coupon);
        toast.success("Coupon applied!");

        // Meme logic
        if (coupon.memeImage || coupon.memeSound) {
          setMemePopup({ image: coupon.memeImage, sound: coupon.memeSound, visible: true });
          setTimeout(() => {
            setMemePopup(prev => prev ? { ...prev, visible: false } : null);
            setTimeout(() => setMemePopup(null), 300); // Wait for fade out
          }, 3500); // Show for 3.5 seconds
        }
      } else {
        setAppliedCoupon(null);
        toast.error("Invalid or expired coupon code");
      }
    } catch {
      setAppliedCoupon(null);
      toast.error("Failed to verify coupon");
    }
  };

  const finalDiscount = appliedCoupon
    ? appliedCoupon.type === "percentage" ? (cartTotal * appliedCoupon.discount) / 100 : appliedCoupon.discount
    : 0;
  const grandTotal = Math.max(0, cartTotal - finalDiscount + effectiveDeliveryFee);

  const prepareOrderPayload = () => {
    let locData: any = null;
    let storeData: any = null;
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.deliveryLocationData);
      if (savedData) locData = JSON.parse(savedData);
      const savedStore = localStorage.getItem(STORAGE_KEYS.servingStore);
      if (savedStore) storeData = JSON.parse(savedStore);
    } catch { /* ignore */ }

    const shippingData = {
      ...(locData || {}),
      address: formattedAddress,
      line1: addrLine1.trim(),
      line2: addrLine2.trim() || undefined,
      landmark: locationNotes.trim() || undefined,
      city: city.trim(),
      state: stateName,
      pincode: pincode.trim(),
      addressType,
    };
    localStorage.setItem(STORAGE_KEYS.deliveryLocation, formattedAddress);
    localStorage.setItem(STORAGE_KEYS.deliveryLocationData, JSON.stringify(shippingData));

    return {
      userId: phoneDigits,
      userName: name.trim(),
      userPhone: phoneDigits,
      items: normalizeCartLines(cart),
      location: formattedAddress || location.trim(),
      locationNotes: [addressType, locationNotes.trim()].filter(Boolean).join(" · ") || null,
      latitude: locData?.latitude ?? null,
      longitude: locData?.longitude ?? null,
      storeId: locData?.storeId || storeData?.id || cart.find(c => c.item.storeId)?.item.storeId || null,
      total: grandTotal,
      couponCode: appliedCoupon ? couponCode : null,
      discount: finalDiscount,
      scheduledTime: scheduledTime === "Custom Time" ? customTime : scheduledTime,
    };
  };

  const finalizeOrderClientSide = async (orderId: string, userId: string, locationStr: string) => {
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phoneDigits, location: locationStr, userId }),
    });
    localStorage.setItem("otw_user_id", userId);
    setActiveOrderId(orderId);
    await syncProfile(userId);
    clearCart();
    setPlacedOrderId(orderId);
  };

  const handlePlaceCOD = async () => {
    setPlacing(true);
    try {
      const payload = prepareOrderPayload();
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "Failed to place order. Please try again.");
      }

      const orderResult = await res.json();
      setIdempotencyKey(crypto.randomUUID());
      await finalizeOrderClientSide(orderResult.id, payload.userId, payload.location);
      setShowCodModal(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    } finally { setPlacing(false); }
  };

  const createRazorpayOrder = async () => {
    const payload = prepareOrderPayload();
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to initiate payment");
    }

    setIdempotencyKey(crypto.randomUUID());
    return res.json();
  };

  /* ─── POST-ORDER SCREEN ─── */
  if (placedOrderId) {
    return (
      <div style={{ background: "#FAFAFA", minHeight: "100vh", color: "#0A0A0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <style>{`
          @keyframes pulse-ring-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(34,197,94,0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34,197,94,0); }
          }
          @keyframes slide-up-post { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        <div style={{ textAlign: "center", animation: "slide-up-post 0.5s ease", background: "#fff", borderRadius: "24px", padding: "48px 36px", maxWidth: "440px", width: "100%", boxShadow: "0 8px 0 rgba(0,0,0,0.9), 0 20px 40px rgba(0,0,0,0.12)" }}>
          <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🎉</div>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pulse-ring-green 1.5s ease-in-out infinite" }}>
            <CheckCircle size={40} color="#22C55E" />
          </div>
          <h2 style={{ fontSize: "1.9rem", fontWeight: 900, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px", color: "#22C55E" }}>Order Placed!</h2>
          <p style={{ color: "#6B7280", marginBottom: "32px", fontSize: "0.95rem", lineHeight: 1.7 }}>
            Your order has been <strong style={{ color: "#0A0A0A" }}>placed successfully</strong>. We’ll pack it and ship it to your address — track it anytime.
          </p>
          <div style={{ padding: "16px 36px" }} /> {/* Spacer since button moved to bottom */}
        </div>

        {/* ── Fixed Bottom Track Order Bar ── */}
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px)",
          padding: "12px 16px 12px 20px", borderRadius: "999px",
          display: "flex", alignItems: "center", gap: "20px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.1)", zIndex: 999,
          width: "90%", maxWidth: "420px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              📦
            </div>
            <div>
              <div style={{ color: "#0A0A0A", fontSize: "0.95rem", fontWeight: 800, lineHeight: 1.2 }}>Order Active</div>
              <div style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 500 }}>Track your shipment</div>
            </div>
          </div>
          <Link
            href={`/track/${placedOrderId}`}
            style={{
              background: "#000000", color: "#ffffff",
              padding: "12px 24px", borderRadius: "999px",
              fontWeight: 800, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.5px",
              display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)", flexShrink: 0, transition: "transform 0.2s"
            }}
          >
            Track <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  /* ─── EMPTY CART ─── */
  if (cart.length === 0) {
    return (
      <div style={{ minHeight: "100vh", color: "#F4F4F2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px", opacity: 0.3 }}>✦</div>
        <h2 style={{ fontSize: "1.9rem", fontWeight: 900, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>Your cart is empty</h2>
        <p style={{ color: "#A8A8A4", marginBottom: "32px", textAlign: "center" }}>Looks like you haven&apos;t added any pieces yet.</p>
        <Link href="/menu" style={{ background: "#F4F4F2", color: "#0A0A0A", padding: "14px 32px", borderRadius: "99px", fontWeight: 900, textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px" }}>
          Shop the drop
        </Link>
      </div>
    );
  }

  /* ─── SHARED STYLES ─── */
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 14px",
    background: "#0F0F0F", border: "1px solid rgba(255, 255, 255, 0.16)",
    borderRadius: "4px", color: "#F4F4F2", outline: "none",
    fontSize: "0.93rem", transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    color: "#F4F4F2", marginBottom: "7px",
    textTransform: "uppercase", letterSpacing: "0.8px",
  };
  const cardStyle: React.CSSProperties = {
    background: "#141414", border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "4px", padding: "22px 20px",
  };
  const isLoggedIn = !!user;

  return (
    <div style={{ minHeight: "100vh", color: "#F4F4F2", padding: "28px 0 100px", fontFamily: "inherit", position: "relative" }}>
      <style>{`
        @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin-wait { to { transform: rotate(360deg); } }
        .otw-cart-input:focus { border-color: #000000 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.1) !important; }
        .otw-qty-btn:hover { background: #F5F5F5 !important; }
        .otw-del-btn:hover { background: #FEE2E2 !important; border-color: #fca5a5 !important; }
        .otw-apply-btn:hover { background: #111111 !important; }
        .otw-back-btn:hover { background: #F5F5F5 !important; }
        .cart-grid { display: grid; gap: 24px; align-items: start; grid-template-columns: 1fr 370px; }
        @media (max-width: 900px) { .cart-grid { grid-template-columns: 1fr !important; } }
        .time-slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
        .time-slot-btn {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 1px;
          padding: 10px 8px; border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.16); background: #171717;
          cursor: pointer; transition: all 0.18s; text-align: center;
          font-family: inherit;
        }
        .time-slot-btn:hover { border-color: #000000; background: #F5F5F5; }
        .time-slot-btn.active { border-color: #000000; background: #000000; }
        .time-slot-btn.active .ts-label { color: #fff; }
        .time-slot-btn.active .ts-sub { color: rgba(255,255,255,0.7); }
        .ts-label { font-size: 0.8rem; font-weight: 800; color: #0A0A0A; line-height: 1.2; }
        .ts-sub { font-size: 0.65rem; color: #9ca3af; font-weight: 500; margin-top: 1px; }
        .loc-wrap { position: relative; }
        .loc-suggestions {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #fff; border: 1.5px solid #000000;
          border-radius: 10px; overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 200; max-height: 220px; overflow-y: auto;
          animation: slide-up 0.15s ease;
        }
        .loc-suggestion-item {
          padding: 10px 14px; font-size: 0.87rem; cursor: pointer;
          color: #0A0A0A; font-weight: 500;
          transition: background 0.12s;
          border-bottom: 1px solid #f3f4f6;
        }
        .loc-suggestion-item:last-child { border-bottom: none; }
        .loc-suggestion-item:hover { background: #F5F5F5; color: #000000; font-weight: 700; }
        .loc-suggestion-match { color: #000000; font-weight: 800; }
        .addr-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
        .addr-title-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .addr-icon { width: 38px; height: 38px; border-radius: 50%; background: #171717; border: 1px solid rgba(255,255,255,0.12); display: grid; place-items: center; flex-shrink: 0; }
        .addr-title { margin: 0; font-size: 0.82rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: #F4F4F2; }
        .addr-sub { margin: 3px 0 0; font-size: 0.78rem; color: #A8A8A4; font-weight: 500; }
        .addr-status { flex-shrink: 0; border: 1px solid rgba(255,255,255,0.16); border-radius: 999px; padding: 6px 11px; font-size: 0.66rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #A8A8A4; background: #171717; }
        .addr-status.ready { color: #F4F4F2; background: #242424; border-color: #F4F4F2; }
        .addr-progress { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 22px; }
        .addr-step { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 4px; background: #171717; border: 1px solid rgba(255,255,255,0.08); min-width: 0; }
        .addr-step-dot { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.22); display: grid; place-items: center; flex-shrink: 0; color: #A8A8A4; font-size: 0.55rem; font-weight: 900; background: #0F0F0F; }
        .addr-step.done { background: #242424; border-color: rgba(255,255,255,0.18); }
        .addr-step.done .addr-step-dot { background: #F4F4F2; border-color: #F4F4F2; color: #0A0A0A; }
        .addr-step-label { font-size: 0.67rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: #A8A8A4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .addr-step.done .addr-step-label { color: #F4F4F2; }
        .addr-section { grid-column: 1 / -1; display: flex; align-items: center; gap: 10px; margin: 6px 0 -2px; }
        .addr-section::after { content: ""; height: 1px; flex: 1; background: rgba(255,255,255,0.1); }
        .addr-section span { font-size: 0.64rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: #6E6E6A; white-space: nowrap; }
        .addr-preview { margin-top: 20px; padding: 16px; border-radius: 4px; background: #171717; border: 1px solid rgba(255,255,255,0.1); color: #fff; display: flex; gap: 12px; align-items: flex-start; }
        .addr-preview-icon { width: 34px; height: 34px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.22); display: grid; place-items: center; flex-shrink: 0; }
        .addr-preview-label { margin: 0 0 5px; font-size: 0.58rem; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
        .addr-preview-name { font-size: 0.86rem; font-weight: 800; color: #fff; }
        .addr-preview-line { margin-top: 3px; font-size: 0.76rem; line-height: 1.5; color: rgba(255,255,255,0.72); }
        .addr-preview-empty { font-size: 0.76rem; line-height: 1.55; color: rgba(255,255,255,0.6); }
        .addr-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 520px) {
          .addr-card-head { flex-direction: column; gap: 10px; }
          .addr-progress { grid-template-columns: 1fr; }
          .addr-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Main Grid ── */}
      <div className="cart-grid" style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 16px" }}>

        {/* ── Left Column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Link
              href="/"
              className="otw-back-btn"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "transparent", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#F4F4F2", textDecoration: "none", transition: "background 0.2s" }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.9rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px", margin: 0, color: "#F4F4F2", lineHeight: 1.1 }}>My Cart</h1>
              <p style={{ fontSize: "0.8rem", color: "#A8A8A4", margin: "2px 0 0", fontWeight: 500 }}>Review your pieces and place your order</p>
            </div>
          </div>

          {/* ── Cart Items Card ── */}
          <div style={cardStyle}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#F4F4F2", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              Order Summary &nbsp;·&nbsp; {cart.length} {cart.length === 1 ? "item" : "items"}
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {cart.map((c, idx) => (
                <div
                  key={c.cartItemId ?? `cart-${c.item.id}-${idx}`}
                  style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "14px 0", borderBottom: idx < cart.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
                >
                  {/* Clever Product image */}
                  <CartItemThumbnail item={c.item} quantity={c.quantity} />

                  {/* Details + controls (flex column keeps everything in-bounds) */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "68px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ paddingRight: "10px" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.97rem", color: "#F4F4F2", letterSpacing: "0.2px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.item.name}</div>
                        <div style={{ color: "#9ca3af", fontSize: "0.78rem", marginTop: "2px", textTransform: "capitalize" }}>{c.item.category || "Item"}</div>
                      </div>
                      <button
                        className="otw-del-btn"
                        onClick={() => removeFromCart(c.cartItemId || c.item.id)}
                        style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", background: "#171717", color: "#F4F4F2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", flexShrink: 0 }}
                      ><Trash2 size={14} /></button>
                    </div>

                    {c.lineDetails && (
                      <div style={{ marginTop: "4px", fontSize: "0.78rem", color: "#C9C9C5", lineHeight: 1.4 }}>{c.lineDetails}</div>
                    )}
                    {!c.lineDetails && c.selectedCustomizations && c.selectedCustomizations.length > 0 && (
                      <div style={{ marginTop: "4px", fontSize: "0.78rem", color: "#C9C9C5" }}>
                        {c.selectedCustomizations.map(sc => `${sc.category}: ${sc.option}`).join(" · ")}
                      </div>
                    )}
                    {!c.lineDetails && c.specialInstructions && (
                      <div style={{ marginTop: "5px", fontSize: "0.78rem", color: "#92400E", background: "#FEF3C7", padding: "3px 8px", borderRadius: "5px", display: "inline-block", fontWeight: 600 }}>
                        <span style={{ color: "#D97706", marginRight: "3px" }}>Note:</span>{c.specialInstructions}
                      </div>
                    )}

                    {/* Price + controls row */}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px" }}>
                      <div style={{ fontWeight: 900, fontSize: "1rem", color: "#F4F4F2", flexShrink: 0 }}>₹{(c.unitPrice ?? c.item.price).toLocaleString("en-IN")}</div>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "99px", overflow: "hidden", background: "#171717" }}>
                        <button
                          className="otw-qty-btn"
                          onClick={() => updateQuantity(c.cartItemId || c.item.id, c.quantity - 1)}
                          style={{ width: 30, height: 30, border: "none", background: "transparent", color: "#F4F4F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                        ><Minus size={13} /></button>
                        <span style={{ fontWeight: 700, width: "26px", textAlign: "center", fontSize: "0.9rem", color: "#F4F4F2" }}>{c.quantity}</span>
                        <button
                          className="otw-qty-btn"
                          onClick={() => updateQuantity(c.cartItemId || c.item.id, c.quantity + 1)}
                          style={{ width: 30, height: 30, border: "none", background: "transparent", color: "#F4F4F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                        ><Plus size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Delivery Details Card ── */}
          <div style={cardStyle}>
            <div className="addr-card-head">
              <div className="addr-title-wrap">
                <span className="addr-icon">
                  <MapPin size={16} color="#0A0A0A" />
                </span>
                <div>
                  <p className="addr-title">Shipping details</p>
                  <p className="addr-sub">Tell us where to send your order.</p>
                </div>
              </div>
              <span className={`addr-status${isAddressValid ? " ready" : ""}`}>
                {isAddressValid ? "Address complete" : `${addressDone}/3 complete`}
              </span>
            </div>

            <div className="addr-progress">
              {addressSteps.map((step, idx) => (
                <div key={step.label} className={`addr-step${step.done ? " done" : ""}`}>
                  <span className="addr-step-dot">{step.done ? "✓" : idx + 1}</span>
                  <span className="addr-step-label">{step.label}</span>
                </div>
              ))}
            </div>

            <div className="addr-form-grid">
              <div className="addr-section"><span>01 · Contact</span></div>

              {!isLoggedIn ? (
                <>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Your Name</label>
                    <input type="text" style={inputStyle} className="otw-cart-input" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ padding: "13px 12px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.16)", background: "#171717", fontWeight: 700, fontSize: "0.88rem", color: "#F4F4F2", flexShrink: 0 }}>🇮🇳 +91</div>
                      <input type="tel" style={{ ...inputStyle, flex: 1 }} className="otw-cart-input" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ gridColumn: "1 / -1", background: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F4F4F2", color: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1rem", overflow: "hidden", flexShrink: 0 }}>
                    {(profile as any)?.image ? (
                      <img src={(profile as any).image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      profile?.name?.[0]?.toUpperCase() || name?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#F4F4F2", fontSize: "0.95rem", textTransform: "capitalize" }}>{profile?.name || name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#A8A8A4", marginTop: "2px" }}>+91 {profile?.phone || phone}</div>
                  </div>
                </div>
              )}

              <div className="addr-section"><span>02 · Address</span></div>

              <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                {(["home", "work", "other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddressType(t)}
                    style={{
                      flex: 1,
                      padding: "9px 8px",
                      borderRadius: 999,
                      border: addressType === t ? "1px solid #F4F4F2" : "1px solid rgba(255,255,255,0.16)",
                      background: addressType === t ? "#F4F4F2" : "#171717",
                      color: addressType === t ? "#0A0A0A" : "#A8A8A4",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>House / Flat / Street *</label>
                  <button type="button" onClick={() => {
                    if (navigator.geolocation) {
                      setIsGpsLoading(true);
                      toast.loading("Fetching address...", { id: "gps" });
                      navigator.geolocation.getCurrentPosition(
                        async pos => {
                          try {
                            const { latitude, longitude } = pos.coords;
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                            const data = await res.json();
                            const a = data?.address || {};
                            const line1 = [a.house_number, a.road, a.neighbourhood || a.suburb].filter(Boolean).join(", ");
                            setAddrLine1(line1 || data?.display_name?.split(",")[0] || "");
                            setAddrLine2(a.suburb || a.residential || "");
                            setCity(a.city || a.town || a.village || a.state_district || "");
                            const matched = INDIAN_STATES.find(s => s.toLowerCase() === String(a.state || "").toLowerCase());
                            if (matched) setStateName(matched);
                            const pin = String(a.postcode || "").replace(/\D/g, "").slice(0, 6);
                            if (pin) setPincode(pin);
                            toast.success("Address filled — confirm PIN and street", { id: "gps" });
                          } catch {
                            toast.error("Could not read street address", { id: "gps" });
                          } finally {
                            setIsGpsLoading(false);
                          }
                        },
                        err => {
                          setIsGpsLoading(false);
                          const msg = err.code === 1 ? "Location access denied. Please enable in settings." : err.code === 3 ? "Location request timed out." : "Failed to get location.";
                          toast.error(msg, { id: "gps" });
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                      );
                    } else {
                      toast.error("Geolocation is not supported by your browser");
                    }
                  }} disabled={isGpsLoading} style={{ background: "transparent", border: "none", color: isGpsLoading ? "#6E6E6A" : "#F4F4F2", fontSize: "0.75rem", fontWeight: 700, cursor: isGpsLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    {isGpsLoading ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #9CA3AF", borderTopColor: "transparent", animation: "spin-wait 1s linear infinite" }} /> : <MapPin size={12} />}
                    {isGpsLoading ? "Locating..." : "Use GPS"}
                  </button>
                </div>
                <input
                  type="text"
                  style={inputStyle}
                  className="otw-cart-input"
                  placeholder="e.g. 14, 2nd Floor, Green Park"
                  value={addrLine1}
                  onChange={e => setAddrLine1(e.target.value)}
                  autoComplete="address-line1"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Apartment / Area (optional)</label>
                <input type="text" style={inputStyle} className="otw-cart-input" placeholder="Society, colony, or locality" value={addrLine2} onChange={e => setAddrLine2(e.target.value)} autoComplete="address-line2" />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Landmark (optional)</label>
                <input type="text" style={inputStyle} className="otw-cart-input" placeholder="Near metro, mall, or office" value={locationNotes} onChange={e => setLocationNotes(e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>City *</label>
                <input type="text" style={inputStyle} className="otw-cart-input" placeholder="Delhi" value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" />
              </div>
              <div>
                <label style={labelStyle}>PIN code *</label>
                <input type="text" style={inputStyle} className="otw-cart-input" placeholder="110001" inputMode="numeric" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} autoComplete="postal-code" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>State *</label>
                <select style={{ ...inputStyle, background: "#fff" }} className="otw-cart-input" value={stateName} onChange={e => setStateName(e.target.value)}>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="addr-section"><span>03 · Delivery</span></div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Delivery speed</label>
                <div className="time-slot-grid">
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.label}
                      type="button"
                      className={`time-slot-btn${scheduledTime === slot.label ? " active" : ""}`}
                      onClick={() => { setScheduledTime(slot.label); setCustomTime(""); }}
                    >
                      <span className="ts-label">{slot.label}</span>
                      <span className="ts-sub">{slot.sub}</span>
                    </button>
                  ))}
                </div>
                {scheduledTime === "Custom Time" && (
                  <div style={{ marginTop: "10px" }}>
                    <input type="time" style={inputStyle} className="otw-cart-input" value={customTime} onChange={e => setCustomTime(e.target.value)} />
                    {!isTimeValid() && customTime && (
                      <p style={{ color: "#EF4444", fontSize: "0.73rem", marginTop: "5px", fontWeight: 600 }}>Pick a preferred delivery slot.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="addr-preview">
              <span className="addr-preview-icon">
                <MapPin size={15} color="#fff" />
              </span>
              <div style={{ minWidth: 0 }}>
                <p className="addr-preview-label">Delivering to</p>
                {isAddressValid ? (
                  <>
                    <div className="addr-preview-name">
                      {profile?.name || name || "ORBT customer"}
                      {phoneDigits ? ` · +91 ${phoneDigits}` : ""}
                    </div>
                    <div className="addr-preview-line">{formattedAddress}</div>
                  </>
                ) : (
                  <div className="addr-preview-empty">
                    Add your street, city, state, and 6-digit PIN to preview the delivery address.
                  </div>
                )}
              </div>
            </div>

            {!isLoggedIn && (
              <div style={{ marginTop: "18px", padding: "12px 14px", borderRadius: "10px", background: "#FEF3C7", fontSize: "0.83rem", color: "#92400E", lineHeight: 1.55, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong style={{ color: "#D97706" }}>Please enter your real number.</strong> The courier may call this number at the door. Fake numbers get the order cancelled.
                </div>
              </div>
            )}
          </div>
        </div>
        {/* end Left Column */}

        {/* ── Right Column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Coupon */}
          <div style={cardStyle}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#F4F4F2", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
              <Tag size={14} color="#000000" /> Offers & Coupons
            </p>
            {appliedCoupon ? (
              <div style={{ background: "#171717", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#F4F4F2", fontSize: "0.88rem" }}>{couponCode} APPLIED ✓</div>
                  <div style={{ fontSize: "0.78rem", color: "#A8A8A4", marginTop: "2px" }}>{appliedCoupon.label}</div>
                </div>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ border: "none", background: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800, whiteSpace: "nowrap" }}>REMOVE</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" style={{ ...inputStyle, flex: 1 }} className="otw-cart-input" placeholder="Promo code" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                <button
                  className="otw-apply-btn"
                  onClick={handleApplyCoupon}
                  style={{ background: "#000000", color: "#fff", border: "none", padding: "0 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: "0 3px 0 #111111", transition: "background 0.15s" }}
                >Apply</button>
              </div>
            )}
          </div>

          {/* Bill Details */}
          <div style={cardStyle}>
            <p style={{ fontSize: "0.72rem", fontWeight: 800, color: "#F4F4F2", textTransform: "uppercase", letterSpacing: "1px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "16px" }}>
              Bill Details
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px", fontSize: "0.92rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#A8A8A4" }}>Item Total</span>
                <span style={{ fontWeight: 600, color: "#F4F4F2" }}>₹{cartTotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#A8A8A4" }}>Shipping Fee</span>
                {effectiveDeliveryFee === 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {deliveryFee > 0 && (
                      <span style={{ textDecoration: "line-through", color: "#9CA3AF", fontSize: "0.85rem" }}>
                        ₹{deliveryFee}
                      </span>
                    )}
                    <span style={{
                      fontWeight: 800,
                      color: "#F4F4F2",
                      background: "#242424",
                      border: "1px solid rgba(255,255,255,0.18)",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: "0.78rem"
                    }}>
                      FREE
                    </span>
                  </div>
                ) : (
                  <span style={{ fontWeight: 600, color: "#F4F4F2" }}>₹{deliveryFee.toLocaleString("en-IN")}</span>
                )}
              </div>
              {appliedCoupon && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#22C55E" }}>
                  <span>Discount ({couponCode})</span>
                  <span style={{ fontWeight: 700 }}>-₹{finalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.16)", margin: "2px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 900 }}>
                <span style={{ color: "#F4F4F2" }}>To Pay</span>
                <span style={{ color: "#F4F4F2" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {isFreeDeliveryEligible && (
              <div style={{
                marginTop: "16px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#0A0A0A",
                color: "#F4F4F2",
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}>
                <span>Free shipping unlocked on this order</span>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>₹{cartTotal.toFixed(0)}</span>
              </div>
            )}

            {/* ── PRIMARY: Razorpay Online Payment ── */}
            <div style={{ marginTop: "20px" }}>
              {onlinePaymentEnabled ? (
                <RazorpayButton
                  amountRupees={grandTotal}
                  customerName={name || (profile as any)?.name}
                  customerPhone={phoneDigits || (profile as any)?.phone}
                  disabled={!canPlace || placing}
                  createOrder={createRazorpayOrder}
                  onFailure={() => {
                    const newFailures = paymentFailures + 1;
                    setPaymentFailures(newFailures);
                    if (newFailures >= 2 && !codEnabled) {
                      setShowCodModal(true);
                    }
                  }}
                  onSuccess={async (paymentId, orderId, internalOrderId) => {
                    await finalizeOrderClientSide(internalOrderId, phoneDigits, formattedAddress);
                  }}
                />
              ) : (
                <div style={{ marginTop: "10px" }}>
                  {/* ── SECONDARY: Cash on Delivery (online payment off) ── */}
                  {(codEnabled || !onlinePaymentEnabled) && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          margin: "18px 0 0",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "#e5e7eb",
                          }}
                        />

                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          or pay on delivery
                        </span>

                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "#e5e7eb",
                          }}
                        />
                      </div>

                      <button
                        id="place-order-btn"
                        onClick={handlePlaceCOD}
                        disabled={!canPlace || placing}
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          padding: "14px",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          background:
                            !onlinePaymentEnabled && canPlace
                              ? "#000000"
                              : "transparent",
                          color:
                            !onlinePaymentEnabled && canPlace
                              ? "#ffffff"
                              : canPlace
                                ? "#0A0A0A"
                                : "#9ca3af",
                          border:
                            !onlinePaymentEnabled && canPlace
                              ? "1.5px solid #111111"
                              : canPlace
                                ? "1.5px solid #d1d5db"
                                : "1.5px solid #e5e7eb",
                          borderRadius: "10px",
                          cursor: canPlace ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          transition: "all 0.15s",
                          fontFamily: "inherit",
                        }}
                        onMouseOver={(e) => {
                          if (canPlace) {
                            if (!onlinePaymentEnabled) {
                              e.currentTarget.style.background = "#111111";
                            } else {
                              e.currentTarget.style.background = "#FAFAFA";
                              e.currentTarget.style.borderColor = "#000000";
                              e.currentTarget.style.color = "#000000";
                            }
                          }
                        }}
                        onMouseOut={(e) => {
                          if (canPlace) {
                            if (!onlinePaymentEnabled) {
                              e.currentTarget.style.background = "#000000";
                            } else {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.borderColor = "#d1d5db";
                              e.currentTarget.style.color = "#0A0A0A";
                            }
                          }
                        }}
                      >
                        {placing ? (
                          "Processing..."
                        ) : (
                          <>
                            Cash on Delivery <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {!isAddressValid && (
                    <p style={{ textAlign: "center", fontSize: "0.77rem", color: "#EF4444", marginTop: "10px", fontWeight: 600 }}>
                      Add house/street, city, state, and a 6-digit PIN
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* end Right Column */}

      </div>
      {/* end .cart-grid */}

      {/* ── Cash-on-Delivery Fallback Modal (shown after repeated online-payment failures) ── */}
      {showCodModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10,15,46,0.55)", backdropFilter: "blur(6px)", padding: "20px"
        }}>
          <div style={{
            background: "#fff", padding: "32px 24px", borderRadius: "24px",
            maxWidth: "360px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)", animation: "slide-up 0.3s ease-out"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>😅</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#0A0A0A", marginBottom: "12px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              Trouble paying online?
            </h3>
            <p style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "24px", fontWeight: 500 }}>
              It seems you're having trouble with the online payment. Don't worry, you can place your order via <strong style={{ color: "#0A0A0A" }}>Cash on Delivery</strong> instead!
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={handlePlaceCOD}
                disabled={placing}
                style={{
                  width: "100%", padding: "14px", background: "#000000", color: "#fff",
                  border: "none", borderRadius: "12px", fontWeight: 800, fontSize: "0.95rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  boxShadow: "0 4px 0 #111111", textTransform: "uppercase", letterSpacing: "0.5px", transition: "transform 0.15s"
                }}
                onMouseDown={e => e.currentTarget.style.transform = "translateY(4px)"}
                onMouseUp={e => e.currentTarget.style.transform = "translateY(0)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                {placing ? "Processing..." : <>Pay on Delivery <ArrowRight size={18} /></>}
              </button>
              <button
                onClick={() => setShowCodModal(false)}
                style={{
                  width: "100%", padding: "12px", background: "transparent", color: "#6B7280",
                  border: "none", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer"
                }}
              >
                Try Online Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Meme / Surprise Coupon Popup ── */}
      {memePopup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          pointerEvents: memePopup.visible ? "auto" : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: memePopup.visible ? 1 : 0, transition: "opacity 0.3s ease",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)"
        }}>
          {memePopup.sound && (
            <audio src={memePopup.sound} autoPlay />
          )}
          {memePopup.image && (
            <img
              src={memePopup.image}
              alt="Surprise!"
              style={{
                maxWidth: "90%", maxHeight: "80vh", borderRadius: "16px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                transform: memePopup.visible ? "scale(1) rotate(0deg)" : "scale(0.8) rotate(-10deg)",
                transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
