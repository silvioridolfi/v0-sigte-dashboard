export type Usuario = {
  id: string
  nombre: string
  email: string
  rol: "FED" | "CED"
  distrito: string
  genero: "M" | "F" | null
}

export type Establecimiento = {
  id: string
  cue: number
  nombre: string
  distrito: string
  direccion: string | null
  ciudad: string | null
  nivel: string | null
  modalidad: string | null
  turnos: string | null
  matricula: number | null
  lat: number | null
  lon: number | null
}

export type VisitaEstado = "PLANEADA" | "CERRADA_CON_ACTA" | "VENCIDA"
export type VisitaTipo = "TECNICA" | "PEDAGOGICA" | "MIXTA" | "ADMIN"
export type RolEnVisita = "RESPONSABLE" | "ACOMPANANTE"

export type Visita = {
  id: string
  cue: number
  titulo: string
  descripcion: string | null
  tipo: VisitaTipo
  estado: VisitaEstado
  fecha_inicio: string
  fecha_fin: string | null
  distrito: string
  creado_por: string
  created_at: string
  updated_at: string
}

export type ReunionAmbito = "REGIONAL" | "DISTRITAL"

export type Reunion = {
  id: string
  titulo: string
  descripcion: string | null
  ambito: ReunionAmbito
  distrito: string | null
  fecha_inicio: string
  fecha_fin: string | null
  creado_por: string
  created_at: string
  updated_at: string
}

export type EventoCalendario = {
  id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string | null
  tipo_evento: "VISITA" | "REUNION"
  estado: VisitaEstado | null
  color_calendario: string
  tiene_acta: boolean | null
  acta_archivo_url: string | null
  acta_fecha_subida: string | null
  cue: number | null
  distrito: string | null
}

export type KPITrabajo = {
  usuario_id: string
  nombre: string
  distrito: string
  rol: string
  genero: string | null
  visitas_planeadas: number
  visitas_cerradas: number
  visitas_vencidas: number
  visitas_total: number
}
