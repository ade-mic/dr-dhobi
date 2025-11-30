import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/PwaProvider";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dr Dhobi | Bangalore's Progressive Laundry Service",
  description:
    "Book premium washing, dry cleaning, and express pickups anywhere in Bangalore with Dr Dhobi's doorstep laundry experts.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://dr-dhobi.example"),
  themeColor: "#0d3b66",
  applicationName: "Dr Dhobi",
  openGraph: {
    title: "Dr Dhobi Laundry | Book Pickup in Minutes",
    description:
      "Doorstep pickup, eco washing, and express drying for every Bangalore neighborhood.",
    url: "https://dr-dhobi.example",
    siteName: "Dr Dhobi Laundry",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dr Dhobi Laundry",
    description: "Book washing, dry cleaning, and ironing with doorstep pickup in Bangalore.",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d3b66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navigation />
        {children}
        <Footer />
        <PwaProvider />
      </body>
    </html>
  );
}
