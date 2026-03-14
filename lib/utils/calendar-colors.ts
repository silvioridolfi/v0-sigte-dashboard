type EstadoVisita = "PLANEADA" | "CERRADA" | "VENCIDA"

export function getEventStyle(tipoEvento: string, estado?: string) {
  // Reuniones siempre en azul
  if (tipoEvento === "REUNION") {
    return {
      color: "AZUL",
      bgClass: "bg-blue-100 border-blue-500 text-blue-900",
      badgeClass: "bg-blue-500 text-white",
      label: "Reunión",
    }
  }

  // Visitas según estado
  switch (estado) {
    case "CERRADA":
      return {
        color: "VERDE",
        bgClass: "bg-green-100 border-green-500 text-green-900",
        badgeClass: "bg-green-500 text-white",
        label: "Cerrada",
      }
    case "VENCIDA":
      return {
        color: "ROJO",
        bgClass: "bg-red-100 border-red-500 text-red-900",
        badgeClass: "bg-red-500 text-white",
        label: "Vencida",
      }
    case "PLANEADA":
    default:
      return {
        color: "AMARILLO",
        bgClass: "bg-yellow-100 border-yellow-400 text-yellow-900",
        badgeClass: "bg-yellow-500 text-white",
        label: "Planeada",
      }
  }
}

export function getEventColor(evento: { tipo_evento: string; color_calendario: string }) {
  // Usar el color_calendario que ya viene calculado desde la vista
  return evento.color_calendario || "#00AEC3"
}

export function getEventBgClass(color: string) {
  const colorMap: Record<string, string> = {
    AMARILLO: "bg-yellow-100 border-yellow-400 text-yellow-900",
    VERDE: "bg-green-100 border-green-500 text-green-900",
    ROJO: "bg-red-100 border-red-500 text-red-900",
    AZUL: "bg-blue-100 border-blue-500 text-blue-900",
  }
  return colorMap[color] || "bg-blue-100 border-blue-500 text-blue-900"
}

export function getEventBadgeClass(color: string) {
  const colorMap: Record<string, string> = {
    AMARILLO: "bg-yellow-500 text-white",
    VERDE: "bg-green-500 text-white",
    ROJO: "bg-red-500 text-white",
    AZUL: "bg-blue-500 text-white",
  }
  return colorMap[color] || "bg-blue-500 text-white"
}
