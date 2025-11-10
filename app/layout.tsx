import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "HitForget - Virtual Embedded Processors",
    template: "%s | HitForget"
  },
  description: "Virtual Arduino, STM32, Raspberry Pi, and ESP32 processors in the cloud. No physical hardware required. Code, test, and deploy embedded applications with AI integration.",
  keywords: [
    "virtual processors",
    "embedded systems",
    "Arduino simulator",
    "STM32 simulator",
    "Raspberry Pi cloud",
    "IoT development",
    "hardware simulation",
    "cloud development",
    "AI embedded",
    "remote hardware"
  ],
  authors: [{ name: "HitForget Team" }],
  creator: "HitForget",
  publisher: "HitForget",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hitforget.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'HitForget - Virtual Embedded Processors',
    description: 'Virtual Arduino, STM32, Raspberry Pi, ESP32 in the cloud. No hardware needed. Code, test, deploy with AI.',
    siteName: 'HitForget',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'HitForget - Virtual Processors Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HitForget - Virtual Embedded Processors',
    description: 'Arduino, STM32, Raspberry Pi in the cloud. No hardware required!',
    images: ['/og-image.svg'],
    creator: '@hitforget',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo.svg', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you have them:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
