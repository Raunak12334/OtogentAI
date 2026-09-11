import type { Metadata } from "next";
import { LandingBenefits } from "@/features/landing/components/landing-benefits";
import { LandingCTA } from "@/features/landing/components/landing-cta";
import { LandingFAQ } from "@/features/landing/components/landing-faq";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHero } from "@/features/landing/components/landing-hero";

export const metadata: Metadata = {
  title: "Otogent AI - Automations & Agent",
  description:
    "Let your startup get off the ground. Build, code, and scale a one-person billion-dollar company with autonomous AI agents.",
  openGraph: {
    title: "Otogent AI - Automations & Agent",
    description:
      "Autonomous AI launchpad for solo founders and engineering teams.",
    url: "https://www.otogent.com",
    type: "website",
    siteName: "Otogent AI",
    images: [
      {
        url: "/og-image.png?v=3",
        secureUrl: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Otogent AI - Automations & Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Otogent AI - Automations & Agent",
    description:
      "Autonomous AI launchpad for solo founders and engineering teams.",
    images: ["/og-image.png?v=3"],
  },
};

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen scroll-smooth [scroll-padding-top:5.5rem] bg-[#f0f0ee] dark:bg-[#121212]">
      <LandingHero />
      <LandingBenefits />
      <LandingFAQ />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
