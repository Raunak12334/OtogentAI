import type { Metadata } from "next";
import { LandingBenefits } from "@/features/landing/components/landing-benefits";
import { LandingCTA } from "@/features/landing/components/landing-cta";
import { LandingFAQ } from "@/features/landing/components/landing-faq";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHero } from "@/features/landing/components/landing-hero";

export const metadata: Metadata = {
  title: "Otogent AI - Launchpad for Startups",
  description:
    "Let your startup get off the ground. Build, code, and scale a one-person billion-dollar company with autonomous AI agents.",
  openGraph: {
    title: "Otogent AI - Launchpad for Startups",
    description:
      "Autonomous AI launchpad for solo founders and engineering teams.",
    type: "website",
    siteName: "Otogent AI",
    images: [
      {
        url: "/og-image.png",
        secureUrl: "/og-image.png",
        width: 1024,
        height: 1024,
        type: "image/png",
        alt: "Otogent AI - Launchpad for Startups",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Otogent AI - Launchpad for Startups",
    description:
      "Autonomous AI launchpad for solo founders and engineering teams.",
    images: ["/og-image.png"],
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
