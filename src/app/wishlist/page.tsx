"use client";
import { useApp } from "@/lib/context";
import useSWR from "swr";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { MenuItem } from "@/lib/types";
import FoodCard from "@/components/FoodCard";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function WishlistPage() {
  const { wishlist, cart, addToCart, updateQuantity } = useApp();
  const { data: menu = [], isLoading } = useSWR<MenuItem[]>("/api/menu", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const wishlistItems = menu.filter(item => wishlist.includes(item.id));

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      {/* Page header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "32px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#F4F4F2", textTransform: "uppercase", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 10 }}>
          <Heart size={22} color="#F4F4F2" /> Wishlist
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#A8A8A4", fontWeight: 600, marginTop: 4 }}>
          {wishlistItems.length} saved {wishlistItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: "#0F0F0F", borderRadius: 4, aspectRatio: "0.85", border: "1px solid rgba(255,255,255,0.1)", opacity: 0.6 }} />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 20, textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#171717", border: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={36} color="#A8A8A4" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F4F4F2", marginBottom: 8 }}>Your wishlist is empty</h2>
              <p style={{ fontSize: "0.9rem", color: "#A8A8A4", fontWeight: 600 }}>Save your favourite pieces for the next drop</p>
            </div>
            <Link href="/menu" style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px",
              background: "#F4F4F2", color: "#0A0A0A", textDecoration: "none",
              borderRadius: 99, fontWeight: 800, fontSize: "0.9rem"
            }}>
              <ShoppingBag size={16} /> Browse Drops
            </Link>
          </div>
        ) : (
          <div className="kl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {wishlistItems.map(item => (
              <FoodCard key={item.id} item={item} cartItem={cart.find(c => c.item.id === item.id)} onAdd={addToCart} onUpdateQuantity={updateQuantity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
