"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Horario = {
  id: string
  usuario_id: string
  dia_semana: number // 1=Lunes, 5=Viernes
  hora_inicio: string
  hora_fin: string
  activo: boolean
  usuario?: {
    id: string
    nombre: string
    distrito: string
  }
}

export async function getHorarioUsuario(usuarioId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sigte_horarios")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("activo", true)
    .order("dia_semana")

  if (error) {
    console.error("[v0] Error fetching horario:", error)
    return { horarios: [], error: error.message }
  }

  return { horarios: data || [], error: null }
}

export async function getHorariosEquipo(distrito?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("sigte_horarios")
    .select(`
      *,
      usuario:usuarios(id, nombre, distrito, rol)
    `)
    .eq("activo", true)
    .order("dia_semana")

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching horarios equipo:", error)
    return { horarios: [], error: error.message }
  }

  let result = data || []

  // Filtrar por distrito si se especifica
  if (distrito) {
    result = result.filter((h) => h.usuario?.distrito?.includes(distrito))
  }

  return { horarios: result, error: null }
}

export async function guardarHorario(data: {
  usuario_id: string
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}) {
  const supabase = await createClient()

  // Usar upsert para crear o actualizar
  const { data: horario, error } = await supabase
    .from("sigte_horarios")
    .upsert(
      {
        usuario_id: data.usuario_id,
        dia_semana: data.dia_semana,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        activo: true,
      },
      {
        onConflict: "usuario_id,dia_semana",
      }
    )
    .select()
    .single()

  if (error) {
    console.error("[v0] Error saving horario:", error)
    return { horario: null, error: error.message }
  }

  revalidatePath("/horarios")
  return { horario, error: null }
}

export async function eliminarHorario(usuarioId: string, diaSemana: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("sigte_horarios")
    .update({ activo: false })
    .eq("usuario_id", usuarioId)
    .eq("dia_semana", diaSemana)

  if (error) {
    console.error("[v0] Error deleting horario:", error)
    return { error: error.message }
  }

  revalidatePath("/horarios")
  return { error: null }
}

export async function guardarHorariosCompletos(
  usuarioId: string,
  horarios: { dia_semana: number; hora_inicio: string; hora_fin: string }[]
) {
  const supabase = await createClient()

  // Desactivar todos los horarios actuales
  await supabase
    .from("sigte_horarios")
    .update({ activo: false })
    .eq("usuario_id", usuarioId)

  // Insertar nuevos horarios
  if (horarios.length > 0) {
    const horariosData = horarios.map((h) => ({
      usuario_id: usuarioId,
      dia_semana: h.dia_semana,
      hora_inicio: h.hora_inicio,
      hora_fin: h.hora_fin,
      activo: true,
    }))

    const { error } = await supabase.from("sigte_horarios").upsert(horariosData, {
      onConflict: "usuario_id,dia_semana",
    })

    if (error) {
      console.error("[v0] Error saving horarios:", error)
      return { error: error.message }
    }
  }

  revalidatePath("/horarios")
  return { error: null }
}
