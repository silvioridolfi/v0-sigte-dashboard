"use client"

import { useEffect, useState } from "react"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { getKPIsPersonales, getKPIsEquipo } from "@/lib/actions/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

export function KPIsPersonalesSection() {
  const { activeUser } = useActiveUser()
  const [personalKPIs, setPersonalKPIs] = useState<any>(null)
  const [teamKPIs, setTeamKPIs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadKPIs() {
      if (!activeUser) return

      setLoading(true)

      if (activeUser.rol === "FED") {
        const { kpis } = await getKPIsPersonales(activeUser.id)
        setPersonalKPIs(kpis)
      } else if (activeUser.rol === "CED") {
        const { kpis } = await getKPIsEquipo(activeUser.distrito)
        setTeamKPIs(kpis)
      }

      setLoading(false)
    }

    loadKPIs()
  }, [activeUser])

  if (!activeUser) return null

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (activeUser.rol === "FED" && personalKPIs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-pba-blue">Tu Trabajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{personalKPIs.visitas_planeadas || 0}</div>
                <p className="text-sm text-muted-foreground">Visitas Planeadas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{personalKPIs.visitas_cerradas || 0}</div>
                <p className="text-sm text-muted-foreground">Visitas Cerradas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{personalKPIs.visitas_vencidas || 0}</div>
                <p className="text-sm text-muted-foreground">Visitas Vencidas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activeUser.rol === "CED" && teamKPIs.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-pba-blue">Trabajo del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead className="text-center">Planeadas</TableHead>
                <TableHead className="text-center">Cerradas</TableHead>
                <TableHead className="text-center">Vencidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamKPIs.map((kpi) => (
                <TableRow key={kpi.usuario_id}>
                  <TableCell className="font-medium">{kpi.nombre}</TableCell>
                  <TableCell className="text-center">{kpi.visitas_planeadas || 0}</TableCell>
                  <TableCell className="text-center">{kpi.visitas_cerradas || 0}</TableCell>
                  <TableCell className="text-center">{kpi.visitas_vencidas || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return null
}
