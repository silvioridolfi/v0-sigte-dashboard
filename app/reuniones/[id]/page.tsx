import { notFound, redirect } from "next/navigation"
import { getReunion } from "@/lib/actions/reuniones"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, MapPin, ArrowLeft, Edit } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { EliminarReunionButton } from "@/components/reuniones/eliminar-reunion-button"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"

export default async function ReunionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "nueva") {
    redirect("/reuniones/nueva")
  }

  const { reunion, participantes, error } = await getReunion(id)

  if (error || !reunion) {
    notFound()
  }

  const activeUser = await getActiveUserServer()
  const canEdit = canManageReuniones(activeUser)

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/reuniones">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{reunion.titulo}</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500 text-white">{reunion.ambito === "REGIONAL" ? "Regional" : "Distrital"}</Badge>
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/reuniones/${id}/editar`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          <EliminarReunionButton reunionId={id} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pba-blue" />
              Fecha y Hora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Inicio</p>
              <p className="font-medium">
                {format(new Date(reunion.fecha_inicio), "EEEE, d 'de' MMMM 'de' yyyy - HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            {reunion.fecha_fin && (
              <div>
                <p className="text-sm text-muted-foreground">Fin</p>
                <p className="font-medium">
                  {format(new Date(reunion.fecha_fin), "EEEE, d 'de' MMMM 'de' yyyy - HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {reunion.distrito && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pba-blue" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{reunion.distrito}</p>
            </CardContent>
          </Card>
        )}

        {reunion.descripcion && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{reunion.descripcion}</p>
            </CardContent>
          </Card>
        )}

        <Card className={!reunion.distrito ? "lg:col-span-2" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-pba-blue" />
              Participantes ({participantes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {participantes.map((p: any) => (
                <div key={p.usuario_id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{p.usuarios.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.usuarios.rol} - {p.usuarios.distrito}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
