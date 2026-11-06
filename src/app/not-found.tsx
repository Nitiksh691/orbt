"use client";
import Link from "next/link";
import { useMenu } from "@/hooks/useMenu";

export default function NotFoundPage() {
  const { menuItems: rawMenuItems } = useMenu();
  const menuItems = rawMenuItems.filter((item) => item.available);
  const categories = Array.from(new Set(menuItems.map((item) => item.category as string))).slice(0, 8);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#F4F4F2",
        fontFamily: "'Outfit', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: "60px 24px 40px", maxWidth: "640px", width: "100%" }}>
        <div style={{ fontSize: "5.5rem", lineHeight: 1, marginBottom: "18px" }}>
          <span style={{ color: "#F4F4F2", fontWeight: 900 }}>4</span>
          <span style={{ display: "inline-block", fontSize: "4.2rem", animation: "bounce404 1.5s ease-in-out infinite" }}>✦</span>
          <span style={{ color: "#F4F4F2", fontWeight: 900 }}>4</span>
        </div>

        <p style={{ margin: "0 0 12px", color: "#9A9A96", fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          // Page not found
        </p>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 900, color: "#F4F4F2", marginBottom: "12px", letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          This page is out of stock.
        </h1>
        <p style={{ color: "#9A9A96", fontSize: "1rem", lineHeight: 1.6, marginBottom: "28px", fontWeight: 500 }}>
          The link may be old or the drop has moved. The full collection is still live.
        </p>
        <Link
          href="/menu"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "13px 28px",
            borderRadius: "99px",
            background: "#F4F4F2",
            color: "#0A0A0A",
            fontWeight: 800,
            textDecoration: "none",
            fontSize: "0.88rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Browse the drops
        </Link>
      </div>

      <div style={{ width: "92%", maxWidth: "860px", padding: "10px 0 70px" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 800, color: "#9A9A96", letterSpacing: "2px", textTransform: "uppercase", textAlign: "center" }}>
          Keep exploring
        </p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#F4F4F2", marginTop: "8px", textAlign: "center", textTransform: "uppercase" }}>
          Shop the collection
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "12px",
            marginTop: "26px",
          }}
        >
          {categories.map((category) => {
            const firstItem = menuItems.find((item) => item.category === category && item.image);
            return (
              <Link
                key={category}
                href={`/menu?category=${encodeURIComponent(category)}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "22px 14px",
                  borderRadius: "4px",
                  background: "#0F0F0F",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textDecoration: "none",
                  minHeight: "128px",
                }}
              >
                {firstItem?.image ? (
                  <img
                    src={firstItem.image}
                    alt={category}
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.24)",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }}>✦</span>
                )}
                <span style={{ fontWeight: 800, fontSize: "0.8rem", color: "#F4F4F2", textTransform: "uppercase", textAlign: "center" }}>
                  {category}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce404 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
