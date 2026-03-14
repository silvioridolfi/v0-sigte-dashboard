"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { School, CheckCircle2, Clock, AlertCircle, UsersIcon } from "lucide-react"

interface DistritoKPIsProps {
  kpis: {
    total_escuelas: number
    total_matricula: number
    visitas_planeadas: number
    visitas_cerradas: number
    visitas_vencidas: number
  }
  distritos: string[]
}

export function DistritoKPIs({ kpis, distritos }: DistritoKPIsProps) {
  const distritoLabel = distritos.length === 1 ? distritos[0] : `${distritos.length} Distritos`

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-[#417099]">Tu Distrito: {distritoLabel}</h2>
        <p className="text-sm text-slate-500">Resumen territorial</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00AEC3] to-[#417099]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-slate-600">Establecimientos</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00AEC3]/10">
              <School className="h-4 w-4 text-[#00AEC3]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#417099]">{kpis.total_escuelas.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Escuelas en el distrito</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#417099] to-[#00AEC3]" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-slate-600">Matrícula</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#417099]/10">
              <UsersIcon className="h-4 w-4 text-[#417099]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#00AEC3]">{kpis.total_matricula.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Estudiantes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-slate-600">Visitas Planeadas</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{kpis.visitas_planeadas}</div>
            <p className="text-xs text-slate-500 mt-1">Pendientes de realizar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-slate-600">Visitas Cerradas</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{kpis.visitas_cerradas}</div>
            <p className="text-xs text-slate-500 mt-1">Completadas con acta</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e81f76] to-red-500" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
            <CardTitle className="text-sm font-medium text-slate-600">Visitas Vencidas</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{kpis.visitas_vencidas}</div>
            <p className="text-xs text-slate-500 mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
