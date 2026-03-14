import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarView } from "@/components/calendario/calendar-view"
import { CalendarViewEquipo } from "@/components/calendario/calendar-view-equipo"
import { Button } from "@/components/ui/button"
import { CalendarPlus, Users } from "lucide-react"
import Link from "next/link"
import { getActiveUserServer } from "@/lib/utils/get-active-user-server"
import { canManageReuniones } from "@/lib/utils/permisos"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"

export default async function CalendarioPage() {
  const activeUser = await getActiveUserServer()
  const canCreateReunion = canManageReuniones(activeUser)
  const isCEDorADMIN = activeUser?.rol === "CED" || activeUser?.rol === "ADMIN"

  const actions = (
    <div className="flex gap-2">
      <Button asChild className="bg-pba-cyan hover:bg-pba-cyan/90">
        <Link href="/visitas/nueva">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Nueva Visita
        </Link>
      </Button>
      {canCreateReunion && (
        <Button asChild variant="outline">
          <Link href="/reuniones/nueva">
            <Users className="h-4 w-4 mr-2" />
            Nueva Reunión
          </Link>
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        description="Gestiona tus visitas y reuniones del equipo territorial"
        actions={actions}
      />

      {isCEDorADMIN ? (
        <Tabs defaultValue="mi-agenda" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mi-agenda">Mi Agenda</TabsTrigger>
            <TabsTrigger value="equipo">Equipo</TabsTrigger>
          </TabsList>

          <TabsContent value="mi-agenda" className="space-y-6">
            <LegendCards />
            <Card className="rounded-2xl">
              <CardContent className="pt-6">
                <CalendarView />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipo" className="space-y-6">
            <LegendCards />
            <Card className="rounded-2xl">
              <CardContent className="pt-6">
                <CalendarViewEquipo />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-6">
          <LegendCards />
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <CalendarView />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function LegendCards() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="rounded-2xl">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-amber-500" />
            <div>
              <p className="text-sm font-medium">Planeadas</p>
              <p className="text-xs text-muted-foreground">Visitas sin acta</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-medium">Cerradas</p>
              <p className="text-xs text-muted-foreground">Acta cargada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-pba-pink" />
            <div>
              <p className="text-sm font-medium">Vencidas</p>
              <p className="text-xs text-muted-foreground">+5 días sin acta</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-pba-blue" />
            <div>
              <p className="text-sm font-medium">Reuniones</p>
              <p className="text-xs text-muted-foreground">Reuniones de equipo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
