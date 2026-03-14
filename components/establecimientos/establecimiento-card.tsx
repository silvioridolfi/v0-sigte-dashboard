import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, School, Users, Phone, Mail } from "lucide-react"
import Link from "next/link"

type EstablecimientoData = {
  id: string
  cue: number
  predio: number | null
  nombre: string
  distrito: string
  ciudad: string | null
  direccion: string | null
  nivel: string | null
  modalidad: string | null
  turnos: string | null
  matricula: number | null
  contacto_nombre: string | null
  contacto_apellido: string | null
  contacto_cargo: string | null
  telefono: string | null
  correo: string | null
  plan_enlace: string | null
  plan_piso_tecnologico: string | null
}

export function EstablecimientoCard({ establecimiento }: { establecimiento: EstablecimientoData }) {
  return (
    <Link href={`/establecimientos/${establecimiento.cue}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg">{establecimiento.nombre}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <School className="h-4 w-4" />
                <span>CUE: {establecimiento.cue}</span>
                {establecimiento.predio && <span>| Predio: {establecimiento.predio}</span>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-pba-blue mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{establecimiento.distrito}</p>
              {establecimiento.ciudad && <p className="text-muted-foreground">{establecimiento.ciudad}</p>}
              {establecimiento.direccion && (
                <p className="text-muted-foreground text-xs">{establecimiento.direccion}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {establecimiento.nivel && (
              <Badge variant="secondary" className="text-xs">
                {establecimiento.nivel}
              </Badge>
            )}
            {establecimiento.modalidad && (
              <Badge variant="outline" className="text-xs">
                {establecimiento.modalidad}
              </Badge>
            )}
            {establecimiento.turnos && (
              <Badge variant="outline" className="text-xs">
                {establecimiento.turnos}
              </Badge>
            )}
          </div>

          {establecimiento.matricula && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Matrícula: {establecimiento.matricula.toLocaleString()}</span>
            </div>
          )}

          {(establecimiento.contacto_nombre || establecimiento.contacto_apellido) && (
            <div className="pt-2 border-t space-y-1">
              <p className="text-sm font-medium">
                {establecimiento.contacto_nombre} {establecimiento.contacto_apellido}
                {establecimiento.contacto_cargo && (
                  <span className="text-muted-foreground"> - {establecimiento.contacto_cargo}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {establecimiento.telefono && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {establecimiento.telefono}
                  </div>
                )}
                {establecimiento.correo && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {establecimiento.correo}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
