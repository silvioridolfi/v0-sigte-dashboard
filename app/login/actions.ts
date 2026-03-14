"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(email: string, password: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: "Email o contraseña incorrectos" }
  }

  // Cargar datos del usuario desde la tabla usuarios
  const { data: usuarioData } = await supabase
    .from("usuarios")
    .select("id, nombre, email, rol, distrito, genero")
    .eq("id", data.user.id)
    .single()

  if (usuarioData) {
    // Escribir cookie sigte_active_user para que los server components la lean
    cookieStore.set(
      "sigte_active_user",
      encodeURIComponent(JSON.stringify(usuarioData)),
      { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" }
    )
  }

  redirect("/dashboard")
}
