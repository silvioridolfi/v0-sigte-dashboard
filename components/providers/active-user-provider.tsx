"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Usuario } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"

type ActiveUserContextType = {
  activeUser: Usuario | null
  setActiveUser: (user: Usuario | null) => void
  isLoading: boolean
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUserState] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Timeout de seguridad: si algo falla silenciosamente, no quedar en Skeleton infinito
    const timeout = setTimeout(() => setIsLoading(false), 3000)

    const supabase = createClient()

    async function loadUsuarioData(authUserId: string) {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("id, nombre, email, rol, distrito, genero")
          .eq("id", authUserId)
          .single()

        if (!error && data) {
          const usuario = data as Usuario
          setActiveUserState(usuario)
          localStorage.setItem("sigte_active_user", JSON.stringify(usuario))
          document.cookie = `sigte_active_user=${encodeURIComponent(JSON.stringify(usuario))}; path=/; max-age=31536000; SameSite=Lax`
        }
      } catch (e) {
        console.error("[sigte] Error cargando datos de usuario:", e)
      }
    }

    async function loadUserFromSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await loadUsuarioData(session.user.id)
        } else {
          // Fallback: localStorage para compatibilidad
          const stored = localStorage.getItem("sigte_active_user")
          if (stored) {
            try {
              setActiveUserState(JSON.parse(stored))
            } catch {
              // ignorar JSON inválido
            }
          }
        }
      } catch (e) {
        console.error("[sigte] Error obteniendo sesión:", e)
        // Intentar fallback al localStorage igual
        const stored = localStorage.getItem("sigte_active_user")
        if (stored) {
          try { setActiveUserState(JSON.parse(stored)) } catch { /* */ }
        }
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    loadUserFromSession()

    // Escuchar cambios de sesión (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: { user?: { id: string } } | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadUsuarioData(session.user.id)
        setIsLoading(false)
      } else if (event === "SIGNED_OUT") {
        setActiveUserState(null)
        localStorage.removeItem("sigte_active_user")
        document.cookie = "sigte_active_user=; path=/; max-age=0"
        document.cookie = "activeUser=; path=/; max-age=0"
        setIsLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const setActiveUser = (user: Usuario | null) => {
    setActiveUserState(user)
    if (user) {
      localStorage.setItem("sigte_active_user", JSON.stringify(user))
      document.cookie = `sigte_active_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=31536000; SameSite=Lax`
    } else {
      localStorage.removeItem("sigte_active_user")
      document.cookie = "sigte_active_user=; path=/; max-age=0"
    }
  }

  return (
    <ActiveUserContext.Provider value={{ activeUser, setActiveUser, isLoading }}>
      {children}
    </ActiveUserContext.Provider>
  )
}

export function useActiveUser() {
  const context = useContext(ActiveUserContext)
  if (context === undefined) {
    throw new Error("useActiveUser must be used within ActiveUserProvider")
  }
  return context
}
