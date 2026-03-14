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

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
  return match ? decodeURIComponent(match[1]) : null
}

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
  const [activeUser, setActiveUserState] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 3000)

    async function loadUser() {
      try {
        // 1. Intentar leer sigte_active_user de la cookie (escrita por el server action)
        const cookieVal = getCookieValue("sigte_active_user")
        if (cookieVal) {
          try {
            const usuario = JSON.parse(cookieVal) as Usuario
            setActiveUserState(usuario)
            clearTimeout(timeout)
            setIsLoading(false)
            return
          } catch {
            // ignorar JSON inválido
          }
        }

        // 2. Intentar leer del localStorage (fallback)
        const stored = localStorage.getItem("sigte_active_user")
        if (stored) {
          try {
            setActiveUserState(JSON.parse(stored))
            clearTimeout(timeout)
            setIsLoading(false)
            return
          } catch {
            // ignorar
          }
        }

        // 3. Intentar sesión de Supabase directamente
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data } = await supabase
            .from("usuarios")
            .select("id, nombre, email, rol, distrito, genero")
            .eq("id", session.user.id)
            .single()
          if (data) {
            setActiveUserState(data as Usuario)
          }
        }
      } catch (e) {
        console.error("[sigte] Error cargando usuario:", e)
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    loadUser()

    // Escuchar cambios de sesión
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: { user?: { id: string } } | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data } = await supabase
          .from("usuarios")
          .select("id, nombre, email, rol, distrito, genero")
          .eq("id", session.user.id)
          .single()
        if (data) {
          const usuario = data as Usuario
          setActiveUserState(usuario)
          localStorage.setItem("sigte_active_user", JSON.stringify(usuario))
          document.cookie = `sigte_active_user=${encodeURIComponent(JSON.stringify(usuario))}; path=/; max-age=31536000; SameSite=Lax`
        }
        setIsLoading(false)
      } else if (event === "SIGNED_OUT") {
        setActiveUserState(null)
        localStorage.removeItem("sigte_active_user")
        document.cookie = "sigte_active_user=; path=/; max-age=0"
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
