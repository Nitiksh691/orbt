"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, ClipboardList, LogOut, Save, Settings, Package, MapPin, Calendar, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Order } from "@/lib/types";
import { setActiveOrderId, isActiveOrderStatus } from "@/lib/activeOrder";

export default function ProfilePage() {
  const { user, profile, loading, syncProfile } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");
  
  // Profile edit state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setCollege(profile.college || "");
      setYear(profile.year || "");
    }
  }, [profile]);

  useEffect(() => {
    if (user && orders.length === 0) {
      setFetchingOrders(true);
      fetch(`/api/orders?userId=${user.uid}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          setOrders(data);
          const inProgress = data.find((o: Order) => isActiveOrderStatus(o.status));
          if (inProgress) setActiveOrderId(inProgress.id);
          setFetchingOrders(false);
        })
        .catch(() => setFetchingOrders(false));
    }
  }, [user, orders.length]);

  const handleLogout = () => {
    localStorage.removeItem("otw_user_id");
    localStorage.removeItem("otw_cart");
    localStorage.removeItem("otw_profile");
    localStorage.removeItem("otw_demo_profile");
    localStorage.removeItem("otw_demo_banner");
    localStorage.removeItem("otw_delivery_id");
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          name,
          phone,
          location: college,
          year,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated!");
        syncProfile(user.uid);
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };
  
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "placed": return <span className="otw-badge otw-badge-blue">Placed</span>;
      case "preparing": return <span className="otw-badge otw-badge-yellow">Preparing</span>;
      case "out_for_delivery": return <span className="otw-badge otw-badge-blue" style={{ background: "#E0F2FE", color: "#0284C7" }}>Out for Delivery</span>;
      case "delivered": return <span className="otw-badge otw-badge-green">Delivered</span>;
      case "cancelled": return <span className="otw-badge otw-badge-red">Cancelled</span>;
      default: return null;
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: "70vh", background: "#080808", color: "#F4F4F2", display: "grid", placeItems: "center", padding: "56px 20px" }}>
        <p style={{ margin: 0, color: "#A8A8A4", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          Loading account…
        </p>
      </div>
    );
  }

  const joinDate = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Recently";

  return (
    <div style={{ minHeight: "calc(100vh - 68px)", paddingBottom: "100px" }}>
      
      {/* Cover Banner */}
      <div style={{
        height: "180px",
        background: "#000000",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "absolute", top: -50, right: -20, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -80, left: 40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      </div>

      <div className="otw-container" style={{ maxWidth: "800px", marginTop: "-60px", position: "relative", zIndex: 10 }}>
        
        {/* Main Profile Card */}
        <div className="otw-card" style={{ padding: "0 0 24px 0", marginBottom: "24px", overflow: "visible", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0 32px" }}>
            
            {/* Avatar - overlaps banner */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%", background: "var(--white)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "5px solid white", boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              marginTop: "-40px", overflow: "hidden", position: "relative",
              color: "#0A0A0A", fontSize: "3rem", fontWeight: 800
            }}>
              {profile?.image ? (
                <img src={profile.image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : profile?.gender ? (
                <img src={`/avatars/${profile.gender}.png`} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.1)" }} />
              ) : (
                profile?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              {!isEditing && activeTab === "info" && (
                <button onClick={() => setIsEditing(true)} className="otw-btn otw-btn-outline otw-btn-sm" style={{ borderRadius: "20px" }}>
                  <Settings size={15} /> Edit Profile
                </button>
              )}
              <button onClick={handleLogout} className="otw-btn otw-btn-white otw-btn-sm" style={{ borderRadius: "20px", color: "var(--error)", boxShadow: "0 4px 0 rgba(239, 68, 68, 0.2)" }}>
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* User Details */}
          <div style={{ padding: "16px 32px 0" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "4px", color: "#F4F4F2", display: "flex", alignItems: "center", gap: "8px" }}>
              {profile?.name || "User"}
              <span style={{ background: "#F4F4F2", color: "#0A0A0A", fontSize: "0.7rem", padding: "4px 8px", borderRadius: "999px", fontWeight: 800, textTransform: "uppercase" }}>
                {profile?.role || "ORBT Member"}
              </span>
            </h1>

            <p style={{ color: "#A8A8A4", fontSize: "1rem", marginBottom: "16px", fontWeight: 500 }}>
              +91 {profile?.phone || phone}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              {profile?.college && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#C9C9C5", fontSize: "0.9rem", fontWeight: 600 }}>
                  <MapPin size={16} color="#F4F4F2" /> {profile.college} {profile?.year ? `• ${profile.year}` : ""}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#C9C9C5", fontSize: "0.9rem", fontWeight: 600 }}>
                <Calendar size={16} color="#F4F4F2" /> Joined {joinDate}
              </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: "flex", gap: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#F4F4F2" }}>{orders.length}</div>
                <div style={{ fontSize: "0.8rem", color: "#A8A8A4", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Orders</div>
              </div>
              {/* Could add more stats here in the future like 'Reviews' or 'Favorites' */}
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", padding: "4px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
          <button
            onClick={() => { setActiveTab("info"); setIsEditing(false); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "4px", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s",
              background: activeTab === "info" ? "#F4F4F2" : "transparent",
              color: activeTab === "info" ? "#0A0A0A" : "#A8A8A4",
            }}
          >
            <User size={18} /> About
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setIsEditing(false); }}
            style={{
              flex: 1, padding: "12px", borderRadius: "4px", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s",
              background: activeTab === "orders" ? "#F4F4F2" : "transparent",
              color: activeTab === "orders" ? "#0A0A0A" : "#A8A8A4",
            }}
          >
            <Package size={18} /> Order History
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "info" && (
          <div className="animate-fade-up">
            {isEditing ? (
              <div className="otw-card" style={{ padding: "32px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>Edit Profile Information</h2>
                  <button onClick={() => setIsEditing(false)} className="otw-btn otw-btn-ghost" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Cancel</button>
                </div>
                
                <form onSubmit={handleSaveInfo} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-mid)", marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
                    <input type="text" className="otw-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" required />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-mid)", marginBottom: "8px", textTransform: "uppercase" }}>Phone Number</label>
                    <input type="tel" className="otw-input" value={phone} disabled style={{ background: "#F3F4F6", cursor: "not-allowed", color: "#9CA3AF" }} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>Phone number is verified and cannot be changed.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#C9C9C5", marginBottom: "8px", textTransform: "uppercase" }}>City / Base</label>
                      <input type="text" className="otw-input" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. IIT Delhi" />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#C9C9C5", marginBottom: "8px", textTransform: "uppercase" }}>Fit Preference</label>
                      <select className="otw-input" value={year} onChange={e => setYear(e.target.value)}>
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                        <option value="PG / Masters">PG / Masters</option>
                      </select>
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="otw-btn otw-btn-primary" style={{ marginTop: "12px", padding: "16px", borderRadius: "12px" }}>
                    <Save size={18} /> {isSaving ? "Saving changes..." : "Save Profile"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="otw-card" style={{ padding: "32px", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "20px", color: "#F4F4F2" }}>Personal Information</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Full Name</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-dark)" }}>{profile?.name || "Not set"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Phone</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-dark)" }}>+91 {profile?.phone || phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#9A9A96", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>City / Base</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#F4F4F2" }}>{profile?.college || "Not specified"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>Year</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-dark)" }}>{profile?.year || "Not specified"}</div>
                  </div>
                </div>

                {!profile?.college && (
                  <div style={{ marginTop: "24px", padding: "16px", background: "#FEF9C3", borderRadius: "12px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "1.5rem" }}>👋</div>
                    <div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#854D0E", marginBottom: "4px" }}>Complete your profile</h4>
                      <p style={{ fontSize: "0.85rem", color: "#A16207", lineHeight: 1.4 }}>Add your details to help us personalize your delivery experience.</p>
                      <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", color: "#854D0E", fontWeight: 800, fontSize: "0.85rem", marginTop: "8px", cursor: "pointer", textDecoration: "underline" }}>Edit Profile</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="animate-fade-up">
            {fetchingOrders ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-muted)" }}>
                <div className="animate-spin" style={{ display: "inline-block", border: "3px solid rgba(1,53,251,0.2)", borderTopColor: "var(--primary)", borderRadius: "50%", width: "30px", height: "30px", marginBottom: "16px" }} />
                <p style={{ fontWeight: 600 }}>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="otw-card" style={{ padding: "60px 20px", textAlign: "center", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}>
                <div style={{ fontSize: "4rem", marginBottom: "16px" }}>✦</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "8px", color: "#F4F4F2" }}>No orders yet</h3>
                <p style={{ color: "#A8A8A4", marginBottom: "24px" }}>Your next drop is waiting.</p>
                <Link href="/menu" className="otw-btn otw-btn-primary" style={{ padding: "12px 24px", borderRadius: "99px" }}>Browse Drops</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {orders.map(order => (
                  <div key={order.id} className="otw-card" style={{ padding: "20px", transition: "transform 0.2s", cursor: "pointer", background: "#0F0F0F", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }} onClick={() => router.push(`/track/${order.id}`)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F4F4F2" }}>Order #{order.id.slice(-6).toUpperCase()}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#A8A8A4" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14}/> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#F4F4F2" }}>
                        ₹{order.total.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "#C9C9C5", fontWeight: 500, marginBottom: "16px" }}>
                      {order.items.map(i => `${i.quantity}x ${i.item.name}`).join(", ")}
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Link href={`/track/${order.id}`} className="otw-btn otw-btn-outline otw-btn-sm" style={{ borderRadius: "10px" }} onClick={e => e.stopPropagation()}>
                        View Details <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
