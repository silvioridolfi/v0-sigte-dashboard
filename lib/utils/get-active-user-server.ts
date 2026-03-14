import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Usuario } from "@/lib/types/database"

export async function getActiveUserServer(): Promise<Usuario | null> {
  const cookieStore = await cookies()

  // Primero intentar leer la cookie sigte_active_user (escrita en login)
  const activeUserCookie = cookieStore.get("sigte_active_user")
  if (activeUserCookie?.value) {
    try {
      return JSON.parse(decodeURIComponent(activeUserCookie.value)) as Usuario
    } catch {
      // ignorar y continuar con Auth
    }
  }

  // Fallback: leer sesión de Supabase Auth y buscar en tabla usuarios
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // read-only en server components
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, distrito, genero")
      .eq("id", user.id)
      .single()

    return data as Usuario | null
  } catch {
    return null
  }
}

export function canManageReuniones(user: Usuario | null): boolean {
  if (!user) return false
  return user.rol === "CED" || user.rol === "ADMIN"
}
