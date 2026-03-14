"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type AccionTipo = "TECNICA" | "PEDAGOGICA"

export type Accion = {
  id: string
  visita_id: string
  usuario_id: string
  tipo: AccionTipo
  descripcion: string
  fecha: string
  created_at: string
  visita?: {
    id: string
    titulo: string
    cue: number
    estado: string
  }
  usuario?: {
    id: string
    nombre: string
  }
}

export async function crearAccion(data: {
  visita_id: string
  usuario_id: string
  tipo: AccionTipo
  descripcion: string
  fecha: string
}) {
  const supabase = await createClient()

  // Verificar que la visita existe y está cerrada
  const { data: visita, error: visitaError } = await supabase
    .from("sigte_visitas")
    .select("id, estado")
    .eq("id", data.visita_id)
    .single()

  if (visitaError || !visita) {
    return { accion: null, error: "Visita no encontrada" }
  }

  if (visita.estado !== "CERRADA_CON_ACTA") {
    return { accion: null, error: "Solo se pueden cargar acciones en visitas realizadas (con acta)" }
  }

  const { data: accion, error } = await supabase
    .from("sigte_acciones")
    .insert({
      visita_id: data.visita_id,
      usuario_id: data.usuario_id,
      tipo: data.tipo,
      descripcion: data.descripcion,
      fecha: data.fecha,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating accion:", error)
    return { accion: null, error: error.message }
  }

  revalidatePath("/acciones")
  revalidatePath(`/visitas/${data.visita_id}`)
  revalidatePath(`/feds/${data.usuario_id}`)
  return { accion, error: null }
}

export async function getAccionesPorVisita(visitaId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sigte_acciones")
    .select(`
      *,
      usuario:usuarios(id, nombre)
    `)
    .eq("visita_id", visitaId)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching acciones:", error)
    return { acciones: [], error: error.message }
  }

  return { acciones: data || [], error: null }
}

export async function getAccionesPorUsuario(usuarioId: string, limit?: number) {
  const supabase = await createClient()

  let query = supabase
    .from("sigte_acciones")
    .select(`
      *,
      visita:sigte_visitas(id, titulo, cue, estado)
    `)
    .eq("usuario_id", usuarioId)
    .order("fecha", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching acciones:", error)
    return { acciones: [], error: error.message }
  }

  return { acciones: data || [], error: null }
}

export async function getAccionesRecientes(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("sigte_acciones")
    .select(`
      *,
      visita:sigte_visitas(id, titulo, cue),
      usuario:usuarios(id, nombre)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching acciones recientes:", error)
    return { acciones: [], error: error.message }
  }

  return { acciones: data || [], error: null }
}

export async function getResumenAccionesMensual(usuarioId?: string) {
  const supabase = await createClient()

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  let query = supabase
    .from("sigte_acciones")
    .select("tipo")
    .gte("fecha", inicioMes.toISOString().split("T")[0])

  if (usuarioId) {
    query = query.eq("usuario_id", usuarioId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching resumen mensual:", error)
    return { tecnicas: 0, pedagogicas: 0, total: 0 }
  }

  const tecnicas = data?.filter((a) => a.tipo === "TECNICA").length || 0
  const pedagogicas = data?.filter((a) => a.tipo === "PEDAGOGICA").length || 0

  return {
    tecnicas,
    pedagogicas,
    total: tecnicas + pedagogicas,
  }
}

export async function eliminarAccion(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("sigte_acciones").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting accion:", error)
    return { error: error.message }
  }

  revalidatePath("/acciones")
  return { error: null }
}
