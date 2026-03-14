"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function UserMenu() {
  const { activeUser, isLoading } = useActiveUser()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-40" />
  }

  if (!activeUser) {
    return (
      <Button asChild size="sm" className="bg-pba-cyan hover:bg-pba-cyan/90">
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    )
  }

  const rolLabel = activeUser.rol === "CED" ? "Coordinador" : activeUser.rol === "ADMIN" ? "Admin" : "Facilitador"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 max-w-[220px]">
          <User className="h-4 w-4 text-pba-cyan shrink-0" />
          <span className="truncate text-sm font-medium">{activeUser.nombre}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{activeUser.nombre}</p>
            <p className="text-xs text-muted-foreground">{activeUser.email}</p>
            <p className="text-xs text-pba-cyan font-medium">
              {rolLabel} · {activeUser.distrito}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
