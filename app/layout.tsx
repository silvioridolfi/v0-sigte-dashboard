import type React from "react"
import type { Metadata } from "next"
import { Encode_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ActiveUserProvider } from "@/components/providers/active-user-provider"
import { SigteHeader } from "@/components/sigte-header"
import { SigteNav } from "@/components/sigte-nav"
import { GlobalAlert } from "@/components/notificaciones/global-alert"
import "./globals.css"

const encodeSans = Encode_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-encode-sans",
})

export const metadata: Metadata = {
  title: "SIGTE - Sistema Integral de Gestión Territorial Educativa",
  description: "Dashboard interno para equipos territoriales de la DTE",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${encodeSans.variable} font-sans antialiased`}>
        <ActiveUserProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
            <SigteHeader />
            <SigteNav />
            <GlobalAlert />
            <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
          </div>
          <Toaster />
        </ActiveUserProvider>
        <Analytics />
      </body>
    </html>
  )
}
