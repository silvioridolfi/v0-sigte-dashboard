"use client"

import { usePathname } from "next/navigation"
import { SigteHeader } from "@/components/sigte-header"
import { SigteNav } from "@/components/sigte-nav"
import { GlobalAlert } from "@/components/notificaciones/global-alert"

const AUTH_ROUTES = ["/login"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SigteHeader />
      <SigteNav />
      <GlobalAlert />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
