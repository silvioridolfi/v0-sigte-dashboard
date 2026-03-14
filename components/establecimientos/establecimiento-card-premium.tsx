"use client"

import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Phone, Mail, Building2, ArrowRight } from "lucide-react"

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
  varones: number | null
  mujeres: number | null
  matricula: number | null
  secciones: number | null
  contacto_nombre: string | null
  contacto_apellido: string | null
  contacto_cargo: string | null
  telefono: string | null
  correo: string | null
}

export function EstablecimientoCardPremium({
  establecimiento,
  onClick,
}: {
  establecimiento: EstablecimientoData
  onClick: () => void
}) {
  const matriculaTotal = establecimiento.matricula || (establecimiento.varones || 0) + (establecimiento.mujeres || 0)

  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 cursor-pointer"
    >
      <div className="bg-gradient-to-r from-pba-blue to-pba-cyan p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white/90 transition-colors">
              {establecimiento.nombre}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                CUE: {establecimiento.cue}
              </span>
              {establecimiento.predio && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                  Predio: {establecimiento.predio}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-pba-cyan mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{establecimiento.distrito}</p>
            {establecimiento.ciudad && <p className="text-sm text-gray-600">{establecimiento.ciudad}</p>}
            {establecimiento.direccion && <p className="text-sm text-gray-500 mt-1">{establecimiento.direccion}</p>}
          </div>
        </div>

        {(establecimiento.nivel || establecimiento.modalidad || establecimiento.turnos) && (
          <div className="flex flex-wrap gap-2">
            {establecimiento.nivel && (
              <Badge className="bg-pba-blue/10 text-pba-blue border-pba-blue/20 hover:bg-pba-blue/20">
                {establecimiento.nivel}
              </Badge>
            )}
            {establecimiento.modalidad && (
              <Badge variant="outline" className="border-gray-300">
                {establecimiento.modalidad}
              </Badge>
            )}
            {establecimiento.turnos && (
              <Badge variant="outline" className="border-gray-300">
                {establecimiento.turnos}
              </Badge>
            )}
          </div>
        )}

        {matriculaTotal > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pba-blue" />
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Matrícula</p>
                  <p className="text-lg font-bold text-gray-900">{matriculaTotal.toLocaleString()}</p>
                </div>
              </div>
              {establecimiento.varones !== null && establecimiento.mujeres !== null && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Varones</p>
                    <p className="font-semibold text-gray-700">{establecimiento.varones}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mujeres</p>
                    <p className="font-semibold text-gray-700">{establecimiento.mujeres}</p>
                  </div>
                </div>
              )}
            </div>
            {establecimiento.secciones && (
              <p className="text-xs text-gray-600 mt-2">
                <Building2 className="h-3 w-3 inline mr-1" />
                {establecimiento.secciones} secciones
              </p>
            )}
          </div>
        )}

        {(establecimiento.contacto_nombre || establecimiento.contacto_apellido) && (
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <p className="text-sm font-semibold text-gray-900">
              {establecimiento.contacto_nombre} {establecimiento.contacto_apellido}
              {establecimiento.contacto_cargo && (
                <span className="text-gray-600 font-normal"> - {establecimiento.contacto_cargo}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-600">
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

      <div className="px-5 pb-5">
        <button
          className="w-full py-2.5 px-4 bg-pba-cyan text-white font-medium rounded-lg hover:bg-pba-cyan/90 transition-all duration-200 flex items-center justify-center gap-2 group"
          aria-label={`Ver detalles de ${establecimiento.nombre}`}
        >
          <span>Ver ficha completa</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
