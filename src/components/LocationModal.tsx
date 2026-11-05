"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  X,
  ChevronDown,
  Building2,
  Compass,
  Plus,
  Clock,
  CheckCircle2,
  RefreshCw,
  Home,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import { STORAGE_KEYS, PIN_REGEX } from "@/lib/constants";
import { INDIAN_STATES } from "@/lib/types";
import type { Store as StoreType, ServiceabilityResult, AddressType, ShippingAddress } from "@/lib/types";

const SAVED_ADDRESSES_KEY = "otw_saved_addresses";

export interface DeliveryLocationData {
  address: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressType?: AddressType;
  fullName?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  storeId?: string | null;
  storeName?: string | null;
  serviceArea?: string | null;
}

export function formatShippingAddress(data: Partial<ShippingAddress & DeliveryLocationData>): string {
  const parts = [
    data.line1,
    data.line2,
    data.landmark ? `Near ${data.landmark}` : "",
    data.city,
    data.state,
    data.pincode,
  ].filter(Boolean);
  return parts.join(", ");
}

export function useDeliveryLocation() {
  const [location, setLocationState] = useState<string | null>(null);
  const [locationData, setLocationDataState] = useState<DeliveryLocationData | null>(null);
  const [servingStore, setServingStoreState] = useState<StoreType | null>(null);

  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem(STORAGE_KEYS.deliveryLocation);
      if (savedLoc) setLocationState(savedLoc);

      const savedData = localStorage.getItem(STORAGE_KEYS.deliveryLocationData);
      if (savedData) setLocationDataState(JSON.parse(savedData));

      const savedStore = localStorage.getItem(STORAGE_KEYS.servingStore);
      if (savedStore) setServingStoreState(JSON.parse(savedStore));
    } catch {
      // ignore
    }
  }, []);

  const saveLocation = useCallback((loc: string, data?: DeliveryLocationData, store?: StoreType | null) => {
    localStorage.setItem(STORAGE_KEYS.deliveryLocation, loc);
    setLocationState(loc);

    if (data) {
      localStorage.setItem(STORAGE_KEYS.deliveryLocationData, JSON.stringify(data));
      setLocationDataState(data);
    }

    if (store) {
      localStorage.setItem(STORAGE_KEYS.servingStore, JSON.stringify(store));
      setServingStoreState(store);
    }

    try {
      const historyStr = localStorage.getItem("otw_saved_locations");
      let history = historyStr ? JSON.parse(historyStr) : [];
      if (!Array.isArray(history)) history = [];
      const newLocations = [loc, ...history.filter((l: string) => l !== loc)].slice(0, 5);
      localStorage.setItem("otw_saved_locations", JSON.stringify(newLocations));

      if (data?.line1 && data?.city && data?.pincode) {
        const savedStr = localStorage.getItem(SAVED_ADDRESSES_KEY);
        let saved: DeliveryLocationData[] = savedStr ? JSON.parse(savedStr) : [];
        if (!Array.isArray(saved)) saved = [];
        saved = [data, ...saved.filter((a) => a.address !== data.address)].slice(0, 6);
        localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.deliveryLocation);
    localStorage.removeItem(STORAGE_KEYS.deliveryLocationData);
    localStorage.removeItem(STORAGE_KEYS.servingStore);
    setLocationState(null);
    setLocationDataState(null);
    setServingStoreState(null);
  }, []);

  return { location, locationData, servingStore, saveLocation, clearLocation };
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (location: string, data?: DeliveryLocationData, store?: StoreType | null) => void;
}

const emptyForm = {
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "Delhi",
  pincode: "",
  addressType: "home" as AddressType,
};

