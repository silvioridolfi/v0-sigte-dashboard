import { notFound, redirect } from "next/navigation"
import { getVisita } from "@/lib/actions/visitas"
import { getEstablecimientoByCUE } from "@/lib/actions/establecimientos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, FileText, School, ArrowLeft, Lock, Edit } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { SubirActaButton } from "@/components/visitas/subir-acta-button"

export default async function VisitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id === "nueva") {
    redirect("/visitas/nueva")
  }

  const { visita, participantes, acta, error } = await getVisita(id)

  if (error || !visita) {
    notFound()
  }

  const { establecimiento } = await getEstablecimientoByCUE(visita.cue)

  const tieneActa = !!acta
  const puedeEditar = !tieneActa

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/calendario">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{visita.titulo}</h1>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                visita.estado === "CERRADA_CON_ACTA"
                  ? "default"
                  : visita.estado === "VENCIDA"
                    ? "destructive"
                    : "secondary"
              }
            >
              {visita.estado === "PLANEADA" ? "Planeada" : visita.estado === "CERRADA_CON_ACTA" ? "Cerrada" : "Vencida"}
            </Badge>
            <Badge variant="outline">
              {visita.tipo === "TECNICA"
                ? "Técnica"
                : visita.tipo === "PEDAGOGICA"
                  ? "Pedagógica"
                  : visita.tipo === "MIXTA"
                    ? "Mixta"
                    : "Administrativa"}
            </Badge>
          </div>
        </div>

        {tieneActa && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Visita bloqueada - Acta cargada</span>
          </div>
        )}
      </div>

      {!tieneActa && visita.estado !== "CERRADA_CON_ACTA" && (
        <div className="flex gap-2">
          <SubirActaButton visitaId={visita.id} />
          {puedeEditar && (
            <Button variant="outline" asChild>
              <Link href={`/visitas/${id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          )}
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
                {format(new Date(visita.fecha_inicio), "EEEE, d 'de' MMMM 'de' yyyy - HH:mm", {
                  locale: es,
                })}
              </p>
            </div>
            {visita.fecha_fin && (
              <div>
                <p className="text-sm text-muted-foreground">Fin</p>
                <p className="font-medium">
                  {format(new Date(visita.fecha_fin), "EEEE, d 'de' MMMM 'de' yyyy - HH:mm", {
                    locale: es,
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-pba-blue" />
              Establecimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {establecimiento ? (
              <>
                <p className="font-medium">{establecimiento.nombre}</p>
                <p className="text-sm text-muted-foreground">CUE: {visita.cue}</p>
                <p className="text-sm text-muted-foreground">
                  {establecimiento.distrito} - {establecimiento.ciudad}
                </p>
                <Button variant="outline" size="sm" asChild className="mt-2 bg-transparent">
                  <Link href={`/establecimientos/${visita.cue}`}>Ver detalles completos</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">CUE: {visita.cue}</p>
            )}
          </CardContent>
        </Card>

        {visita.descripcion && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{visita.descripcion}</p>
            </CardContent>
          </Card>
        )}

        <Card>
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
                  <Badge variant="outline" className="text-xs">
                    {p.rol_en_visita === "RESPONSABLE" ? "Responsable" : "Acompañante"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pba-blue" />
              Acta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {acta ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="font-medium text-green-900">Acta cargada</p>
                  <p className="text-sm text-green-700">
                    Subida el {format(new Date(acta.fecha_subida), "d 'de' MMMM 'de' yyyy - HH:mm", { locale: es })}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a href={acta.archivo_url} target="_blank" rel="noopener noreferrer">
                    Ver acta
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No se ha cargado el acta todavía</p>
                {visita.estado === "VENCIDA" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-medium text-red-900">Visita vencida</p>
                    <p className="text-sm text-red-700">Esta visita lleva más de 5 días sin acta</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
