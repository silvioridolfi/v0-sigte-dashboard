"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Phone, MapPin } from "lucide-react"
import { SigteMap } from "@/components/map/sigte-map"

interface JefaturaCardProps {
  jefatura: {
    nombre: string
    domicilio?: string | null
    localidad?: string | null
    distrito?: string | null
    telefono?: string | null
    email?: string | null
    contacto_nombre?: string | null
    contacto_apellido?: string | null
    contacto_cargo?: string | null
    latitud?: number | null
    longitud?: number | null
  }
  tipo: "Distrital" | "Regional"
}

export function JefaturaCard({ jefatura, tipo }: JefaturaCardProps) {
  const hasCoordinates = jefatura.latitud && jefatura.longitud

  return (
    <Card className="rounded-2xl border-l-4 border-l-pba-cyan">
      <CardHeader>
        <CardTitle className="text-pba-blue flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Jefatura {tipo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-pba-blue">{jefatura.nombre}</h3>
          {jefatura.distrito && <p className="text-sm text-muted-foreground">{jefatura.distrito}</p>}
        </div>

        {(jefatura.contacto_nombre || jefatura.contacto_apellido) && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Contacto</p>
            <p className="text-sm">
              {jefatura.contacto_nombre} {jefatura.contacto_apellido}
            </p>
            {jefatura.contacto_cargo && <p className="text-xs text-muted-foreground">{jefatura.contacto_cargo}</p>}
          </div>
        )}

        <div className="space-y-2 text-sm">
          {jefatura.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-pba-cyan" />
              <a href={`mailto:${jefatura.email}`} className="text-pba-cyan hover:underline">
                {jefatura.email}
              </a>
            </div>
          )}

          {jefatura.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-pba-cyan" />
              <span>{jefatura.telefono}</span>
            </div>
          )}

          {jefatura.domicilio && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-pba-cyan mt-0.5" />
              <span>
                {jefatura.domicilio}
                {jefatura.localidad && `, ${jefatura.localidad}`}
              </span>
            </div>
          )}
        </div>

        {hasCoordinates && (
          <div className="mt-4">
            <SigteMap lat={jefatura.latitud!} lon={jefatura.longitud!} nombre={jefatura.nombre} altura="h-48" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
