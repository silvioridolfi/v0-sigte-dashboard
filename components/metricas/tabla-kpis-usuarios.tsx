"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { KPITrabajo } from "@/lib/types/database"

export function TablaKPIsUsuarios({ kpis }: { kpis: KPITrabajo[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Distrito</TableHead>
            <TableHead className="text-right">Planeadas</TableHead>
            <TableHead className="text-right">Cerradas</TableHead>
            <TableHead className="text-right">Vencidas</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kpis.map((kpi) => (
            <TableRow key={kpi.usuario_id}>
              <TableCell className="font-medium">{kpi.nombre}</TableCell>
              <TableCell>
                <Badge variant="outline">{kpi.rol}</Badge>
              </TableCell>
              <TableCell>{kpi.distrito}</TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-md bg-yellow-100 text-yellow-900 font-medium text-sm">
                  {kpi.visitas_planeadas}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-md bg-green-100 text-green-900 font-medium text-sm">
                  {kpi.visitas_cerradas}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-md bg-red-100 text-red-900 font-medium text-sm">
                  {kpi.visitas_vencidas}
                </span>
              </TableCell>
              <TableCell className="text-right font-bold">{kpi.visitas_total}</TableCell>
            </TableRow>
          ))}
          {kpis.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay datos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
