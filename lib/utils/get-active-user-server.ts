import { cookies } from "next/headers"
import type { Usuario } from "@/lib/types/database"

export async function getActiveUserServer(): Promise<Usuario | null> {
  const cookieStore = await cookies()
  const activeUserCookie = cookieStore.get("sigte_active_user")

  if (!activeUserCookie?.value) return null

  try {
    return JSON.parse(decodeURIComponent(activeUserCookie.value))
  } catch {
    return null
  }
}

export function canManageReuniones(user: Usuario | null): boolean {
  if (!user) return false
  return user.rol === "CED" || user.rol === "ADMIN"
}
