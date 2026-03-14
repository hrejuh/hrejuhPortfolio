import type { Venture } from "@/types";

export const ventures: Venture[] = [
  {
    name: "DosRicke Ventures Pvt Ltd",
    tagline: "Software that puts businesses back in charge",
    description:
      "A registered Bangalore-based SaaS company building products for Indian businesses. Zero-commission philosophy, flat-fee pricing, India-first engineering. Registered under the Companies Act with CIN, TAN, PAN, and professional tax compliance.",
    status: "live",
    url: "https://dosricke.ventures",
    accentColor: "#3730A3",
    type: "company",
    role: "Founder & Managing Director",
    products: ["Qrave", "Coreva", "Trustea"],
  },
  {
    name: "Qrave",
    tagline: "The Shopify for Indian restaurants",
    description:
      "Zero-commission restaurant ordering platform with live driver tracking, kitchen display system, multi-provider delivery, POS, and analytics. Serving 50+ restaurants in Bangalore.",
    status: "live",
    url: "https://qrave.hrejuh.com",
    accentColor: "#F97316",
    type: "product",
    parentCompany: "DosRicke Ventures",
  },
  {
    name: "Coreva",
    tagline: "Modern ERP for Indian businesses",
    description:
      "Multi-tenant ERP with inventory, GST-compliant accounting, HR/payroll, production tracking, and custom workflows. Built for bakery chains and food manufacturing.",
    status: "live",
    accentColor: "#2563EB",
    type: "product",
    parentCompany: "DosRicke Ventures",
  },
  {
    name: "Trustea",
    tagline: "Community management for institutions",
    description:
      "Member management for churches, temples, clubs, and schools. Member directory, event management, donations tracking, and multi-channel communications.",
    status: "building",
    accentColor: "#059669",
    type: "product",
    parentCompany: "DosRicke Ventures",
  },
  {
    name: "Watchalore",
    tagline: "Film screening community",
    description:
      "Community-driven film festival and screening events. Organized Interstellar IMAX screening and Nolan Film Festival with ticketing, seat allocation, and Discord community.",
    status: "live",
    accentColor: "#7C3AED",
    type: "community",
  },
];
