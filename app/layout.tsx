import type React from "react"
import type { Metadata } from "next"
import { Inter, Spectral } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-spectral",
})

export const metadata: Metadata = {
  title: "Horizon Optical | Premium Eyewear & Vision Care",
  description:
    "Discover curated designer eyewear, bespoke frame styling, and state-of-the-art eye examinations at Horizon Optical.",
  generator: "v0.app",
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spectral.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
