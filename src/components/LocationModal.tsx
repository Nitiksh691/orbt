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
  User,
  Phone,
  Trash2,
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
  fullName: "",
  phone: "",
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
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedAddresses(parsed);
          setMode("saved");
        }
      }
      const current = localStorage.getItem(STORAGE_KEYS.deliveryLocationData);
      if (current) {
        const data = JSON.parse(current) as DeliveryLocationData;
        setForm({
          fullName: data.fullName || "",
          phone: data.phone || "",
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
      toast.error("Please enter house, flat, or street address");
      return;
    }
    if (!form.city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!form.state.trim()) {
      toast.error("Please select your state");
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
      // shipping still works across India
    }

    const locData: DeliveryLocationData = {
      address: "",
      fullName: form.fullName.trim() || undefined,
      phone: form.phone.trim() || undefined,
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
    toast.success("Shipping address selected");
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

          setForm((prev) => ({
            ...prev,
            line1: line1 || data?.display_name?.split(",")[0] || "",
            line2: a.suburb || a.residential || "",
            landmark: a.amenity || "",
            city,
            state: INDIAN_STATES.includes(stateMatch) ? stateMatch : "Delhi",
            pincode,
          }));
          setMode("form");
          toast.success("Detected address! Verify details and save.");
        } catch {
          toast.error("Could not fetch address details automatically.");
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          toast.error("Permission denied. Please enter address manually.");
        } else {
          toast.error("Unable to get current location.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleDeleteSavedAddress = (e: React.MouseEvent, addressToDelete: string) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.address !== addressToDelete);
    setSavedAddresses(updated);
    localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
    toast.success("Address removed");
    if (updated.length === 0) {
      setMode("form");
    }
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #E5E5E5",
    background: "#FFFFFF",
    color: "#0A0A0A",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 800,
    color: "#6B6B6B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      />

      {/* Modal card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "540px",
          zIndex: 10000,
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #E5E5E5",
        }}
      >
        {/* Header */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid #E5E5E5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: "1.25rem", color: "#0A0A0A", margin: 0, letterSpacing: "-0.01em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
              Shipping Address
            </h2>
            <p style={{ fontSize: "0.78rem", color: "#6B6B6B", margin: "4px 0 0" }}>
              Orders are packaged and dispatched with tracked pan-India delivery.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid #E5E5E5", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            aria-label="Close"
          >
            <X size={18} color="#0A0A0A" />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", background: "#FAFAFA", padding: "6px 20px", borderBottom: "1px solid #E5E5E5", gap: 6 }}>
          {[
            ...(savedAddresses.length > 0 ? [{ id: "saved", label: `Saved (${savedAddresses.length})`, icon: <Clock size={14} /> }] : []),
            { id: "form", label: "New Address", icon: <Plus size={14} /> },
            { id: "gps", label: "Auto Detect", icon: <Compass size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id as typeof mode)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: mode === t.id ? "#000000" : "transparent",
                color: mode === t.id ? "#ffffff" : "#6B6B6B",
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal content */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {mode === "saved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B6B6B" }}>
                  Select an address for this order
                </span>
                <button
                  onClick={() => setMode("form")}
                  style={{ background: "none", border: "none", color: "#000000", fontWeight: 800, fontSize: "0.75rem", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}
                >
                  + Add New
                </button>
              </div>

              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => completeSelection(addr.address, addr)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderRadius: 12,
                    border: "1.5px solid #E5E5E5",
                    background: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#000000";
                    e.currentTarget.style.background = "#FAFAFA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E5E5E5";
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#000000", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <MapPin size={16} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 900, background: "#000000", color: "#ffffff", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {addr.addressType || "HOME"}
                        </span>
                        {addr.fullName && (
                          <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#0A0A0A" }}>
                            {addr.fullName}
                          </span>
                        )}
                        {addr.phone && (
                          <span style={{ fontSize: "0.78rem", color: "#6B6B6B" }}>
                            · +91 {addr.phone}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#333333", lineHeight: 1.5 }}>
                        {addr.address}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSavedAddress(e, addr.address)}
                    style={{ background: "transparent", border: "none", color: "#9B9B9B", cursor: "pointer", padding: "4px" }}
                    title="Remove address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {mode === "form" && (
            <div>
              {/* Address type pills */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[
                  { id: "home", label: "Home (All Day)", icon: <Home size={14} /> },
                  { id: "work", label: "Office (10am - 6pm)", icon: <Briefcase size={14} /> },
                  { id: "other", label: "Other", icon: <Building2 size={14} /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setField("addressType", t.id as AddressType)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 8px",
                      borderRadius: 8,
                      border: form.addressType === t.id ? "1.5px solid #000000" : "1px solid #E5E5E5",
                      background: form.addressType === t.id ? "#000000" : "#FFFFFF",
                      color: form.addressType === t.id ? "#FFFFFF" : "#6B6B6B",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.03em",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {/* Recipient Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Rahul Sharma"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>10-Digit Mobile</label>
                  <input
                    style={inputStyle}
                    placeholder="9876543210"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>

              {/* Street address */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Flat, House No., Building, Apartment *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Flat 402, Lotus Residency, Plot 18"
                  value={form.line1}
                  onChange={(e) => setField("line1", e.target.value)}
                />
              </div>

              {/* Area / Locality */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Area, Street, Sector, Village</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Sector 14, Near Metro Station"
                  value={form.line2}
                  onChange={(e) => setField("line2", e.target.value)}
                />
              </div>

              {/* Landmark */}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Landmark (Optional)</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. Opposite City Mall"
                  value={form.landmark}
                  onChange={(e) => setField("landmark", e.target.value)}
                />
              </div>

              {/* City and PIN */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Town / City *</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. New Delhi"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>6-Digit PIN Code *</label>
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

              {/* State */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>State *</label>
                <select
                  style={{ ...inputStyle, background: "#FFFFFF", cursor: "pointer" }}
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
                  borderRadius: 8,
                  background: "#000000",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 900,
                  fontSize: "0.88rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#333333")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#000000")}
              >
                Use this Shipping Address
              </button>
            </div>
          )}

          {mode === "gps" && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F5F5F5", color: "#000000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", border: "1px solid #E5E5E5" }}>
                <Compass size={32} />
              </div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0A0A0A", margin: "0 0 6px", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
                Auto Detect Location
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6B6B6B", margin: "0 auto 24px", maxWidth: 360, lineHeight: 1.5 }}>
                We'll fetch your current locality, city, and PIN code. You can verify and add your exact house / flat number.
              </p>
              <button
                onClick={handleUseGps}
                disabled={gpsLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 28px",
                  borderRadius: 8,
                  background: "#000000",
                  color: "#FFFFFF",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: gpsLoading ? "not-allowed" : "pointer",
                }}
              >
                {gpsLoading ? <RefreshCw size={16} className="animate-spin" /> : <MapPin size={16} />}
                {gpsLoading ? "Detecting Address..." : "Detect Current Location"}
              </button>
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
        borderRadius: "8px",
        border: "1px solid #E5E5E5",
        background: location ? "#F5F5F5" : "#FFFFFF",
        color: "#000000",
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
        {location ? location.split(",")[0] : "Deliver To"}
      </span>
      <ChevronDown size={12} style={{ flexShrink: 0 }} />
    </button>
  );
}
