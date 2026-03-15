"use client"

import { useState, useEffect } from "react"
import { logoutAction } from "@/app/actions/auth"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut, User, ChevronDown, ShieldAlert } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Usuario } from "@/lib/types/database"

export function UserMenu() {
  // sessionUser = usuario real autenticado (siempre ADMIN en tu caso)
  // activeUser = usuario activo para impersonación (puede ser FED/CED)
  const { activeUser, sessionUser, setActiveUser, isLoading } = useActiveUser()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const isAdmin = sessionUser?.rol === "ADMIN"
  const isImpersonating = isAdmin && activeUser?.id !== sessionUser?.id

  // Cargar lista de usuarios para impersonar — solo si es ADMIN
  useEffect(() => {
    if (!isAdmin) return
    const supabase = createClient()
    supabase
      .from("usuarios")
      .select("id, nombre, email, rol, distrito, genero")
      .neq("rol", "ADMIN")
      .order("nombre")
      .then(({ data }: { data: Usuario[] | null }) => {
        if (data) setUsuarios(data)
      })
  }, [isAdmin])

  const handleLogout = async () => {
    setActiveUser(null)
    await logoutAction()
  }

  const handleImpersonate = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId)
    if (user) setActiveUser(user)
  }

  const handleRestoreAdmin = () => {
    if (sessionUser) setActiveUser(sessionUser)
  }

  if (isLoading) {
    return <Skeleton className="h-9 w-40 bg-white/20" />
  }

  if (!activeUser) {
    return (
      <Button asChild size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30 border">
        <Link href="/login">Iniciar sesión</Link>
      </Button>
    )
  }

  const rolLabel =
    activeUser.rol === "CED" ? "Coordinador" :
    activeUser.rol === "ADMIN" ? "Admin" : "Facilitador"

  return (
    <div className="flex items-center gap-3">
      {/* Selector de impersonación — solo visible para ADMIN */}
      {isAdmin && usuarios.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-amber-300 border-amber-300/60 gap-1 hidden sm:flex bg-white/10">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
          <Select onValueChange={handleImpersonate}>
            <SelectTrigger className="w-[190px] h-8 text-xs bg-white/10 border-white/30 text-white focus:ring-white/50">
              <SelectValue placeholder="Probar como…" />
            </SelectTrigger>
            <SelectContent>
              {usuarios.map((u) => (
                <SelectItem key={u.id} value={u.id} className="text-xs">
                  {u.nombre} · {u.rol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Menú del usuario activo */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 max-w-[220px] bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
            <User className="h-4 w-4 text-white/80 shrink-0" />
            <span className="truncate text-sm font-medium">
              {isImpersonating ? `↗ ${activeUser.nombre}` : activeUser.nombre}
            </span>
            <ChevronDown className="h-3 w-3 shrink-0 text-white/60" />
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
              {isImpersonating && (
                <p className="text-xs text-amber-600 font-medium">
                  Sesión real: {sessionUser?.nombre}
                </p>
              )}
            </div>
          </DropdownMenuLabel>

          {/* Volver a admin si está impersonando */}
          {isImpersonating && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleRestoreAdmin}
                className="text-xs text-amber-600 cursor-pointer"
              >
                <ShieldAlert className="h-3 w-3 mr-2" />
                Volver a mi perfil Admin
              </DropdownMenuItem>
            </>
          )}

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
    </div>
  )
}
