import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | KLOYH — Apparel, denim & accessories",
  description:
    "Shop the KLOYH collection. Contemporary clothing, denim, dresses, and accessories with pan-India shipping.",
  keywords: [
    "kloyh shop",
    "kloyh clothing",
    "buy clothes online india",
    "womens wear",
    "mens wear",
  ],
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Shop | KLOYH",
    description: "Browse the latest KLOYH drop and ship nationwide.",
    url: "/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
