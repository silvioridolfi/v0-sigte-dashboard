"use server"

import { createClient } from "@/lib/supabase/server"
import { parseUserDistricts } from "@/lib/utils/distrito-helpers"
import { getActiveUserServer } from "@/lib/utils/get-active-user-server"

function shouldShowAdmin(): boolean {
  const showAdmin = process.env.NEXT_PUBLIC_SHOW_ADMIN
  return showAdmin === "true"
}

export async function getKPIsGlobales() {
  const supabase = await createClient()
  const activeUser = await getActiveUserServer()

  let schoolsQuery = supabase.from("establecimientos").select("*", { count: "exact", head: true })
  let districtsQuery = supabase
    .from("establecimientos")
    .select("distrito", { count: "exact" })
    .not("distrito", "is", null)
  let enrollmentQuery = supabase.from("establecimientos").select("varones, mujeres")

  if (activeUser?.rol === "FED") {
    const userDistricts = parseUserDistricts(activeUser.distrito)
    if (userDistricts.length > 0) {
      schoolsQuery = schoolsQuery.in("distrito", userDistricts)
      districtsQuery = districtsQuery.in("distrito", userDistricts)
      enrollmentQuery = enrollmentQuery.in("distrito", userDistricts)
    }
  }

  const [schoolsResult, districtsResult, enrollmentResult] = await Promise.all([
    schoolsQuery,
    districtsQuery,
    enrollmentQuery,
  ])

  const totalEscuelas = schoolsResult.count || 0

  // Count unique districts
  const districts = new Set(districtsResult.data?.map((d) => d.distrito).filter(Boolean))
  const totalDistritos = districts.size

  // Calculate total enrollment
  const totalMatricula =
    enrollmentResult.data?.reduce((sum, row) => {
      return sum + (row.varones || 0) + (row.mujeres || 0)
    }, 0) || 0

  return {
    totalEscuelas,
    totalDistritos,
    totalMatricula,
    error: null,
  }
}

export async function getKPIsPersonales(usuarioId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("vw_sigte_kpis_trabajo").select("*").eq("usuario_id", usuarioId).single()

  if (error) {
    console.error("[v0] Error getting personal KPIs:", error)
    return { kpis: null, error: error.message }
  }

  return { kpis: data, error: null }
}

export async function getKPIsEquipo(distrito?: string) {
  const supabase = await createClient()

  let query = supabase.from("vw_sigte_kpis_trabajo").select("*")

  if (!shouldShowAdmin()) {
    query = query.neq("rol", "ADMIN")
  }

  if (distrito) {
    query = query.eq("distrito", distrito)
  }

  const { data, error } = await query.order("nombre")

  if (error) {
    console.error("[v0] Error getting team KPIs:", error)
    return { kpis: [], error: error.message }
  }

  return { kpis: data || [], error: null }
}
