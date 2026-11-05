import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — KLOYH",
  description: "Cancellation & Refund Policy for KLOYH.",
};

export default function CancellationRefundPage() {
  return (
    <PolicyLayout
      title="Cancellation & Refund Policy"
      lastUpdated="November 3, 2026"
      sections={[
        {
          heading: "1. Cancellations",
          content: `Orders may be cancelled before they are packed for shipping. Once handed to the courier, cancellations are treated as returns.`,
        },
        {
          heading: "2. Refunds",
          content: `Eligible refunds (wrong item, damaged shipment, or approved returns) are processed to the original payment method within 5–7 business days.`,
        },
        {
          heading: "3. Support",
          content: `Send refund inquiries to nitikshpal@gmail.com with your Order ID.`,
        }
      ]}
    />
  );
}
