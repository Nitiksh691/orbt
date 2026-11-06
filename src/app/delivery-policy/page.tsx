import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Shipping Policy — ORBT",
  description: "Shipping Policy for ORBT.",
};

export default function DeliveryPolicyPage() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      lastUpdated="November 3, 2026"
      sections={[
        {
          heading: "1. Service Area",
          content: `ORBT ships fashion orders across India to a complete residential or office address (house/flat, street, city, state, and 6-digit PIN).`,
        },
        {
          heading: "2. Timelines",
          content: `Standard shipping typically takes 3–5 business days. Express shipping, when selected, is 1–2 business days. Times are estimates and may vary by courier and destination.`,
        },
        {
          heading: "3. Order Issues",
          content: `For missing, damaged, or incorrect items, contact support with your Order ID, photos if relevant, and the shipping address used at checkout.`,
        }
      ]}
    />
  );
}
