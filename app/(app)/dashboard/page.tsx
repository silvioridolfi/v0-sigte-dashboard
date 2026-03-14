import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { School, MapPin, UsersIcon, TrendingUp, Calendar } from "lucide-react"
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
        <h1 className="text-3xl font-bold text-[#417099] mb-1">Dashboard Principal</h1>
        <p className="text-sm text-slate-500">Sistema Integral de Gestión Territorial Educativa</p>
      </div>

      {isCED && jefaturaRegional && <JefaturaCard jefatura={jefaturaRegional} tipo="Regional" />}
      {isFED && jefaturaDistrital && <JefaturaCard jefatura={jefaturaDistrital} tipo="Distrital" />}
      {isFED && kpisDistrito && <DistritoKPIs kpis={kpisDistrito} distritos={userDistricts} />}

      {(isCED || isRegional) && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[#417099]">Métricas Generales</h2>
            <p className="text-sm text-slate-500">Resumen estadístico del sistema</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00AEC3] to-[#417099]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-sm font-medium text-slate-600">Total Escuelas</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00AEC3]/10">
                  <School className="h-4 w-4 text-[#00AEC3]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#417099]">{totalEscuelas.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Establecimientos educativos</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#417099] to-[#00AEC3]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-sm font-medium text-slate-600">Total Distritos</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#417099]/10">
                  <MapPin className="h-4 w-4 text-[#417099]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#00AEC3]">{totalDistritos}</div>
                <p className="text-xs text-slate-500 mt-1">Distritos educativos</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border border-slate-200/60 shadow-md hover:shadow-lg transition-shadow bg-white">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e81f76] to-[#417099]" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5">
                <CardTitle className="text-sm font-medium text-slate-600">Matrícula Total</CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e81f76]/10">
                  <UsersIcon className="h-4 w-4 text-[#e81f76]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-[#e81f76]">{totalMatricula.toLocaleString()}</div>
                <p className="text-xs text-slate-500 mt-1">Estudiantes en el sistema</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <KPIsPersonalesSection />

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#417099]">Accesos Rápidos</h2>
          <p className="text-sm text-slate-500">Navega a las secciones principales del sistema</p>
        </div>
        <Card className="relative overflow-hidden border border-slate-200/60 shadow-md bg-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00AEC3] to-[#e81f76]" />
          <CardContent className="pt-6 grid gap-3 md:grid-cols-2">
            {[
              { href: "/calendario", icon: Calendar, label: "Calendario", desc: "Ver visitas y reuniones" },
              { href: "/establecimientos", icon: School, label: "Establecimientos", desc: "Buscar y editar escuelas" },
              ...(canSeeReuniones ? [{ href: "/reuniones", icon: UsersIcon, label: "Reuniones", desc: "Gestionar reuniones" }] : []),
              { href: "/metricas", icon: TrendingUp, label: "Métricas", desc: "Estadísticas de trabajo" },
            ].map(({ href, icon: Icon, label, desc }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-[#00AEC3] hover:shadow-md transition-all bg-slate-50/50"
              >
                <div className="h-10 w-10 rounded-full bg-[#00AEC3]/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-[#00AEC3]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{label}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
