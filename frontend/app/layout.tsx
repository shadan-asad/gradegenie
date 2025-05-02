"use client"

import type React from "react"
import { Inter, Onest } from "next/font/google"
import "./globals.css"
import { Providers } from "@/app/providers"

// Load Onest font for headings
const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
})

// Load Inter font for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${onest.variable} ${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
