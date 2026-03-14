"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { crearNotificacionReunion } from "./notificaciones"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"

export async function crearReunion(data: {
  titulo: string
  descripcion: string | null
  ambito: "REGIONAL" | "DISTRITAL"
  distrito: string | null
  fecha_inicio: string
  fecha_fin: string | null
  creado_por: string
  participantes: string[]
}) {
  const activeUser = await getActiveUserServer()

  if (!canManageReuniones(activeUser)) {
    return { reunion: null, error: "No tienes permisos para crear reuniones" }
  }

  const supabase = await createClient()

  const { data: reunion, error: reunionError } = await supabase
    .from("sigte_reuniones")
    .insert({
      titulo: data.titulo,
      descripcion: data.descripcion,
      ambito: data.ambito,
      distrito: data.distrito,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      creado_por: data.creado_por,
    })
    .select()
    .single()

  if (reunionError) {
    console.error("[v0] Error creating reunion:", reunionError)
    return { reunion: null, error: reunionError.message }
  }

  if (data.participantes.length > 0) {
    const participantesData = data.participantes.map((userId) => ({
      reunion_id: reunion.id,
      usuario_id: userId,
    }))

    const { error: participantesError } = await supabase.from("sigte_reunion_participantes").insert(participantesData)

    if (participantesError) {
      console.error("[v0] Error adding participantes:", participantesError)
    }
  }

  await crearNotificacionReunion(reunion.id, data.creado_por, data.participantes)

  revalidatePath("/calendario")
  revalidatePath("/reuniones")
  return { reunion, error: null }
}

export async function getReunion(id: string) {
  const supabase = await createClient()

  const { data: reunion, error } = await supabase.from("sigte_reuniones").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching reunion:", error)
    return { reunion: null, participantes: [], error: error.message }
  }

  const { data: participantes } = await supabase
    .from("sigte_reunion_participantes")
    .select(
      `
      usuario_id,
      usuarios (id, nombre, email, rol, distrito)
    `,
    )
    .eq("reunion_id", id)

  return {
    reunion,
    participantes: participantes || [],
    error: null,
  }
}

export async function getReuniones() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("sigte_reuniones").select("*").order("fecha_inicio", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching reuniones:", error)
    return { reuniones: [], error: error.message }
  }

  return { reuniones: data || [], error: null }
}

export async function actualizarReunion(
  id: string,
  data: {
    titulo: string
    descripcion: string | null
    ambito: "REGIONAL" | "DISTRITAL"
    distrito: string | null
    fecha_inicio: string
    fecha_fin: string | null
  },
) {
  const activeUser = await getActiveUserServer()

  if (!canManageReuniones(activeUser)) {
    return { error: "No tienes permisos para editar reuniones" }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("sigte_reuniones")
    .update({
      titulo: data.titulo,
      descripcion: data.descripcion,
      ambito: data.ambito,
      distrito: data.distrito,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
    })
    .eq("id", id)

  if (error) {
    console.error("[v0] Error updating reunion:", error)
    return { error: error.message }
  }

  revalidatePath("/calendario")
  revalidatePath("/reuniones")
  revalidatePath(`/reuniones/${id}`)
  return { error: null }
}

export async function eliminarReunion(id: string) {
  const activeUser = await getActiveUserServer()

  if (!canManageReuniones(activeUser)) {
    return { error: "No tienes permisos para eliminar reuniones" }
  }

  const supabase = await createClient()

  await supabase.from("sigte_reunion_participantes").delete().eq("reunion_id", id)

  const { error } = await supabase.from("sigte_reuniones").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting reunion:", error)
    return { error: error.message }
  }

  revalidatePath("/calendario")
  revalidatePath("/reuniones")
  return { error: null }
}

export async function actualizarParticipantesReunion(reunionId: string, participantesIds: string[]) {
  const supabase = await createClient()

  // Eliminar participantes existentes
  await supabase.from("sigte_reunion_participantes").delete().eq("reunion_id", reunionId)

  // Insertar nuevos participantes
  if (participantesIds.length > 0) {
    const participantesData = participantesIds.map((userId) => ({
      reunion_id: reunionId,
      usuario_id: userId,
    }))

    const { error } = await supabase.from("sigte_reunion_participantes").insert(participantesData)

    if (error) {
      console.error("[v0] Error updating participantes:", error)
      return { error: error.message }
    }
  }

  revalidatePath("/calendario")
  revalidatePath(`/reuniones/${reunionId}`)
  return { error: null }
}
