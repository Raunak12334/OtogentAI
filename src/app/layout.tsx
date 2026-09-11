import type { Metadata } from "next";
import { Geist, Geist_Mono, Quattrocento } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Provider } from "jotai";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quattrocento = Quattrocento({
  weight: ["400", "700"],
  variable: "--font-quattrocento",
  subsets: ["latin"],
});

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "https://www.otogent.com";
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: "Otogent AI - Automations & Agent",
  description: "AI Automation & Agents - Business Process Automations",
  openGraph: {
    title: "Otogent AI - Automations & Agent",
    description: "AI Automation & Agents - Business Process Automations",
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
    description: "AI Automation & Agents - Business Process Automations",
    images: ["/og-image.png?v=3"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${quattrocento.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>{children}</Provider>
          </NuqsAdapter>
          <Toaster />
          <SpeedInsights />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
