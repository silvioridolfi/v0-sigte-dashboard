"use client"

import { useState, useEffect } from "react"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { getSaludo } from "@/lib/utils/saludo"
import type { Usuario } from "@/lib/types/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getUsuarios } from "@/lib/actions/usuarios"

export function UsuarioSelectorClient() {
  const { activeUser, setActiveUser } = useActiveUser()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    getUsuarios().then((data) => {
      const filtered = process.env.NEXT_PUBLIC_SHOW_ADMIN === "true"
        ? data
        : data.filter((u) => u.rol !== "ADMIN")
      setUsuarios(filtered)
      // Si no hay usuario activo, seleccionar el primero
      if (!activeUser && filtered.length > 0) {
        setActiveUser(filtered[0])
      }
    })
  }, [])

  // Durante SSR y primer render del cliente — no renderizar nada
  // para evitar hydration mismatch
  if (!mounted) return null

  if (usuarios.length === 0) {
    return <Skeleton className="h-9 w-[200px] bg-white/20" />
  }

  const handleChange = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId)
    if (user) setActiveUser(user)
  }

  return (
    <div className="flex items-center gap-3">
      {activeUser && (
        <span className="text-sm font-medium text-white hidden sm:inline">
          {getSaludo(activeUser.genero)}, {activeUser.nombre}
        </span>
      )}
      <Select value={activeUser?.id || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px] bg-white/10 border-white/30 text-white focus:ring-white/50">
          <SelectValue placeholder="Seleccionar usuario" />
        </SelectTrigger>
        <SelectContent>
          {usuarios.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.nombre} ({u.rol})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
