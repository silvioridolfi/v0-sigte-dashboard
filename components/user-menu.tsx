"use client"

import { useState, useEffect } from "react"
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
  const { activeUser, setActiveUser, isLoading } = useActiveUser()
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])

  // Cargar todos los usuarios solo si es ADMIN (para impersonar)
  useEffect(() => {
    if (activeUser?.rol !== "ADMIN") return
    const supabase = createClient()
    supabase
      .from("usuarios")
      .select("id, nombre, email, rol, distrito, genero")
      .neq("rol", "ADMIN")
      .order("nombre")
      .then(({ data }: { data: Usuario[] | null }) => {
        if (data) setUsuarios(data)
      })
  }, [activeUser?.rol])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleImpersonate = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId)
    if (user) setActiveUser(user)
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

  const isAdmin = activeUser.rol === "ADMIN"
  const rolLabel =
    activeUser.rol === "CED"
      ? "Coordinador"
      : activeUser.rol === "ADMIN"
      ? "Admin"
      : "Facilitador"

  return (
    <div className="flex items-center gap-3">
      {/* Selector de impersonación — solo visible para ADMIN */}
      {isAdmin && usuarios.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-amber-600 border-amber-400 gap-1 hidden sm:flex">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </Badge>
          <Select onValueChange={handleImpersonate}>
            <SelectTrigger className="w-[190px] h-8 text-xs border-amber-300 focus:ring-amber-400">
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

      {/* Menú del usuario logueado */}
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
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Volver al perfil ADMIN real
                  const supabase = createClient()
                  supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { id: string } } | null } }) => {
                    if (session?.user) {
                      supabase
                        .from("usuarios")
                        .select("id, nombre, email, rol, distrito, genero")
                        .eq("id", session.user.id)
                        .single()
                        .then(({ data }: { data: Usuario | null }) => {
                          if (data) setActiveUser(data)
                        })
                    }
                  })
                }}
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
