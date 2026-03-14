"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function crearVisita(data: {
  cue: number
  titulo: string
  descripcion: string | null
  tipo: "TECNICA" | "PEDAGOGICA" | "MIXTA" | "ADMIN"
  fecha_inicio: string
  fecha_fin: string | null
  distrito: string
  creado_por: string
  participantes: string[]
}) {
  const supabase = await createClient()

  // Crear la visita
  const { data: visita, error: visitaError } = await supabase
    .from("sigte_visitas")
    .insert({
      cue: data.cue,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      estado: "PLANEADA",
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      distrito: data.distrito,
      creado_por: data.creado_por,
    })
    .select()
    .single()

  if (visitaError) {
    console.error("[v0] Error creating visita:", visitaError)
    return { visita: null, error: visitaError.message }
  }

  // Agregar participantes
  if (data.participantes.length > 0) {
    const participantesData = data.participantes.map((userId, index) => ({
      visita_id: visita.id,
      usuario_id: userId,
      rol_en_visita: index === 0 ? "RESPONSABLE" : "ACOMPANANTE",
    }))

    const { error: participantesError } = await supabase.from("sigte_visita_participantes").insert(participantesData)

    if (participantesError) {
      console.error("[v0] Error adding participantes:", participantesError)
    }
  }

  revalidatePath("/calendario")
  revalidatePath("/visitas")
  return { visita, error: null }
}

export async function getVisita(id: string) {
  const supabase = await createClient()

  const { data: visita, error } = await supabase.from("sigte_visitas").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching visita:", error)
    return { visita: null, participantes: [], acta: null, error: error.message }
  }

  // Obtener participantes
  const { data: participantes } = await supabase
    .from("sigte_visita_participantes")
    .select(
      `
      usuario_id,
      rol_en_visita,
      usuarios (id, nombre, email, rol, distrito)
    `,
    )
    .eq("visita_id", id)

  // Obtener acta
  const { data: acta } = await supabase.from("sigte_actas").select("*").eq("visita_id", id).single()

  return {
    visita,
    participantes: participantes || [],
    acta: acta || null,
    error: null,
  }
}

export async function actualizarVisita(
  id: string,
  data: {
    titulo: string
    descripcion: string | null
    tipo: "TECNICA" | "PEDAGOGICA" | "MIXTA" | "ADMIN"
    fecha_inicio: string
    fecha_fin: string | null
  },
) {
  const supabase = await createClient()

  // Verificar que no tiene acta
  const { data: acta } = await supabase.from("sigte_actas").select("id").eq("visita_id", id).single()

  if (acta) {
    return { error: "No se puede editar una visita con acta cargada" }
  }

  const { error } = await supabase
    .from("sigte_visitas")
    .update({
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating visita:", error)
    return { error: error.message }
  }

  revalidatePath("/calendario")
  revalidatePath("/visitas")
  revalidatePath(`/visitas/${id}`)
  return { error: null }
}

export async function subirActa(data: { visita_id: string; archivo_url: string; subido_por: string }) {
  const supabase = await createClient()

  // Insertar acta
  const { error: actaError } = await supabase.from("sigte_actas").insert({
    visita_id: data.visita_id,
    archivo_url: data.archivo_url,
    subido_por: data.subido_por,
  })

  if (actaError) {
    console.error("[v0] Error uploading acta:", actaError)
    return { error: actaError.message }
  }

  // Cambiar estado de la visita a CERRADA_CON_ACTA
  const { error: visitaError } = await supabase
    .from("sigte_visitas")
    .update({ estado: "CERRADA_CON_ACTA" })
    .eq("id", data.visita_id)

  if (visitaError) {
    console.error("[v0] Error updating visita estado:", visitaError)
    return { error: visitaError.message }
  }

  revalidatePath("/calendario")
  revalidatePath("/visitas")
  revalidatePath(`/visitas/${data.visita_id}`)
  return { error: null }
}

export async function actualizarParticipantesVisita(visitaId: string, participantesIds: string[], creadorId: string) {
  const supabase = await createClient()

  // Eliminar participantes existentes
  await supabase.from("sigte_visita_participantes").delete().eq("visita_id", visitaId)

  // Insertar nuevos participantes
  if (participantesIds.length > 0) {
    const participantesData = participantesIds.map((userId, index) => ({
      visita_id: visitaId,
      usuario_id: userId,
      // El creador siempre es RESPONSABLE
      rol_en_visita: userId === creadorId ? "RESPONSABLE" : "ACOMPANANTE",
    }))

    const { error } = await supabase.from("sigte_visita_participantes").insert(participantesData)

    if (error) {
      console.error("[v0] Error updating participantes:", error)
      return { error: error.message }
    }
  }

  revalidatePath("/calendario")
  revalidatePath(`/visitas/${visitaId}`)
  return { error: null }
}
