import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | ORBT — Apparel, denim & accessories",
  description:
    "Shop the ORBT collection. Contemporary clothing, denim, dresses, and accessories with pan-India shipping.",
  keywords: [
    "orbt shop",
    "orbt clothing",
    "buy clothes online india",
    "womens wear",
    "mens wear",
  ],
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Shop | ORBT",
    description: "Browse the latest ORBT drop and ship nationwide.",
    url: "/menu",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
