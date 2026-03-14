import { getReuniones } from "@/lib/actions/reuniones"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"

export default async function ReunionesPage() {
  const { reuniones } = await getReuniones()
  const activeUser = await getActiveUserServer()
  const canCreate = canManageReuniones(activeUser)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pba-blue mb-2">Reuniones</h1>
          <p className="text-muted-foreground">
            {canCreate ? "Gestiona las reuniones de equipo" : "Visualiza las reuniones de equipo"}
          </p>
        </div>
        {canCreate && (
          <Button asChild className="bg-pba-cyan hover:bg-pba-cyan/90">
            <Link href="/reuniones/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reunión
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reuniones.map((reunion: any) => (
          <Link key={reunion.id} href={`/reuniones/${reunion.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg">{reunion.titulo}</CardTitle>
                  <Badge className="bg-pba-blue text-white shrink-0">{reunion.ambito}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-pba-blue mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(reunion.fecha_inicio), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <p className="text-muted-foreground">
                      {format(new Date(reunion.fecha_inicio), "HH:mm", { locale: es })}
                      {reunion.fecha_fin && ` - ${format(new Date(reunion.fecha_fin), "HH:mm", { locale: es })}`}
                    </p>
                  </div>
                </div>

                {reunion.distrito && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{reunion.distrito}</span>
                  </div>
                )}

                {reunion.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{reunion.descripcion}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}

        {reuniones.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-muted-foreground">No hay reuniones registradas</p>
          </div>
        )}
      </div>
    </div>
  )
}
