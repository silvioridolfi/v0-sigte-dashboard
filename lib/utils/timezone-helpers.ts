import { toZonedTime, fromZonedTime } from "date-fns-tz"

const ARGENTINA_TZ = "America/Argentina/Buenos_Aires"

/**
 * Convierte fecha UTC a timezone de Argentina
 */
export function toArgentinaTime(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return toZonedTime(dateObj, ARGENTINA_TZ)
}

/**
 * Convierte fecha de Argentina a UTC para guardar en DB
 */
export function fromArgentinaTime(date: Date | string): Date {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return fromZonedTime(dateObj, ARGENTINA_TZ)
}

/**
 * Formatea un datetime-local input considerando timezone de Argentina
 */
export function formatDatetimeLocal(date: Date | string): string {
  const argDate = toArgentinaTime(date)
  // Formato: YYYY-MM-DDTHH:mm
  return argDate.toISOString().slice(0, 16)
}

/**
 * Convierte datetime-local a ISO string UTC para DB
 */
export function datetimeLocalToUTC(datetimeLocal: string): string {
  // datetime-local viene como "YYYY-MM-DDTHH:mm"
  // Lo interpretamos como hora de Argentina
  const argDate = new Date(datetimeLocal)
  const utcDate = fromArgentinaTime(argDate)
  return utcDate.toISOString()
}

/**
 * Convierte fecha UTC de DB a datetime-local format
 */
export function utcToDatetimeLocal(utcDate: string): string {
  const argDate = toArgentinaTime(utcDate)
  // Formato: YYYY-MM-DDTHH:mm
  const year = argDate.getFullYear()
  const month = String(argDate.getMonth() + 1).padStart(2, "0")
  const day = String(argDate.getDate()).padStart(2, "0")
  const hours = String(argDate.getHours()).padStart(2, "0")
  const minutes = String(argDate.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}
