"use server"

import { createClient } from "@/lib/supabase/server"

export type FEDPerfil = {
  usuario_id: string
  nombre: string
  email: string
  distrito: string
  rol: string
  genero: string | null
  visitas_realizadas: number
  acciones_tecnicas: number
  acciones_pedagogicas: number
  total_acciones: number
}

export type ActividadMensual = {
  mes: string
  visitas: number
  acciones_tecnicas: number
  acciones_pedagogicas: number
}

export async function getFEDs(distrito?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("usuarios")
    .select("id, nombre, email, distrito, rol, genero")
    .in("rol", ["FED", "CED"])
    .order("nombre")

  if (distrito) {
    query = query.ilike("distrito", `%${distrito}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching FEDs:", error)
    return { feds: [], error: error.message }
  }

  return { feds: data || [], error: null }
}

export async function getFEDPerfil(usuarioId: string) {
  const supabase = await createClient()

  // Obtener datos básicos del usuario
  const { data: usuario, error: userError } = await supabase
    .from("usuarios")
    .select("id, nombre, email, distrito, rol, genero")
    .eq("id", usuarioId)
    .single()

  if (userError || !usuario) {
    return { perfil: null, error: "Usuario no encontrado" }
  }

  // Contar visitas realizadas
  const { count: visitasRealizadas } = await supabase
    .from("sigte_visita_participantes")
    .select("visita_id", { count: "exact" })
    .eq("usuario_id", usuarioId)

  // Contar acciones
  const { data: acciones } = await supabase
    .from("sigte_acciones")
    .select("tipo")
    .eq("usuario_id", usuarioId)

  const accionesTecnicas = acciones?.filter((a) => a.tipo === "TECNICA").length || 0
  const accionesPedagogicas = acciones?.filter((a) => a.tipo === "PEDAGOGICA").length || 0

  const perfil: FEDPerfil = {
    usuario_id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    distrito: usuario.distrito,
    rol: usuario.rol,
    genero: usuario.genero,
    visitas_realizadas: visitasRealizadas || 0,
    acciones_tecnicas: accionesTecnicas,
    acciones_pedagogicas: accionesPedagogicas,
    total_acciones: accionesTecnicas + accionesPedagogicas,
  }

  return { perfil, error: null }
}

export async function getVisitasFED(usuarioId: string, limit?: number) {
  const supabase = await createClient()

  let query = supabase
    .from("sigte_visita_participantes")
    .select(`
      visita_id,
      rol_en_visita,
      visita:sigte_visitas(
        id,
        titulo,
        cue,
        estado,
        tipo,
        fecha_inicio,
        distrito
      )
    `)
    .eq("usuario_id", usuarioId)
    .order("visita_id", { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching visitas FED:", error)
    return { visitas: [], error: error.message }
  }

  return { visitas: data || [], error: null }
}

export async function getActividadMensualFED(usuarioId: string, meses: number = 6) {
  const supabase = await createClient()

  const fechaInicio = new Date()
  fechaInicio.setMonth(fechaInicio.getMonth() - meses)
  fechaInicio.setDate(1)

  // Obtener visitas por mes
  const { data: visitas } = await supabase
    .from("sigte_visita_participantes")
    .select(`
      visita:sigte_visitas(fecha_inicio, estado)
    `)
    .eq("usuario_id", usuarioId)
    .gte("visita.fecha_inicio", fechaInicio.toISOString())

  // Obtener acciones por mes
  const { data: acciones } = await supabase
    .from("sigte_acciones")
    .select("tipo, fecha")
    .eq("usuario_id", usuarioId)
    .gte("fecha", fechaInicio.toISOString().split("T")[0])

  // Agrupar por mes
  const actividadPorMes: Record<string, ActividadMensual> = {}

  visitas?.forEach((v) => {
    if (v.visita?.fecha_inicio) {
      const mes = v.visita.fecha_inicio.substring(0, 7)
      if (!actividadPorMes[mes]) {
        actividadPorMes[mes] = { mes, visitas: 0, acciones_tecnicas: 0, acciones_pedagogicas: 0 }
      }
      actividadPorMes[mes].visitas++
    }
  })

  acciones?.forEach((a) => {
    const mes = a.fecha.substring(0, 7)
    if (!actividadPorMes[mes]) {
      actividadPorMes[mes] = { mes, visitas: 0, acciones_tecnicas: 0, acciones_pedagogicas: 0 }
    }
    if (a.tipo === "TECNICA") {
      actividadPorMes[mes].acciones_tecnicas++
    } else {
      actividadPorMes[mes].acciones_pedagogicas++
    }
  })

  const actividad = Object.values(actividadPorMes).sort((a, b) => b.mes.localeCompare(a.mes))

  return { actividad, error: null }
}
