import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Flidio – AI-Powered Travel Planner",
  description:
    "Plan smarter adventures with Flidio. Generate personalized itineraries, manage trips, and unlock premium features with Pro subscriptions.",
  keywords: [
    "travel planner",
    "AI itinerary",
    "Flidio",
    "travel app",
    "trip planning",
    "revenuecat subscription"
  ],
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Flidio – AI-Powered Travel Planner",
    description:
      "Generate bespoke itineraries in seconds, manage trips, and unlock premium travel insights with Flidio Pro.",
    url: "https://example.com",
    siteName: "Flidio",
    images: [
      {
        url: "/screenshots/screen-1.svg",
        width: 1200,
        height: 630,
        alt: "Flidio mobile app preview"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Flidio – AI-Powered Travel Planner",
    description: "Create smarter itineraries with AI and manage your travels in one place.",
    images: ["/screenshots/screen-1.svg"],
    creator: "@flidioapp"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
