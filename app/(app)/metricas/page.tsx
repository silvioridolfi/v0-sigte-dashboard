import { getKPIsTrabajo, getKPIsGlobales, getDistritosUnicos } from "@/lib/actions/metricas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KPICard } from "@/components/metricas/kpi-card"
import { TablaKPIsUsuarios } from "@/components/metricas/tabla-kpis-usuarios"
import { School, MapPin, Users } from "lucide-react"
import { FiltroDistrito } from "@/components/metricas/filtro-distrito"

export default async function MetricasPage({ searchParams }: { searchParams: Promise<{ distrito?: string }> }) {
  const { distrito } = await searchParams
  const { kpis } = await getKPIsTrabajo(distrito)
  const { kpis: kpisGlobales } = await getKPIsGlobales()
  const { distritos } = await getDistritosUnicos()

  // Calcular totales para el filtro actual
  const totales = kpis.reduce(
    (acc, kpi) => ({
      planeadas: acc.planeadas + Number(kpi.visitas_planeadas),
      cerradas: acc.cerradas + Number(kpi.visitas_cerradas),
      vencidas: acc.vencidas + Number(kpi.visitas_vencidas),
      total: acc.total + Number(kpi.visitas_total),
    }),
    { planeadas: 0, cerradas: 0, vencidas: 0, total: 0 },
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pba-blue mb-2">Métricas y Estadísticas</h1>
        <p className="text-muted-foreground">Visualiza el desempeño del equipo</p>
      </div>

      {kpisGlobales && (
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Establecimientos"
            value={kpisGlobales.total_establecimientos?.toLocaleString() || "0"}
            icon={School}
            description="Total registrados"
          />
          <KPICard
            title="Distritos"
            value={kpisGlobales.distritos_distintos?.toLocaleString() || "0"}
            icon={MapPin}
            description="Cobertura territorial"
          />
          <KPICard
            title="Matrícula Total"
            value={kpisGlobales.matricula_total?.toLocaleString() || "0"}
            icon={Users}
            description="Varones + Mujeres"
          />
        </div>
      )}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-pba-blue">Métricas por Usuario</CardTitle>
              <CardDescription>Visitas realizadas por cada miembro del equipo</CardDescription>
            </div>
            <FiltroDistrito distritos={distritos} distritoActual={distrito} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <KPICard
                title="Visitas Planeadas"
                value={totales.planeadas}
                icon={School}
                color="text-pba-blue"
                description="Sin acta cargada"
              />
              <KPICard
                title="Visitas Cerradas"
                value={totales.cerradas}
                icon={School}
                color="text-pba-cyan"
                description="Con acta"
              />
              <KPICard
                title="Visitas Vencidas"
                value={totales.vencidas}
                icon={School}
                color="text-pba-pink"
                description="+5 días sin acta"
              />
              <KPICard
                title="Total Visitas"
                value={totales.total}
                icon={School}
                color="text-pba-blue"
                description="Todas las visitas"
              />
            </div>

            <TablaKPIsUsuarios kpis={kpis} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
