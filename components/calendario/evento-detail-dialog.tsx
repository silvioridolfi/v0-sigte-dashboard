"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, FileText, School, ExternalLink, Edit } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { EventoCalendario } from "@/lib/types/database"
import { getEventBadgeClass } from "@/lib/utils/calendar-colors"
import { toArgentinaTime } from "@/lib/utils/timezone-helpers"
import Link from "next/link"

export function EventoDetailDialog({
  evento,
  open,
  onOpenChange,
  onEdit,
}: {
  evento: EventoCalendario
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
}) {
  const badgeClass = getEventBadgeClass(evento.color_calendario)
  const fechaInicio = toArgentinaTime(evento.fecha_inicio)
  const fechaFin = evento.fecha_fin ? toArgentinaTime(evento.fecha_fin) : null

  const canEdit = evento.tipo_evento === "VISITA" ? !evento.tiene_acta : true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl">{evento.titulo}</DialogTitle>
              <Badge className={badgeClass}>{evento.tipo_evento === "VISITA" ? "Visita" : "Reunión"}</Badge>
            </div>
            {evento.estado && (
              <Badge
                variant={
                  evento.estado === "CERRADA_CON_ACTA"
                    ? "default"
                    : evento.estado === "VENCIDA"
                      ? "destructive"
                      : "secondary"
                }
              >
                {evento.estado === "PLANEADA"
                  ? "Planeada"
                  : evento.estado === "CERRADA_CON_ACTA"
                    ? "Cerrada con acta"
                    : "Vencida"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-pba-blue mt-0.5" />
            <div>
              <p className="font-medium">Fecha y hora</p>
              <p className="text-sm text-muted-foreground">
                {format(fechaInicio, "EEEE, d 'de' MMMM 'de' yyyy - HH:mm", {
                  locale: es,
                })}
                {fechaFin && (
                  <>
                    {" "}
                    hasta{" "}
                    {format(fechaFin, "HH:mm", {
                      locale: es,
                    })}
                  </>
                )}
              </p>
            </div>
          </div>

          {evento.descripcion && (
            <div>
              <p className="font-medium mb-1">Descripción</p>
              <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
            </div>
          )}

          {evento.distrito && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-pba-blue mt-0.5" />
              <div>
                <p className="font-medium">Distrito</p>
                <p className="text-sm text-muted-foreground">{evento.distrito}</p>
              </div>
            </div>
          )}

          {evento.cue && (
            <div className="flex items-start gap-3">
              <School className="h-5 w-5 text-pba-blue mt-0.5" />
              <div>
                <p className="font-medium">CUE</p>
                <p className="text-sm text-muted-foreground">{evento.cue}</p>
              </div>
            </div>
          )}

          {evento.tiene_acta && evento.acta_archivo_url && (
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md border border-green-200">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Acta cargada</p>
                <p className="text-sm text-green-700">
                  {evento.acta_fecha_subida &&
                    format(new Date(evento.acta_fecha_subida), "d 'de' MMMM 'de' yyyy - HH:mm", {
                      locale: es,
                    })}
                </p>
                <Button size="sm" variant="outline" className="mt-2 bg-transparent" asChild>
                  <a href={evento.acta_archivo_url} target="_blank" rel="noopener noreferrer">
                    Ver acta
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {evento.estado === "VENCIDA" && !evento.tiene_acta && (
            <div className="p-3 bg-red-50 rounded-md border border-red-200">
              <p className="font-medium text-red-900">Visita vencida</p>
              <p className="text-sm text-red-700">Esta visita lleva más de 5 días sin acta cargada</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {evento.tipo_evento === "VISITA" && evento.cue && (
              <>
                <Button asChild className="bg-pba-cyan hover:bg-pba-cyan/90">
                  <Link href={`/visitas/${evento.id}`}>Ver detalles completos</Link>
                </Button>
                {canEdit && (
                  <Button variant="outline" asChild>
                    <Link href={`/visitas/${evento.id}/editar`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href={`/establecimientos/${evento.cue}`}>Ver establecimiento</Link>
                </Button>
              </>
            )}
            {evento.tipo_evento === "REUNION" && (
              <>
                <Button asChild className="bg-pba-cyan hover:bg-pba-cyan/90">
                  <Link href={`/reuniones/${evento.id}`}>Ver detalles completos</Link>
                </Button>
                {canEdit && (
                  <Button variant="outline" asChild>
                    <Link href={`/reuniones/${evento.id}/editar`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
