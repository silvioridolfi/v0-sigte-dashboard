"use server"

import { createClient } from "@/lib/supabase/server"
import type { KPITrabajo } from "@/lib/types/database"

function shouldShowAdmin(): boolean {
  const showAdmin = process.env.NEXT_PUBLIC_SHOW_ADMIN
  return showAdmin === "true"
}

export async function getKPIsTrabajo(distrito?: string) {
  const supabase = await createClient()

  let query = supabase.from("vw_sigte_kpis_trabajo").select("*")

  if (!shouldShowAdmin()) {
    query = query.neq("rol", "ADMIN")
  }

  if (distrito && distrito !== "Todos") {
    query = query.eq("distrito", distrito)
  }

  query = query.order("nombre", { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching KPIs trabajo:", error)
    return { kpis: [], error: error.message }
  }

  return { kpis: (data as KPITrabajo[]) || [], error: null }
}

export async function getKPIsGlobales() {
  const supabase = await createClient()

  const [schoolsResult, districtsResult, enrollmentResult] = await Promise.all([
    supabase.from("establecimientos").select("*", { count: "exact", head: true }),
    supabase.from("establecimientos").select("distrito").not("distrito", "is", null),
    supabase.from("establecimientos").select("varones, mujeres"),
  ])

  const totalEscuelas = schoolsResult.count || 0

  // Count unique districts
  const districts = new Set(districtsResult.data?.map((d) => d.distrito).filter(Boolean))
  const totalDistritos = districts.size

  // Calculate total enrollment (varones + mujeres)
  const totalMatricula =
    enrollmentResult.data?.reduce((sum, row) => {
      return sum + (row.varones || 0) + (row.mujeres || 0)
    }, 0) || 0

  if (schoolsResult.error) {
    console.error("[v0] Error fetching KPIs globales:", schoolsResult.error)
    return { kpis: null, error: schoolsResult.error.message }
  }

  return {
    kpis: {
      total_establecimientos: totalEscuelas,
      distritos_distintos: totalDistritos,
      matricula_total: totalMatricula,
    },
    error: null,
  }
}

export async function getDistritosUnicos() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("establecimientos").select("distrito").order("distrito")

  if (error) {
    console.error("[v0] Error fetching distritos:", error)
    return { distritos: [], error: error.message }
  }

  // Obtener valores únicos
  const distritos = [...new Set(data.map((d) => d.distrito).filter(Boolean))]

  return { distritos, error: null }
}
