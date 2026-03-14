"use server"

import { createClient } from "@/lib/supabase/server"
import type { Usuario } from "@/lib/types/database"

/**
 * Helper centralizado para cargar usuarios disponibles
 * Respeta NEXT_PUBLIC_SHOW_ADMIN para filtrar ADMIN server-side
 */
export async function getUsuariosDisponibles(): Promise<Usuario[]> {
  const supabase = await createClient()

  let query = supabase.from("usuarios").select("*").order("nombre")

  const showAdmin = process.env.NEXT_PUBLIC_SHOW_ADMIN === "true"
  if (!showAdmin) {
    query = query.neq("rol", "ADMIN")
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error loading usuarios:", error)
    return []
  }

  return (data as Usuario[]) || []
}
