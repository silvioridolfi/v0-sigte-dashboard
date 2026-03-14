"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Calendar, Home, Search, Users, BarChart3, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { shouldShowReunionesModule } from "@/lib/utils/permisos"

export function SigteNav() {
  const pathname = usePathname()
  const { activeUser } = useActiveUser()

  const baseNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Calendario",
      href: "/calendario",
      icon: Calendar,
    },
    {
      title: "Establecimientos",
      href: "/establecimientos",
      icon: Search,
    },
    {
      title: "Reuniones",
      href: "/reuniones",
      icon: Users,
      requirePermission: (user: any) => shouldShowReunionesModule(user),
    },
    {
      title: "Métricas",
      href: "/metricas",
      icon: BarChart3,
    },
    {
      title: "Herramientas",
      href: "/herramientas",
      icon: Wrench,
    },
  ]

  // Filter items based on permissions
  const navItems = baseNavItems.filter((item) => {
    if (item.requirePermission) {
      return item.requirePermission(activeUser)
    }
    return true
  })

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-gradient-to-r from-[#417099] to-[#00AEC3] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
