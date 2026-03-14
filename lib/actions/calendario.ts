"use server"

import { createClient } from "@/lib/supabase/server"
import type { EventoCalendario } from "@/lib/types/database"
import { getActiveUserServer } from "@/lib/utils/get-active-user-server"

export async function getEventosCalendario(startDate?: string, endDate?: string) {
  const supabase = await createClient()
  const activeUser = await getActiveUserServer()

  let query = supabase.from("vw_sigte_calendario").select("*").order("fecha_inicio")

  if (startDate) {
    query = query.gte("fecha_inicio", startDate)
  }
  if (endDate) {
    query = query.lte("fecha_inicio", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching calendar events:", error)
    return { eventos: [], error: error.message }
  }

  let eventos = (data as EventoCalendario[]) || []

  if (activeUser && activeUser.rol === "FED") {
    const eventosIds = eventos.map((e) => e.id)

    // Get visitas where user is creator
    const { data: visitasCreadas } = await supabase
      .from("sigte_visitas")
      .select("id")
      .eq("creado_por", activeUser.id)
      .in("id", eventosIds)

    // Get visitas where user is participant
    const { data: visitasParticipadas } = await supabase
      .from("sigte_visita_participantes")
      .select("visita_id")
      .eq("usuario_id", activeUser.id)

    // Get reuniones where user is participant
    const { data: reunionesParticipadas } = await supabase
      .from("sigte_reunion_participantes")
      .select("reunion_id")
      .eq("usuario_id", activeUser.id)

    const visitasCreadorIds = new Set((visitasCreadas || []).map((v) => v.id))
    const visitasParticipanteIds = new Set((visitasParticipadas || []).map((vp) => vp.visita_id))
    const reunionesParticipanteIds = new Set((reunionesParticipadas || []).map((rp) => rp.reunion_id))

    // Filter eventos to only show where user is involved
    eventos = eventos.filter((evento) => {
      if (evento.tipo_evento === "VISITA") {
        return visitasCreadorIds.has(evento.id) || visitasParticipanteIds.has(evento.id)
      } else {
        return reunionesParticipanteIds.has(evento.id)
      }
    })
  }

  return { eventos, error: null }
}

export async function getEventoById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("vw_sigte_calendario").select("*").eq("id", id).single()

  if (error) {
    console.error("[v0] Error fetching event:", error)
    return { evento: null, error: error.message }
  }

  return { evento: data as EventoCalendario, error: null }
}

export async function getEventosEquipo(
  startDate?: string,
  endDate?: string,
  filters?: {
    fed?: string
    distrito?: string
    estado?: string
    tipo?: string
  },
) {
  const supabase = await createClient()
  const activeUser = await getActiveUserServer()

  if (!activeUser || (activeUser.rol !== "CED" && activeUser.rol !== "ADMIN")) {
    return { eventos: [], error: "No tienes permisos para ver eventos del equipo" }
  }

  let query = supabase.from("vw_sigte_calendario").select("*").order("fecha_inicio")

  if (startDate) {
    query = query.gte("fecha_inicio", startDate)
  }
  if (endDate) {
    query = query.lte("fecha_inicio", endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching team calendar events:", error)
    return { eventos: [], error: error.message }
  }

  let eventos = (data as EventoCalendario[]) || []

  // Apply client-side filters
  if (filters) {
    if (filters.fed && filters.fed !== "all") {
      // Get eventos where this FED is creator or participant
      const { data: visitasCreadas } = await supabase.from("sigte_visitas").select("id").eq("creado_por", filters.fed)

      const { data: visitasParticipadas } = await supabase
        .from("sigte_visita_participantes")
        .select("visita_id")
        .eq("usuario_id", filters.fed)

      const { data: reunionesParticipadas } = await supabase
        .from("sigte_reunion_participantes")
        .select("reunion_id")
        .eq("usuario_id", filters.fed)

      const visitasIds = new Set([
        ...(visitasCreadas || []).map((v) => v.id),
        ...(visitasParticipadas || []).map((vp) => vp.visita_id),
      ])
      const reunionesIds = new Set((reunionesParticipadas || []).map((rp) => rp.reunion_id))

      eventos = eventos.filter((e) => {
        if (e.tipo_evento === "VISITA") return visitasIds.has(e.id)
        if (e.tipo_evento === "REUNION") return reunionesIds.has(e.id)
        return false
      })
    }

    if (filters.distrito && filters.distrito !== "all") {
      eventos = eventos.filter((e) => e.distrito === filters.distrito)
    }

    if (filters.estado && filters.estado !== "all") {
      eventos = eventos.filter((e) => {
        const estado = e.estado?.toLowerCase()
        return estado === filters.estado
      })
    }

    if (filters.tipo && filters.tipo !== "all") {
      eventos = eventos.filter((e) => e.tipo_evento === filters.tipo)
    }
  }

  return { eventos, error: null }
}
