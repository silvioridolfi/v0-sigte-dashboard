// Helpers puros de horarios — sin "use server", usables en client components

const DIAS_SEMANA = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

export function getDiaSemanaLabel(dia: number): string {
  return DIAS_SEMANA[dia] || ""
}
