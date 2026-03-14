"use server"

import type { Usuario } from "@/lib/types/database"

export type Rol = "FED" | "CED" | "ADMIN"

export interface PermisoEvento {
  id: string
  creado_por: string
  tipo: "visita" | "reunion"
  tiene_acta?: boolean
}

// Verificar si el usuario puede ver reuniones
export function canViewReuniones(user: Usuario | null): boolean {
  if (!user) return false
  return user.rol === "CED" || user.rol === "ADMIN"
}

// Verificar si el usuario puede gestionar (crear/editar/eliminar) reuniones
export function canManageReuniones(user: Usuario | null): boolean {
  if (!user) return false
  return user.rol === "CED" || user.rol === "ADMIN"
}

// Verificar si el usuario puede ver un evento específico
export function canViewEvento(user: Usuario | null, evento: PermisoEvento, esParticipante: boolean): boolean {
  if (!user) return false

  // ADMIN y CED pueden ver todo
  if (user.rol === "CED" || user.rol === "ADMIN") {
    return true
  }

  // FED solo puede ver si es creador o participante
  if (user.rol === "FED") {
    return evento.creado_por === user.id || esParticipante
  }

  return false
}

// Verificar si el usuario puede editar un evento
export function canEditEvento(user: Usuario | null, evento: PermisoEvento): boolean {
  if (!user) return false

  // Reuniones: solo CED/ADMIN
  if (evento.tipo === "reunion") {
    return canManageReuniones(user)
  }

  // Visitas: solo el creador, y solo si no tiene acta
  if (evento.tipo === "visita") {
    const esCreador = evento.creado_por === user.id
    const noTieneActa = !evento.tiene_acta
    return esCreador && noTieneActa
  }

  return false
}

// Verificar si el usuario puede eliminar un evento
export function canDeleteEvento(user: Usuario | null, evento: PermisoEvento): boolean {
  if (!user) return false

  // Reuniones: solo CED/ADMIN
  if (evento.tipo === "reunion") {
    return canManageReuniones(user)
  }

  // Visitas: solo el creador, y solo si no tiene acta
  if (evento.tipo === "visita") {
    const esCreador = evento.creado_por === user.id
    const noTieneActa = !evento.tiene_acta
    return esCreador && noTieneActa
  }

  return false
}

// Verificar si debe mostrar el módulo de reuniones en navegación
export function shouldShowReunionesModule(user: Usuario | null): boolean {
  return canViewReuniones(user)
}