export function LocationModal({ isOpen, onClose, onSave }: LocationModalProps) {
  const [mode, setMode] = useState<"form" | "gps" | "saved">("form");
  const [form, setForm] = useState(emptyForm);
  const [savedAddresses, setSavedAddresses] = useState<DeliveryLocationData[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const savedStr = localStorage.getItem(SAVED_ADDRESSES_KEY);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) setSavedAddresses(parsed);
      }
      const current = localStorage.getItem(STORAGE_KEYS.deliveryLocationData);
      if (current) {
        const data = JSON.parse(current) as DeliveryLocationData;
        setForm({
          line1: data.line1 || "",
          line2: data.line2 || "",
          landmark: data.landmark || "",
          city: data.city || "",
          state: data.state || "Delhi",
          pincode: data.pincode || "",
          addressType: data.addressType || "home",
        });
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const completeSelection = (loc: string, data: DeliveryLocationData, store?: StoreType | null) => {
    localStorage.setItem(STORAGE_KEYS.deliveryLocation, loc);
    localStorage.setItem(STORAGE_KEYS.deliveryLocationData, JSON.stringify(data));
    if (store) {
      localStorage.setItem(STORAGE_KEYS.servingStore, JSON.stringify(store));
    }
    if (onSave) onSave(loc, data, store);
    onClose();
  };

  const handleSaveForm = async () => {
    if (!form.line1.trim()) {
      toast.error("Enter house / street / apartment");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Enter your city");
      return;
    }
    if (!form.state.trim()) {
      toast.error("Select your state");
      return;
    }
    if (!PIN_REGEX.test(form.pincode.trim())) {
      toast.error("Enter a valid 6-digit PIN code");
      return;
    }

    let store: StoreType | null = null;
    try {
      const res = await fetch(`/api/serviceability?area=${encodeURIComponent(form.city.trim())}`);
      const data: ServiceabilityResult = await res.json();
      store = data.store || null;
    } catch {
      // shipping still works without a mapped hub
    }

    const locData: DeliveryLocationData = {
      address: "",
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      landmark: form.landmark.trim() || undefined,
      city: form.city.trim(),
      state: form.state,
      pincode: form.pincode.trim(),
      addressType: form.addressType,
      storeId: store?.id || null,
      storeName: store?.name || null,
    };
    locData.address = formatShippingAddress(locData);
    completeSelection(locData.address, locData, store);
    toast.success("Shipping address saved");
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await res.json();
          const a = data?.address || {};
          const line1 = [a.house_number, a.road, a.neighbourhood || a.suburb].filter(Boolean).join(", ");
          const city = a.city || a.town || a.village || a.state_district || "";
          const stateMatch = INDIAN_STATES.find(
            (s) => s.toLowerCase() === String(a.state || "").toLowerCase()
          ) || a.state || "Delhi";
          const pincode = String(a.postcode || "").replace(/\D/g, "").slice(0, 6);

          setForm({
            line1: line1 || data?.display_name?.split(",")[0] || "",
            line2: a.suburb || a.residential || "",
            landmark: a.amenity || "",
            city,
            state: INDIAN_STATES.includes(stateMatch) ? stateMatch : "Delhi",
            pincode,
            addressType: form.addressType,
          });
          setMode("form");
          toast.success("Address filled from GPS — please confirm PIN and street");
        } catch {
          toast.error("Could not read street address. Please fill it in.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          toast.error("Location permission denied. Enter your shipping address instead.");
        } else {
          toast.error("Unable to retrieve location.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1.5px solid #CBD5E1",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.72rem",
    fontWeight: 800,
    color: "#334155",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "520px",
          zIndex: 10000,
          background: "#FFFFFF",
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: "1.25rem", color: "#0F172A", margin: 0 }}>
              Shipping address
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#64748B", margin: "4px 0 0" }}>
              Where should we send your KLOYH order?
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div style={{ display: "flex", background: "#F8FAFC", padding: "6px 20px", borderBottom: "1px solid #E2E8F0", gap: 6 }}>
          {[
            { id: "form", label: "New address", icon: <Plus size={14} /> },
            { id: "gps", label: "Use GPS", icon: <Compass size={14} /> },
            ...(savedAddresses.length > 0 ? [{ id: "saved", label: "Saved", icon: <Clock size={14} /> }] : []),
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id as typeof mode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 10,
                border: "none",
                background: mode === t.id ? "#0135FB" : "transparent",
                color: mode === t.id ? "white" : "#64748B",
                fontWeight: 800,
                fontSize: "0.76rem",
                cursor: "pointer",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {mode === "form" && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {([
                  { id: "home", label: "Home", icon: <Home size={14} /> },
                  { id: "work", label: "Work", icon: <Briefcase size={14} /> },
                  { id: "other", label: "Other", icon: <Building2 size={14} /> },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setField("addressType", t.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 8px",
                      borderRadius: 10,
                      border: form.addressType === t.id ? "1.5px solid #0135FB" : "1.5px solid #E2E8F0",
                      background: form.addressType === t.id ? "#EEF1FF" : "#fff",
                      color: form.addressType === t.id ? "#0135FB" : "#475569",
                      fontWeight: 800,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>House / Flat / Street *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 14, 2nd Floor, Green Park"
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Apartment / Area (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="Society, colony, or locality"
                  value={form.line2}
                  onChange={(e) => setField("line2", e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Landmark (optional)</label>
                <input
                  style={inputStyle}
                  placeholder="Near metro, mall, or office"
                  value={form.landmark}
                  onChange={(e) => setField("landmark", e.target.value)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input
                    style={inputStyle}
                    placeholder="Delhi"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>PIN code *</label>
                  <input
                    style={inputStyle}
                    placeholder="110001"
                    inputMode="numeric"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>State *</label>
                <select
                  style={{ ...inputStyle, background: "#fff" }}
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveForm}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  background: "#0135FB",
                  color: "white",
                  border: "none",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(1,53,251,0.3)",
                }}
              >
                Save shipping address
              </button>
            </div>
          )}

          {mode === "gps" && (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EFF6FF", color: "#0135FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Compass size={32} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>
                Fill address from GPS
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "0 auto 20px", maxWidth: 360, lineHeight: 1.4 }}>
                We’ll suggest street, city, and PIN. Always double-check before we ship your pieces.
              </p>
              <button
                onClick={handleUseGps}
                disabled={gpsLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 24px",
                  borderRadius: 12,
                  background: "#0135FB",
                  color: "white",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: gpsLoading ? "not-allowed" : "pointer",
                }}
              >
                {gpsLoading ? <RefreshCw size={18} /> : <MapPin size={18} />}
                {gpsLoading ? "Detecting..." : "Detect my address"}
              </button>
            </div>
          )}

          {mode === "saved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {savedAddresses.map((addr, idx) => (
                <button
                  key={idx}
                  onClick={() => completeSelection(addr.address, addr)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "14px",
                    borderRadius: 12,
                    border: "1.5px solid #E2E8F0",
                    background: "#F8FAFC",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <CheckCircle2 size={18} color="#0135FB" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#0135FB", textTransform: "uppercase", marginBottom: 4 }}>
                      {addr.addressType || "Saved"}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#0F172A", lineHeight: 1.4 }}>{addr.address}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LocationButton({ location, onClick }: { location: string | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      id="location-picker-btn"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "7px 12px",
        borderRadius: "10px",
        border: "1.5px solid rgba(1,53,251,0.2)",
        background: location ? "#EEF1FF" : "rgba(255,255,255,0.9)",
        color: "#0135FB",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: 700,
        fontSize: "0.78rem",
        maxWidth: "200px",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <MapPin size={14} style={{ flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {location ? location.split(",")[0] : "Ship to?"}
      </span>
      <ChevronDown size={12} style={{ flexShrink: 0 }} />
    </button>
  );
}
