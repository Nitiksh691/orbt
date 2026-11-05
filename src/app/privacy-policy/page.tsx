import type { Metadata } from "next";
import PolicyLayout from "@/components/PolicyLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — KLOYH",
  description: "Privacy Policy for KLOYH.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      lastUpdated="November 3, 2026"
      sections={[
        {
          heading: "1. Information Collection",
          content: `We collect name, phone, and shipping address (including PIN code) so we can fulfil fashion orders and reach you about delivery.`,
        },
        {
          heading: "2. Data Usage",
          content: `Your data is used for checkout, shipping, returns, and service improvements. We do not sell personal data.`,
        },
        {
          heading: "3. Data Sharing",
          content: `We share only what is required with payment processors and courier partners to complete your order.`,
        },
        {
          heading: "4. Security",
          content: `We use industry-standard protocols to protect account and order information.`,
        }
      ]}
    />
  );
}
