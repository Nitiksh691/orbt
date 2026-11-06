"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Heart, Share2, Minus, Plus, ChevronRight, Check } from "lucide-react";
import { useApp } from "@/lib/context";
import { MenuItem } from "@/lib/types";
import toast from "react-hot-toast";
import FoodCard from "@/components/FoodCard";
import Footer from "@/components/Footer";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { getColorOptions, getDefaultSize, getSizeOptions } from "@/lib/sizes";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ItemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<{ name: string, price: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");

  const { data: rawMenu, isLoading } = useSWR<MenuItem[]>("/api/menu", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const menu = Array.isArray(rawMenu) ? rawMenu : [];

  const item = useMemo(() => menu.find(m => m.id === id), [menu, id]);

  const cartItem = useMemo(() => cart.find(c => c.item.id === item?.id), [cart, item]);
  const relatedItems = useMemo(() => {
    if (!item) return [];
    return menu.filter(m => m.category === item.category && m.id !== item.id).slice(0, 6);
  }, [menu, item]);

  const handleAddToCart = () => {
    if (!item) return;
    if (item.isLaunchingSoon) {
      toast("🚀 This item is launching soon! Ordering is not available yet.", { icon: "✨" });
      return;
    }
    const size = selectedSize || getDefaultSize(item);
    const price = size ? size.price : item.price;
    const customizations = [
      ...(size ? [{ category: "Size", option: size.name, price: 0 }] : []),
      ...(selectedColor ? [{ category: "Colour", option: selectedColor, price: 0 }] : []),
    ];

    addToCart(item, "", customizations, price);
    toast.success("Added to bag");
  };

  if (isLoading || !item) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-pulse" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", border: "2px solid #1C1C1C", borderTopColor: "#F4F4F2", animation: "spin 1s linear infinite" }} />
          <div style={{ color: "#9A9A96", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>Loading</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sizeOptions = getSizeOptions(item);
  const colorOptions = getColorOptions(item);
  const effectiveColor = selectedColor || colorOptions[0]?.name || null;
  const effectiveSize = selectedSize || getDefaultSize(item);
  const currentPrice = effectiveSize ? effectiveSize.price : item.price;
  const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
  const discountPct = hasDiscount ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100) : 0;
  const isWishlisted = wishlist?.includes(item.id);

  const images = [item.image, item.image, item.image];

  const highlights = [
    { label: "Brand", value: "ORBT" },
    { label: "Category", value: item.category },
    ...(item.details || [])
  ];

  return (
    <div className="kl-page" style={{ minHeight: "100vh", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <style>{`
        .item-page-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 32px 80px;
          font-family: 'Inter', sans-serif;
        }
        .item-grid {
          display: grid;
          grid-template-columns: 50% 50%;
          gap: 56px;
          align-items: start;
        }

        /* --- LEFT COLUMN (Gallery) --- */
        .left-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 40px;
        }
        .gallery-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          width: 100%;
        }
        .main-image-box {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1 / 1;
          border-radius: 28px;
          position: relative;
          background: #FFFFFF;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
        }
        .thumbs-col {
          display: flex;
          flex-direction: row;
          justify-content: center;
          gap: 16px;
          width: 100%;
        }
        .thumb-box {
          width: 72px; height: 72px;
          position: relative;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; justify-content: center;
          background: #fff;
          overflow: hidden;
          opacity: 0.5;
          border: 2px solid transparent;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .thumb-box:hover { opacity: 0.8; transform: translateY(-2px); }
        .thumb-box.active { opacity: 1; border-color: #F4F4F2; box-shadow: 0 8px 24px rgba(255,255,255,0.2); }

        /* --- DESKTOP ACTIONS --- */
        .desktop-actions-wrap {
          display: flex; gap: 16px;
          margin-bottom: 32px;
          margin-top: 16px;
        }
        .btn-desktop-cta {
          flex: 1;
          background: linear-gradient(135deg, #F4F4F2, #2A55FF);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 18px 24px;
          font-size: 1.1rem;
          font-weight: 800;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 8px 24px rgba(255,255,255,0.18);
          letter-spacing: 0.5px;
        }
        .btn-desktop-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(1,53,251,0.35); }
        .btn-desktop-cta:active { transform: translateY(0); }
        .btn-desktop-cta.checkout { background: #10B981; box-shadow: 0 8px 24px rgba(16,185,129,0.25); }
        .btn-desktop-cta.checkout:hover { background: #059669; }
        
        .qty-control-desktop {
          display: flex; align-items: center;
          background: #F1F5F9;
          border-radius: 16px;
          padding: 4px;
          border: 1px solid #E2E8F0;
        }
        .qty-btn-desk { 
          width: 48px; height: 48px; 
          display: flex; align-items: center; justify-content: center; 
          background: #FFFFFF; border: none; border-radius: 12px;
          cursor: pointer; color: #0F172A; 
          transition: 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .qty-btn-desk:hover { background: #F8FAFC; color: #F4F4F2; }
        .qty-val-desk { width: 44px; text-align: center; font-weight: 900; font-size: 1.2rem; color: #0F172A; }
        
        .icon-btn-desk {
          width: 56px; height: 56px; border: 1px solid #E2E8F0; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          background: #fff; cursor: pointer; color: #64748B; transition: all 0.25s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .icon-btn-desk:hover { background: #F8FAFC; color: #0F172A; border-color: #CBD5E1; transform: translateY(-2px); }
        .icon-btn-desk.wishlisted { color: #ef4444; border-color: #ef4444; background: #FEF2F2; }

        /* --- RIGHT COLUMN (Details) --- */
        .details-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        /* Cards */
        .premium-card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.01);
          border: 1px solid rgba(0,0,0,0.02);
        }
        
        /* Product Header */
        .brand-link {
          font-size: 0.85rem; color: #64748B; font-weight: 700;
          display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
          letter-spacing: 1px; text-transform: uppercase;
        }
        .product-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.4rem; font-weight: 900; color: #0F172A;
          margin: 0 0 16px 0; line-height: 1.1; letter-spacing: -0.03em;
        }

        /* Pricing */
        .price-wrap { 
          display: flex; flex-direction: column; gap: 8px;
          padding-bottom: 24px; border-bottom: 1px solid #F1F5F9;
        }
        .price-row {
          display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap;
        }
        .current-price {
          font-size: 2.5rem; font-weight: 900; color: #F4F4F2; letter-spacing: -1px; line-height: 1;
        }
        .mrp-wrap {
          display: flex; align-items: center; gap: 12px;
        }
        .price-mrp-val { 
          font-size: 1.2rem; color: #94A3B8; font-weight: 600; text-decoration: line-through; 
        }
        .savings-badge { 
          background: #DCFCE7; color: #16A34A; padding: 6px 12px; border-radius: 8px; 
          font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .tax-incl { font-size: 0.85rem; color: #94A3B8; font-weight: 500; }

        /* Customizations */
        .custom-group { margin-top: 28px; }
        .custom-label {
          font-size: 0.85rem; font-weight: 800; color: #475569;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }
        .pill-grid { display: flex; flex-wrap: wrap; gap: 12px; }
        .custom-pill {
          padding: 14px 20px; border: 2px solid #E2E8F0; border-radius: 16px;
          font-size: 0.95rem; font-weight: 700; color: #475569; background: #fff;
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .custom-pill.active { 
          border-color: #F4F4F2; background: #EEF1FF; color: #F4F4F2; 
        }
        .custom-pill.active::after {
          content: ''; position: absolute; inset: 0; 
          box-shadow: inset 0 0 0 1px #F4F4F2; border-radius: 14px; pointer-events: none;
        }
        .custom-pill:hover:not(.active) { 
          border-color: #CBD5E1; background: #F8FAFC; transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        /* --- BOTTOM TABS --- */
        .tabs-container {
          margin-top: 40px;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          overflow: hidden;
          background: #FFFFFF;
        }
        .tabs-header {
          display: flex; background: #F8FAFC; border-bottom: 1px solid #E2E8F0;
        }
        .tab-btn {
          flex: 1; padding: 16px; text-align: center;
          font-size: 0.95rem; font-weight: 800; color: #64748B;
          border: none; background: transparent; cursor: pointer;
          text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s;
        }
        .tab-btn.active { color: #F4F4F2; background: #FFFFFF; box-shadow: inset 0 -2px 0 #F4F4F2; }
        .tab-content { padding: 32px; font-size: 1.05rem; color: #475569; line-height: 1.6; min-height: 120px; }


        /* Related Items */
        .related-section { padding-top: 64px; }
        .related-header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; }
        .related-title { font-family: 'Outfit', sans-serif; font-size: 2rem; font-weight: 900; color: #0F172A; letter-spacing: -0.03em; }
        .reco-scroll { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; padding-bottom: 24px; margin: 0 -32px; padding-left: 32px; padding-right: 32px; }
        .reco-scroll::-webkit-scrollbar { display: none; }
        .reco-item { width: 240px; flex-shrink: 0; }

        /* Mobile specific fixes */
        .mobile-only { display: none !important; }
        .mobile-sticky-bar { display: none; }

        @media (max-width: 900px) {
          .item-grid { grid-template-columns: 1fr; gap: 24px; }
          .item-page-wrap { padding: 0 0 120px 0; }
          .desktop-only { display: none !important; }
          .mobile-only { display: flex !important; }
          
          .left-col { position: relative; top: 0; gap: 0; }
          .gallery-wrap { gap: 0; }
          
          /* Remove thumbnails completely on mobile */
          .thumbs-col { display: none !important; }
          
          .main-image-box { 
            border-radius: 0 0 32px 32px; 
            max-width: 100%;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            background: #F1F5F9;
          }
          
          .details-col { padding: 0 20px; margin-top: 24px; }
          .premium-card { padding: 24px; border-radius: 24px; }
          
          .product-title { font-size: 2rem; }
          .current-price { font-size: 2.2rem; }
          
          /* MOBILE STICKY BAR */
          .mobile-sticky-bar {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(20px);
            padding: 16px 20px; padding-bottom: max(16px, env(safe-area-inset-bottom));
            border-top: 1px solid rgba(0,0,0,0.05); z-index: 960; gap: 12px; align-items: center;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.08);
          }
          
          .reco-scroll { margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
          
          /* Mobile top nav overlay */
          .mobile-top-nav {
            position: absolute; top: 16px; left: 16px; right: 16px; z-index: 10;
            display: flex; justify-content: space-between;
          }
          .mobile-nav-btn {
            width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.95);
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: none; color: #0F172A;
            backdrop-filter: blur(10px);
          }
        }

        /* ORBT dark editorial overrides */
        .main-image-box { background:#111111; border-radius:4px; aspect-ratio:3/4; box-shadow:none; }
        .thumb-box { background:#111111; border-radius:2px; box-shadow:none; border-color:transparent; }
        .thumb-box.active { border-color:#F4F4F2; box-shadow:none; }
        .btn-desktop-cta {
          background:#F4F4F2; color:#0A0A0A; border-radius:99px; padding:18px 24px;
          font-size:0.68rem; font-weight:800; letter-spacing:0.16em; text-transform:uppercase;
          box-shadow:none;
        }
        .btn-desktop-cta:hover { transform:translateY(-2px); box-shadow:none; background:#fff; }
        .btn-desktop-cta.checkout { background:transparent; color:#F4F4F2; border:1px solid rgba(255,255,255,0.2); box-shadow:none; }
        .btn-desktop-cta.checkout:hover { background:rgba(255,255,255,0.08); }
        .qty-control-desktop { background:#141414; border:1px solid rgba(255,255,255,0.14); border-radius:99px; }
        .qty-btn-desk { background:#1C1C1C; color:#F4F4F2; border-radius:50%; box-shadow:none; }
        .qty-btn-desk:hover { background:#2A2A2A; color:#fff; }
        .qty-val-desk { color:#F4F4F2; }
        .icon-btn-desk { background:transparent; border:1px solid rgba(255,255,255,0.14); color:#C9C9C5; border-radius:50%; box-shadow:none; }
        .icon-btn-desk:hover { background:rgba(255,255,255,0.06); color:#fff; border-color:rgba(255,255,255,0.35); }
        .icon-btn-desk.wishlisted { color:#F4F4F2; border-color:#F4F4F2; background:rgba(255,255,255,0.08); }
        .premium-card { background:#0F0F0F; border:1px solid rgba(255,255,255,0.08); border-radius:4px; box-shadow:none; }
        .brand-link { color:#8A8A86; }
        .product-title { color:#F4F4F2; font-size:clamp(1.7rem,3.4vw,2.4rem); }
        .price-wrap { border-bottom:1px solid rgba(255,255,255,0.1); }
        .current-price { color:#F4F4F2; font-weight:800; }
        .price-mrp-val { color:#6E6E6A; }
        .savings-badge { background:rgba(255,255,255,0.08); color:#F4F4F2; border-radius:99px; }
        .tax-incl { color:#8A8A86; }
        .custom-label { color:#8A8A86; }
        .color-grid { display:flex; flex-wrap:wrap; gap:10px; }
        .color-swatch {
          width:36px; height:36px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          border:1px solid rgba(255,255,255,0.22);
          color:#F4F4F2; cursor:pointer; padding:0;
          box-shadow:inset 0 0 0 1px rgba(0,0,0,0.18);
          transition:transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .color-swatch:hover { transform:translateY(-2px); }
        .color-swatch.active { border-color:#F4F4F2; box-shadow:0 0 0 2px #0F0F0F, 0 0 0 4px #F4F4F2; }
        .size-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px; }
        .size-head .custom-label { margin-bottom:0; }
        .size-guide { font-size:0.6rem; letter-spacing:0.1em; text-transform:uppercase; color:#6E6E6A; font-weight:600; }
        .custom-pill {
          border:1px solid rgba(255,255,255,0.16); color:#C9C9C5; background:transparent;
          border-radius:99px; padding:12px 20px; font-size:0.66rem; letter-spacing:0.14em;
          text-transform:uppercase; font-weight:700;
        }
        .custom-pill.active { border-color:#F4F4F2; background:#F4F4F2; color:#0A0A0A; }
        .custom-pill.active::after { display:none; }
        .custom-pill:hover:not(.active) { border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.05); box-shadow:none; }
        .tabs-container { background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:4px; }
        .tabs-header { background:transparent; border-bottom:1px solid rgba(255,255,255,0.1); }
        .tab-btn { color:#8A8A86; font-size:0.62rem; letter-spacing:0.16em; }
        .tab-btn.active { color:#F4F4F2; background:transparent; box-shadow:inset 0 -1px 0 #F4F4F2; }
        .tab-content { color:#B8B8B4; }
        .related-title { color:#F4F4F2; font-size:1.5rem; text-transform:uppercase; }
        @media (max-width:900px) {
          .main-image-box { background:#111111; border-radius:0; aspect-ratio:1/1; box-shadow:none; }
          .mobile-sticky-bar { background:rgba(8,8,8,0.97); border-top:1px solid rgba(255,255,255,0.12); box-shadow:0 -10px 40px rgba(0,0,0,0.5); }
          .mobile-nav-btn { background:rgba(8,8,8,0.78); border:1px solid rgba(255,255,255,0.16); color:#F4F4F2; box-shadow:none; }
        }
      `}</style>

      <div className="item-page-wrap">

        {/* --- LEFT COLUMN: Images --- */}
        <div className="item-grid">
          <div className="left-col">
            <div className="desktop-only" style={{ marginBottom: -12 }}>
              <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#8A8A86", display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#F4F4F2"} onMouseLeave={e => e.currentTarget.style.color = "#8A8A86"}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.16)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ArrowLeft size={15} />
                </div>
                Back to shop
              </button>
            </div>

            <div className="gallery-wrap">
              {/* Mobile overlay navigation over the main image */}
              <div className="mobile-only mobile-top-nav">
                <button className="mobile-nav-btn" onClick={() => router.back()}>
                  <ArrowLeft size={20} />
                </button>
                <button className="mobile-nav-btn" onClick={() => toggleWishlist(item.id)} style={{ color: isWishlisted ? "#F4F4F2" : "#9A9A96" }}>
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="main-image-box">
                {item.isLaunchingSoon && (
                  <div style={{
                    position: "absolute",
                    top: 18,
                    left: 18,
                    background: "#F4F4F2",
                    color: "#0A0A0A",
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontWeight: 800,
                    fontSize: "0.56rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    Coming soon
                  </div>
                )}
                <Image
                  src={getOptimizedImageUrl(images[activeImageIndex], 800)}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  style={{ objectFit: "contain", padding: "20px" }}
                  priority
                  onContextMenu={e => e.preventDefault()}
                  onDragStart={e => e.preventDefault()}
                />
                {!item.available && !item.isLaunchingSoon && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
                    <div style={{ background: "#F4F4F2", color: "#0A0A0A", padding: "12px 24px", borderRadius: 99, fontWeight: 800, letterSpacing: "0.16em", fontSize: "0.66rem", textTransform: "uppercase" }}>Sold out</div>
                  </div>
                )}
              </div>
              <div className="thumbs-col desktop-only">
                {images.map((img, idx) => (
                  <div key={idx} className={`thumb-box ${activeImageIndex === idx ? "active" : ""}`} onClick={() => setActiveImageIndex(idx)}>
                    <Image src={img} alt={`${item.name} thumb`} fill style={{ objectFit: "cover", padding: "8px" }} onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()} />
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* --- RIGHT COLUMN: Info & Customizations --- */}
          <div className="details-col">

            {/* Basic Info Card */}
            <div className="premium-card">
              <div className="brand-link">
                ORBT <ChevronRight size={14} />
              </div>
              <h1 className="product-title">{item.name}</h1>

              <div className="price-wrap">
                <div className="price-row">
                  <div className="current-price">₹{currentPrice}</div>
                  
                  {hasDiscount && (
                    <div className="mrp-wrap">
                      <span className="price-mrp-val">₹{item.originalPrice}</span>
                      <span className="savings-badge">Save ₹{item.originalPrice! - currentPrice} ({discountPct}% OFF)</span>
                    </div>
                  )}
                </div>
                <div className="tax-incl">(Inclusive of all taxes)</div>
              </div>
            </div>

            {/* Colour selector */}
            {colorOptions.length > 0 && (
              <div className="premium-card">
                <div className="custom-group" style={{ marginTop: 0 }}>
                  <div className="size-head">
                    <div className="custom-label">Select colour</div>
                    <span className="size-guide">{effectiveColor}</span>
                  </div>
                  <div className="color-grid">
                    {colorOptions.map((color) => {
                      const isActive = effectiveColor === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          className={`color-swatch${isActive ? " active" : ""}`}
                          style={{ background: color.hex }}
                          aria-label={`Select ${color.name}`}
                          title={color.name}
                        >
                          {isActive && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizeOptions.length > 0 && (
              <div className="premium-card">
                <div className="custom-group" style={{ marginTop: 0 }}>
                  <div className="size-head">
                    <div className="custom-label">Select size</div>
                    <span className="size-guide">True to size · Model wears M</span>
                  </div>
                  <div className="pill-grid">
                    {sizeOptions.map((size) => {
                      const isActive = effectiveSize?.name === size.name;
                      return (
                        <button
                          key={size.name}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`custom-pill ${isActive ? "active" : ""}`}
                        >
                          {isActive && <Check size={14} />}
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Actions */}
            <div className="desktop-actions-wrap desktop-only">
              {item.isLaunchingSoon ? (
                <button
                  className="btn-desktop-cta"
                  disabled
                  style={{
                    background: "transparent",
                    color: "#F4F4F2",
                    border: "1px solid rgba(255,255,255,0.2)",
                    opacity: 0.9,
                    cursor: "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontWeight: 800
                  }}
                >
                  Coming soon
                </button>
              ) : cartItem ? (
                <>
                  <div className="qty-control-desktop">
                    <button className="qty-btn-desk" onClick={() => updateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity - 1)}><Minus size={20} strokeWidth={3} /></button>
                    <div className="qty-val-desk">{cartItem.quantity}</div>
                    <button className="qty-btn-desk" onClick={() => updateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity + 1)}><Plus size={20} strokeWidth={3} /></button>
                  </div>
                  <button className="btn-desktop-cta checkout" onClick={() => router.push("/cart")}>
                    <ShoppingCart size={20} /> Go to bag (₹{currentPrice * cartItem.quantity})
                  </button>
                </>
              ) : (
                <button
                  className="btn-desktop-cta"
                  onClick={handleAddToCart}
                  disabled={!item.available}
                  style={{ opacity: !item.available ? 0.6 : 1, cursor: !item.available ? "not-allowed" : "pointer" }}
                >
                  <ShoppingCart size={20} /> {item.available ? `Add to bag — ₹${currentPrice}` : "Sold out"}
                </button>
              )}
              
              <button className={`icon-btn-desk ${isWishlisted ? 'wishlisted' : ''}`} onClick={() => toggleWishlist(item.id)}>
                <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
              <button className="icon-btn-desk" onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: item.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                }
              }}>
                <Share2 size={22} />
              </button>
            </div>

            {/* TABS (Description / Details) */}
            <div className="tabs-container">
              <div className="tabs-header">
                <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
                <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
              </div>
              <div className="tab-content">
                {activeTab === 'description' && (
                  <p>{item.description || "A considered everyday piece from the ORBT collection. Cut from premium fabric with a relaxed, modern fit."}</p>
                )}
                {activeTab === 'details' && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 20, borderBottom: i < highlights.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", paddingBottom: i < highlights.length - 1 ? 16 : 0 }}>
                        <span style={{ color: "#8A8A86", fontWeight: 600 }}>{h.label}</span>
                        <span style={{ color: "#F4F4F2", fontWeight: 700, textAlign: "right" }}>{h.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* --- RELATED ITEMS --- */}
        {relatedItems.length > 0 && (
          <div className="related-section">
            <div className="related-header">
              <h2 className="related-title">You May Also Like</h2>
            </div>
            <div className="reco-scroll">
              {relatedItems.map(m => (
                <div key={m.id} className="reco-item">
                  <FoodCard item={m} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MOBILE STICKY BOTTOM BAR (Cart + Quantity + Wishlist) --- */}
      <div className="mobile-sticky-bar mobile-only">
        {item.isLaunchingSoon ? (
          <button
            className="btn-desktop-cta"
            disabled
            style={{
              margin: 0, padding: 0, height: 52, flex: 1, borderRadius: 99,
              fontSize: "0.64rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase",
              background: "transparent", color: "#F4F4F2", border: "1px solid rgba(255,255,255,0.2)",
              cursor: "not-allowed", opacity: 0.9,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6
            }}
          >
            Coming soon
          </button>
        ) : cartItem ? (
          <>
            <div className="qty-control-desktop" style={{ flexShrink: 0, padding: 4, height: 52 }}>
              <button className="qty-btn-desk" style={{ width: 44, height: 44 }} onClick={() => updateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity - 1)}><Minus size={18} strokeWidth={3} /></button>
              <div className="qty-val-desk" style={{ width: 36, fontSize: "1.1rem" }}>{cartItem.quantity}</div>
              <button className="qty-btn-desk" style={{ width: 44, height: 44 }} onClick={() => updateQuantity(cartItem.cartItemId || cartItem.item.id, cartItem.quantity + 1)}><Plus size={18} strokeWidth={3} /></button>
            </div>
            <button className="btn-desktop-cta checkout" style={{ margin: 0, padding: 0, height: 52, flex: 1, borderRadius: 99 }} onClick={() => router.push("/cart")}>
              Go to bag
            </button>
          </>
        ) : (
          <button
            className="btn-desktop-cta"
            onClick={handleAddToCart}
            disabled={!item.available}
            style={{ margin: 0, padding: 0, height: 52, flex: 1, borderRadius: 99, opacity: !item.available ? 0.6 : 1 }}
          >
            {item.available ? `Add to bag · ₹${currentPrice}` : "Sold out"}
          </button>
        )}
        
        {/* Wishlist button on mobile sticky bar */}
        <button 
          onClick={() => toggleWishlist(item.id)}
          style={{
            width: 52, height: 52, flexShrink: 0, borderRadius: "50%",
            border: `1px solid ${isWishlisted ? '#F4F4F2' : 'rgba(255,255,255,0.18)'}`,
            background: isWishlisted ? 'rgba(255,255,255,0.1)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isWishlisted ? '#F4F4F2' : '#8A8A86', transition: '0.2s'
          }}
        >
          <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <Footer />
    </div>
  );
}
