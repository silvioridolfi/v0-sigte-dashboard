"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Usuario } from "@/lib/types/database"

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
    const stored = localStorage.getItem("sigte_active_user")
    if (stored) {
      try {
        setActiveUserState(JSON.parse(stored))
      } catch {
        // ignorar
      }
    }
    setIsLoading(false)
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
  if (context === undefined) throw new Error("useActiveUser must be used within ActiveUserProvider")
  return context
}
