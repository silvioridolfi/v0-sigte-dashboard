import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { School, MapPin, UsersIcon, TrendingUp } from "lucide-react"
import { getKPIsGlobales } from "@/lib/actions/dashboard"
import { KPIsPersonalesSection } from "@/components/dashboard/kpis-personales-section"
import { getJefaturaDistrital, getJefaturaRegional, getKPIsPorDistrito } from "@/lib/actions/organismos"
import { JefaturaCard } from "@/components/dashboard/jefatura-card"
import { DistritoKPIs } from "@/components/dashboard/distrito-kpis"
import { parseUserDistricts, isCEDOrRegional } from "@/lib/utils/distrito-helpers"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"
import { cookies } from "next/headers"

async function getActiveUserFromCookies() {
  const cookieStore = await cookies()
  const activeUserCookie = cookieStore.get("activeUser")

  if (!activeUserCookie) return null

  try {
    return JSON.parse(activeUserCookie.value)
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const { totalEscuelas, totalDistritos, totalMatricula } = await getKPIsGlobales()
  const activeUser = await getActiveUserServer()

  const userDistricts = activeUser ? parseUserDistricts(activeUser.distrito) : []
  const isRegional = activeUser ? isCEDOrRegional(activeUser.distrito) : true
  const isFED = activeUser?.rol === "FED"
  const isCED = activeUser?.rol === "CED"
  const canSeeReuniones = canManageReuniones(activeUser)

  let jefaturaDistrital = null
  let jefaturaRegional = null
  let kpisDistrito = null

  if (isFED && userDistricts.length > 0) {
    const { jefatura } = await getJefaturaDistrital(userDistricts)
    jefaturaDistrital = jefatura

    const { kpis } = await getKPIsPorDistrito(userDistricts)
    kpisDistrito = kpis
  } else if (isCED) {
    const { jefatura } = await getJefaturaRegional()
    jefaturaRegional = jefatura
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pba-blue mb-2">Dashboard Principal</h1>
        <p className="text-muted-foreground">Sistema Integral de Gestión Territorial Educativa</p>
      </div>

      {isCED && jefaturaRegional && <JefaturaCard jefatura={jefaturaRegional} tipo="Regional" />}

      {isFED && jefaturaDistrital && <JefaturaCard jefatura={jefaturaDistrital} tipo="Distrital" />}

      {isFED && kpisDistrito && <DistritoKPIs kpis={kpisDistrito} distritos={userDistricts} />}

      {(isCED || isRegional) && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-pba-blue rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Escuelas</CardTitle>
              <School className="h-5 w-5 text-pba-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pba-blue">{totalEscuelas.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Establecimientos educativos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pba-cyan rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Distritos</CardTitle>
              <MapPin className="h-5 w-5 text-pba-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pba-cyan">{totalDistritos}</div>
              <p className="text-xs text-muted-foreground mt-1">Distritos educativos</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-pba-blue rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matrícula Total</CardTitle>
              <UsersIcon className="h-5 w-5 text-pba-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pba-blue">{totalMatricula.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Estudiantes en el sistema</p>
            </CardContent>
          </Card>
        </div>
      )}

      <KPIsPersonalesSection />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-pba-blue">Accesos Rápidos</CardTitle>
          <CardDescription>Navega a las secciones principales del sistema</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <a
            href="/calendario"
            className="flex items-center gap-3 p-4 rounded-lg border hover:border-pba-cyan hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-pba-cyan" />
            </div>
            <div>
              <h3 className="font-semibold">Calendario</h3>
              <p className="text-sm text-muted-foreground">Ver visitas y reuniones</p>
            </div>
          </a>

          <a
            href="/establecimientos"
            className="flex items-center gap-3 p-4 rounded-lg border hover:border-pba-cyan hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
              <School className="h-5 w-5 text-pba-cyan" />
            </div>
            <div>
              <h3 className="font-semibold">Establecimientos</h3>
              <p className="text-sm text-muted-foreground">Buscar y editar escuelas</p>
            </div>
          </a>

          {canSeeReuniones && (
            <a
              href="/reuniones"
              className="flex items-center gap-3 p-4 rounded-lg border hover:border-pba-cyan hover:shadow-md transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
                <UsersIcon className="h-5 w-5 text-pba-cyan" />
              </div>
              <div>
                <h3 className="font-semibold">Reuniones</h3>
                <p className="text-sm text-muted-foreground">Gestionar reuniones</p>
              </div>
            </a>
          )}

          <a
            href="/metricas"
            className="flex items-center gap-3 p-4 rounded-lg border hover:border-pba-cyan hover:shadow-md transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-pba-cyan/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-pba-cyan" />
            </div>
            <div>
              <h3 className="font-semibold">Métricas</h3>
              <p className="text-sm text-muted-foreground">Estadísticas de trabajo</p>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
