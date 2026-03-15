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
    const timeout = setTimeout(() => setIsLoading(false), 5000)

    async function loadUser() {
      try {
        // Llamar al API route del servidor — lee las cookies HTTP correctamente
        const res = await fetch("/api/me")
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setActiveUserState(data as Usuario)
            clearTimeout(timeout)
            setIsLoading(false)
            return
          }
        }
      } catch (e) {
        console.error("[sigte] Error llamando /api/me:", e)
      }
      clearTimeout(timeout)
      setIsLoading(false)
    }

    loadUser()

    // Escuchar cambios de sesión en el cliente
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (event === "SIGNED_IN") {
        await loadUser()
      } else if (event === "SIGNED_OUT") {
        setActiveUserState(null)
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
