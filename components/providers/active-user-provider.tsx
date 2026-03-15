"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Usuario } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"

type ActiveUserContextType = {
  activeUser: Usuario | null
  sessionUser: Usuario | null
  setActiveUser: (user: Usuario | null) => void
  isLoading: boolean
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState<Usuario | null>(null)
  const [activeUser, setActiveUserState] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchUsuario(userId: string): Promise<Usuario | null> {
      const { data } = await supabase
        .from("usuarios")
        .select("id, nombre, email, rol, distrito, genero")
        .eq("id", userId)
        .single()
      return data as Usuario | null
    }

    // Inicializar con la sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: { user: { id: string } } | null } }) => {
      if (session?.user) {
        const usuario = await fetchUsuario(session.user.id)
        if (usuario) {
          setSessionUser(usuario)
          setActiveUserState(usuario)
        }
      }
      setIsLoading(false)
    })

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: { user?: { id: string } } | null) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const usuario = await fetchUsuario(session.user.id)
        if (usuario) {
          setSessionUser(usuario)
          setActiveUserState((prev) => {
            // Solo actualizar activeUser si no hay impersonación activa
            if (!prev || prev.id === session.user!.id) return usuario
            return prev
          })
        }
      } else if (event === "SIGNED_OUT") {
        setSessionUser(null)
        setActiveUserState(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const setActiveUser = (user: Usuario | null) => {
    // null = volver al usuario real de la sesión
    setActiveUserState(user ?? sessionUser)
  }

  return (
    <ActiveUserContext.Provider value={{ activeUser, sessionUser, setActiveUser, isLoading }}>
      {children}
    </ActiveUserContext.Provider>
  )
}

export function useActiveUser() {
  const context = useContext(ActiveUserContext)
  if (context === undefined) throw new Error("useActiveUser must be used within ActiveUserProvider")
  return context
}
