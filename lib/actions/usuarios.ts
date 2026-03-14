"use server"

import { createClient } from "@/lib/supabase/server"
import type { Usuario } from "@/lib/types/database"

export async function getUsuarios(): Promise<Usuario[]> {
  try {
    // Verificar que las credenciales de Supabase estén disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("[v0] Supabase environment variables not configured")
      return []
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, distrito, genero")
      .order("nombre")
      .limit(100)

    if (error) {
      console.error("[v0] Error fetching usuarios from Supabase:", error.message)
      return []
    }

    if (!data || data.length === 0) {
      console.warn("[v0] No usuarios found in database")
      return []
    }

    return (data as unknown as Usuario[]) || []
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Exception in getUsuarios:", errorMsg)
    return []
  }
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  try {
    if (!id) return null

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre, email, rol, distrito, genero")
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching usuario by id:", error.message)
      return null
    }

    return (data as unknown as Usuario) || null
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error("[v0] Exception in getUsuarioById:", errorMsg)
    return null
  }
}
