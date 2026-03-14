"use server"

import { createClient } from "@/lib/supabase/server"

export async function getJefaturaDistrital(distritos: string[]) {
  if (distritos.length === 0) return { jefatura: null, error: null }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organismos_descentralizados")
    .select("*")
    .eq("subtipo_organizacion", "Jefatura Distrital")
    .in("distrito", distritos)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error getting jefatura distrital:", error)
    return { jefatura: null, error: error.message }
  }

  return { jefatura: data, error: null }
}

export async function getJefaturaRegional() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organismos_descentralizados")
    .select("*")
    .eq("subtipo_organizacion", "Jefatura Regional")
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error getting jefatura regional:", error)
    return { jefatura: null, error: error.message }
  }

  return { jefatura: data, error: null }
}

export async function getKPIsPorDistrito(distritos: string[]) {
  if (distritos.length === 0) return { kpis: null, error: null }

  const supabase = await createClient()

  const [schoolsResult, visitasResult] = await Promise.all([
    supabase.from("establecimientos").select("varones, mujeres", { count: "exact" }).in("distrito", distritos),
    supabase.from("sigte_visitas").select("estado", { count: "exact" }).in("distrito", distritos),
  ])

  const totalEscuelas = schoolsResult.count || 0
  const totalMatricula = schoolsResult.data?.reduce((sum, row) => sum + (row.varones || 0) + (row.mujeres || 0), 0) || 0

  // Count visits by status
  const visitasPorEstado = visitasResult.data?.reduce((acc: any, v) => {
    acc[v.estado] = (acc[v.estado] || 0) + 1
    return acc
  }, {})

  return {
    kpis: {
      total_escuelas: totalEscuelas,
      total_matricula: totalMatricula,
      visitas_planeadas: visitasPorEstado?.PLANEADA || 0,
      visitas_cerradas: visitasPorEstado?.CERRADA || 0,
      visitas_vencidas: visitasPorEstado?.VENCIDA || 0,
    },
    error: null,
  }
}
