"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function crearNotificacionReunion(reunionId: string, creadoPor: string, participantesIds: string[]) {
  const supabase = await createClient()

  // Crear la notificación
  const { data: notificacion, error: notifError } = await supabase
    .from("sigte_notificaciones")
    .insert({
      tipo: "REUNION",
      titulo: "Nueva reunión programada",
      mensaje: "Se ha programado una nueva reunión de equipo",
      reunion_id: reunionId,
      alcance: "USERS",
      creado_por: creadoPor,
    })
    .select()
    .single()

  if (notifError) {
    console.error("Error creating notification:", notifError)
    return { error: notifError.message }
  }

  // Agregar destinatarios específicos (todos los participantes)
  if (participantesIds.length > 0) {
    const destinatariosData = participantesIds.map((userId) => ({
      notificacion_id: notificacion.id,
      usuario_id: userId,
    }))

    const { error: destError } = await supabase.from("sigte_notificacion_destinatarios").insert(destinatariosData)

    if (destError) {
      console.error("Error adding destinatarios:", destError)
    }
  }

  revalidatePath("/")
  return { error: null }
}

export async function getNotificacionesPendientes(usuarioId: string) {
  const supabase = await createClient()

  const { data: notificaciones, error: queryError } = await supabase
    .from("sigte_notificaciones")
    .select(
      `
      *,
      sigte_reuniones (id, titulo, fecha_inicio, fecha_fin)
    `,
    )
    .order("created_at", { ascending: false })

  if (queryError) {
    return { notificaciones: [], error: queryError.message }
  }

  // Filter manually for pending notifications
  const { data: lecturas } = await supabase
    .from("sigte_notificacion_lecturas")
    .select("notificacion_id")
    .eq("usuario_id", usuarioId)

  const lecturasSet = new Set(lecturas?.map((l) => l.notificacion_id) || [])

  // Get destinatarios
  const { data: destinatarios } = await supabase
    .from("sigte_notificacion_destinatarios")
    .select("notificacion_id")
    .eq("usuario_id", usuarioId)

  const destinatariosSet = new Set(destinatarios?.map((d) => d.notificacion_id) || [])

  const pendientes = (notificaciones || []).filter((n) => {
    // Skip if already read
    if (lecturasSet.has(n.id)) return false

    // Show to all if alcance is ALL
    if (n.alcance === "ALL") return true

    // Show only to destinatarios if alcance is USERS
    if (n.alcance === "USERS" && destinatariosSet.has(n.id)) return true

    return false
  })

  return { notificaciones: pendientes, error: null }
}

export async function marcarNotificacionLeida(notificacionId: string, usuarioId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("sigte_notificacion_lecturas").insert({
    notificacion_id: notificacionId,
    usuario_id: usuarioId,
  })

  if (error) {
    console.error("Error marking notification as read:", error)
    return { error: error.message }
  }

  revalidatePath("/")
  return { error: null }
}
