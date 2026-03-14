"use client"

import { useState, useEffect } from "react"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { getSaludo } from "@/lib/utils/saludo"
import type { Usuario } from "@/lib/types/database"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface UsuarioSelectorProps {
  usuarios: Usuario[]
}

export function UsuarioSelector({ usuarios }: UsuarioSelectorProps) {
  const { activeUser, setActiveUser } = useActiveUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!activeUser && usuarios.length > 0) {
      setActiveUser(usuarios[0])
    }
  }, [])

  if (!mounted) {
    return <Skeleton className="h-10 w-[200px]" />
  }

  const handleUserChange = (userId: string) => {
    const user = usuarios.find((u) => u.id === userId)
    if (user) {
      setActiveUser(user)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {activeUser && (
        <span className="text-sm font-medium hidden sm:inline">
          {getSaludo(activeUser.genero)}, {activeUser.nombre}
        </span>
      )}
      <Select value={activeUser?.id || ""} onValueChange={handleUserChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Seleccionar usuario" />
        </SelectTrigger>
        <SelectContent>
          {usuarios.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No hay usuarios disponibles</div>
          ) : (
            usuarios.map((usuario) => (
              <SelectItem key={usuario.id} value={usuario.id}>
                {usuario.nombre} ({usuario.rol})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
