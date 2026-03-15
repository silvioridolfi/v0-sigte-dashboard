"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import type { Usuario } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"

type ActiveUserContextType = {
  activeUser: Usuario | null
  sessionUser: Usuario | null   // usuario real de la sesión
  setActiveUser: (user: Usuario | null) => void
  isLoading: boolean
}

const ActiveUserContext = createContext<ActiveUserContextType | undefined>(undefined)

export function ActiveUserProvider({ children }: { children: React.ReactNode }) {
  const [sessionUser, setSessionUser] = useState<Usuario | null>(null)
  const [activeUser, setActiveUserState] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const timeout = setTimeout(() => setIsLoading(false), 5000)

    async function loadUser() {
      try {
        const res = await fetch("/api/me")
        if (res.ok) {
          const data = await res.json()
          if (data) {
            setSessionUser(data as Usuario)
            setActiveUserState(data as Usuario)
          }
        }
      } catch (e) {
        console.error("[sigte] Error llamando /api/me:", e)
      } finally {
        clearTimeout(timeout)
        setIsLoading(false)
      }
    }

    loadUser()

    // Escuchar logout
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        setSessionUser(null)
        setActiveUserState(null)
        setIsLoading(false)
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // setActiveUser: cambia el usuario activo para impersonación
  // sin tocar sessionUser (el real)
  const setActiveUser = (user: Usuario | null) => {
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
  if (context === undefined) {
    throw new Error("useActiveUser must be used within ActiveUserProvider")
  }
  return context
}
