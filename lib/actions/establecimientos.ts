"use server"

import { createClient } from "@/lib/supabase/server"

export async function buscarEstablecimientos(query: string, limit = 20, offset = 0, filterDistritos?: string[]) {
  if (!query || query.trim().length === 0) {
    return { establecimientos: [], total: 0, error: null }
  }

  const supabase = await createClient()
  const trimmed = query.trim()

  let searchQuery = supabase.from("vw_sigte_establecimientos_normalizado").select("*", { count: "exact" })

  if (filterDistritos && filterDistritos.length > 0) {
    searchQuery = searchQuery.in("distrito", filterDistritos)
  }

  // CUE: exactly 8 digits
  if (/^\d{8}$/.test(trimmed)) {
    searchQuery = searchQuery.eq("cue", Number.parseInt(trimmed))
  }
  // Predio: exactly 6 digits
  else if (/^\d{6}$/.test(trimmed)) {
    searchQuery = searchQuery.eq("predio", Number.parseInt(trimmed))
  } else if (/^\d{1,3}$/.test(trimmed)) {
    // Número exacto: usar RPC con regex para no matchear parciales (21 != 121)
    const { data: rpcData, error: rpcError, count: rpcCount } = await supabase
      .rpc("buscar_por_numero_exacto", {
        p_numero: trimmed,
        p_distritos: filterDistritos ?? null,
      })
    if (rpcError) {
      return { establecimientos: [], total: 0, error: rpcError.message }
    }
    const sliced = (rpcData || []).slice(offset, offset + limit)
    return { establecimientos: sliced, total: rpcData?.length || 0, error: null }
  } else if (/^(primaria|secundaria|jardin|tecnica|especial|agraria)\s+\d{1,3}$/i.test(trimmed)) {
    // Nivel + número exacto: usar RPC con regex
    const [tipo, num] = trimmed.toLowerCase().split(/\s+/)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("buscar_por_nivel_numero", {
        p_nivel: tipo,
        p_numero: num,
        p_distritos: filterDistritos ?? null,
      })
    if (rpcError) {
      return { establecimientos: [], total: 0, error: rpcError.message }
    }
    const sliced = (rpcData || []).slice(offset, offset + limit)
    return { establecimientos: sliced, total: rpcData?.length || 0, error: null }
  }
  // Text search - normalizado
  else {
    const normalized = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    const searchTerms = normalized.split(/\s+/).filter((t) => t.length > 0)
    const orConditions = searchTerms
      .map((term) => `nombre.ilike.%${term}%,distrito.ilike.%${term}%,ciudad.ilike.%${term}%`)
      .join(",")
    searchQuery = searchQuery.or(orConditions)
  }

  const { data, error, count } = await searchQuery.range(offset, offset + limit - 1).order("nombre")

  if (error) {
    console.error("[v0] Error searching establecimientos:", error)
    return { establecimientos: [], total: 0, error: error.message }
  }

  return { establecimientos: data || [], total: count || 0, error: null }
}

export async function getEstablecimientoByCUE(cue: number) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("establecimientos").select("*").eq("cue", cue).single()

  if (error) {
    console.error("[v0] Error getting establecimiento:", error)
    return { establecimiento: null, error: error.message }
  }

  return { establecimiento: data, error: null }
}

export async function getContactoByCUE(cue: number) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("contactos").select("*").eq("cue", cue).maybeSingle()

  if (error) {
    console.error("[v0] Error getting contacto:", error)
    return { contacto: null, error: error.message }
  }

  return { contacto: data, error: null }
}

export async function updateEstablecimiento(
  cue: number,
  data: { direccion?: string; lat?: number | null; lon?: number | null },
) {
  const supabase = await createClient()

  const { error } = await supabase.from("establecimientos").update(data).eq("cue", cue)

  if (error) {
    console.error("[v0] Error updating establecimiento:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function updateContacto(
  cue: number,
  data: { nombre?: string; apellido?: string; cargo?: string; telefono?: string; correo?: string },
) {
  const supabase = await createClient()

  const { error } = await supabase.from("contactos").update(data).eq("cue", cue)

  if (error) {
    console.error("[v0] Error updating contacto:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function createContacto(
  cue: number,
  data: { nombre: string; apellido: string; cargo?: string; telefono?: string; correo?: string },
) {
  const supabase = await createClient()

  const { error } = await supabase.from("contactos").insert({ cue, ...data })

  if (error) {
    console.error("[v0] Error creating contacto:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
