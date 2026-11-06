import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions — ORBT",
  description: "Terms & Conditions for ORBT.",
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      lastUpdated="November 3, 2026"
      sections={[
        {
          heading: "1. About Us",
          content: `ORBT sells clothing and accessories online and ships across India. Using the site constitutes acceptance of these terms.`,
        },
        {
          heading: "2. Orders & Availability",
          content: `All orders are subject to stock. We may modify or cancel an order due to inventory, pricing errors, or operational constraints.`,
        },
        {
          heading: "3. Payments",
          content: `Prices are in INR. Payments are processed securely via Razorpay. We do not store your card or UPI credentials.`,
        },
        {
          heading: "4. Liability",
          content: `Fraudulent use leads to account termination. We are not liable for courier delays or indirect losses beyond our control.`,
        }
      ]}
    />
  );
}
