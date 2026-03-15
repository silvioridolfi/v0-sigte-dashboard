import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(null)
  }

  // Leer sigte_active_user primero (más rápido)
  const activeUserCookie = cookieStore.get("sigte_active_user")
  if (activeUserCookie?.value) {
    try {
      return NextResponse.json(JSON.parse(decodeURIComponent(activeUserCookie.value)))
    } catch {
      // continuar
    }
  }

  // Fallback: buscar en tabla usuarios
  const { data } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, distrito, genero")
    .eq("id", user.id)
    .single()

  return NextResponse.json(data ?? null)
}
