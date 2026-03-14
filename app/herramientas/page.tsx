import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Database, BarChart } from "lucide-react"

export default function HerramientasPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pba-blue mb-2">Herramientas</h1>
        <p className="text-muted-foreground">Utilidades y herramientas administrativas del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-pba-cyan" />
              </div>
              <div>
                <CardTitle>Reportes</CardTitle>
                <CardDescription>Generar informes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Genera reportes personalizados de visitas y métricas.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-pba-cyan" />
              </div>
              <div>
                <CardTitle>Exportar Datos</CardTitle>
                <CardDescription>Descargar información</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Exporta datos de establecimientos y visitas en formato CSV.</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-pba-cyan" />
              </div>
              <div>
                <CardTitle>Estadísticas</CardTitle>
                <CardDescription>Análisis avanzado</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Visualiza estadísticas avanzadas y análisis de datos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
