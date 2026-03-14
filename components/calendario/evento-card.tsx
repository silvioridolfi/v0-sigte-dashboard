"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { EventoCalendario } from "@/lib/types/database"
import { getEventBgClass, getEventBadgeClass } from "@/lib/utils/calendar-colors"

export function EventoCard({
  evento,
  onClick,
}: {
  evento: EventoCalendario
  onClick?: () => void
}) {
  const bgClass = getEventBgClass(evento.color_calendario)
  const badgeClass = getEventBadgeClass(evento.color_calendario)

  return (
    <Card className={`p-3 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${bgClass}`} onClick={onClick}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2">{evento.titulo}</h3>
          <Badge className={`${badgeClass} text-xs shrink-0`}>
            {evento.tipo_evento === "VISITA" ? "Visita" : "Reunión"}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(evento.fecha_inicio), "HH:mm", { locale: es })}
            {evento.fecha_fin && ` - ${format(new Date(evento.fecha_fin), "HH:mm", { locale: es })}`}
          </span>
        </div>

        {evento.distrito && (
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3 w-3" />
            <span>{evento.distrito}</span>
          </div>
        )}

        {evento.cue && (
          <div className="text-xs">
            <span className="font-medium">CUE:</span> {evento.cue}
          </div>
        )}

        {evento.tiene_acta && (
          <div className="flex items-center gap-1 text-xs">
            <FileText className="h-3 w-3 text-green-600" />
            <span className="text-green-600 font-medium">Acta cargada</span>
          </div>
        )}

        {evento.estado === "VENCIDA" && <div className="text-xs font-semibold text-red-600">Vencida - Sin acta</div>}
      </div>
    </Card>
  )
}
