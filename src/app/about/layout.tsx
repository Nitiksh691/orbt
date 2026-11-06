import { COMPANY_NAME } from "@/lib/company";

export const metadata = {
  title: `About Us | ${COMPANY_NAME}`,
  description: "Learn about ORBT — an independent fashion label shipping contemporary clothing across India.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
