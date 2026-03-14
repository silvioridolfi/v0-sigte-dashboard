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
      <h2 className="text-xl font-semibold text-pba-blue">Tu Distrito: {distritoLabel}</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Establecimientos</CardTitle>
            <School className="h-5 w-5 text-pba-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pba-blue">{kpis.total_escuelas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Escuelas en el distrito</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Matrícula</CardTitle>
            <UsersIcon className="h-5 w-5 text-pba-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pba-cyan">{kpis.total_matricula.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Estudiantes</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitas Planeadas</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{kpis.visitas_planeadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Pendientes de realizar</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitas Cerradas</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{kpis.visitas_cerradas}</div>
            <p className="text-xs text-muted-foreground mt-1">Completadas con acta</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Visitas Vencidas</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{kpis.visitas_vencidas}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
