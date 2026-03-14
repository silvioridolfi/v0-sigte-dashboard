import { notFound } from "next/navigation"
import { getEstablecimientoByCUE } from "@/lib/actions/establecimientos"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, School, Users, Phone, Mail, Wifi, Monitor, Building2, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"

export default async function EstablecimientoDetailPage({ params }: { params: Promise<{ cue: string }> }) {
  const { cue } = await params
  const cueNumber = Number.parseInt(cue)

  if (isNaN(cueNumber)) {
    notFound()
  }

  const { establecimiento, error } = await getEstablecimientoByCUE(cueNumber)

  if (error || !establecimiento) {
    notFound()
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/establecimientos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{establecimiento.nombre}</h1>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1">
            <School className="h-4 w-4" />
            CUE: {establecimiento.cue}
          </span>
          {establecimiento.predio && (
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Predio: {establecimiento.predio}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button asChild className="bg-pba-cyan hover:bg-pba-cyan/90">
          <Link href={`/visitas/nueva?cue=${establecimiento.cue}`}>
            <Calendar className="h-4 w-4 mr-2" />
            Crear Visita
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pba-blue" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">Distrito</p>
              <p className="text-muted-foreground">{establecimiento.distrito}</p>
            </div>
            {establecimiento.ciudad && (
              <div>
                <p className="font-medium">Ciudad</p>
                <p className="text-muted-foreground">{establecimiento.ciudad}</p>
              </div>
            )}
            {establecimiento.direccion && (
              <div>
                <p className="font-medium">Dirección</p>
                <p className="text-muted-foreground">{establecimiento.direccion}</p>
              </div>
            )}
            {establecimiento.ambito && (
              <div>
                <p className="font-medium">Ámbito</p>
                <Badge variant="outline">{establecimiento.ambito}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-pba-blue" />
              Datos Institucionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {establecimiento.tipo_establecimiento && (
              <div>
                <p className="font-medium">Tipo</p>
                <p className="text-muted-foreground">{establecimiento.tipo_establecimiento}</p>
              </div>
            )}
            {establecimiento.nivel && (
              <div>
                <p className="font-medium">Nivel</p>
                <Badge>{establecimiento.nivel}</Badge>
              </div>
            )}
            {establecimiento.modalidad && (
              <div>
                <p className="font-medium">Modalidad</p>
                <Badge variant="secondary">{establecimiento.modalidad}</Badge>
              </div>
            )}
            {establecimiento.turnos && (
              <div>
                <p className="font-medium">Turnos</p>
                <Badge variant="outline">{establecimiento.turnos}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {establecimiento.matricula && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-pba-blue" />
                Matrícula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-3xl font-bold">{establecimiento.matricula.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">estudiantes</p>
              </div>
              {establecimiento.varones !== null && establecimiento.mujeres !== null && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Varones</p>
                    <p className="font-semibold">{establecimiento.varones?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mujeres</p>
                    <p className="font-semibold">{establecimiento.mujeres?.toLocaleString()}</p>
                  </div>
                </div>
              )}
              {establecimiento.secciones && (
                <div>
                  <p className="text-sm text-muted-foreground">Secciones</p>
                  <p className="font-semibold">{establecimiento.secciones}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(establecimiento.contacto_nombre ||
          establecimiento.contacto_apellido ||
          establecimiento.telefono ||
          establecimiento.correo) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-pba-blue" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(establecimiento.contacto_nombre || establecimiento.contacto_apellido) && (
                <div>
                  <p className="font-medium">
                    {establecimiento.contacto_nombre} {establecimiento.contacto_apellido}
                  </p>
                  {establecimiento.contacto_cargo && (
                    <p className="text-sm text-muted-foreground">{establecimiento.contacto_cargo}</p>
                  )}
                  {establecimiento.contacto_fed && (
                    <Badge variant="outline" className="mt-1">
                      FED: {establecimiento.contacto_fed}
                    </Badge>
                  )}
                </div>
              )}
              {establecimiento.telefono && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{establecimiento.telefono}</span>
                </div>
              )}
              {establecimiento.correo && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${establecimiento.correo}`} className="text-sm text-pba-cyan hover:underline">
                    {establecimiento.correo}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(establecimiento.plan_enlace ||
          establecimiento.plan_piso_tecnologico ||
          establecimiento.conectividad_estado ||
          establecimiento.piso_estado) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-pba-blue" />
                Conectividad y Tecnología
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {establecimiento.plan_enlace && (
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Plan de Enlace
                  </p>
                  <p className="text-sm text-muted-foreground">{establecimiento.plan_enlace}</p>
                  {establecimiento.conectividad_estado && (
                    <Badge variant="secondary" className="mt-1">
                      {establecimiento.conectividad_estado}
                    </Badge>
                  )}
                  {establecimiento.conectividad_fuente && (
                    <p className="text-xs text-muted-foreground mt-1">Fuente: {establecimiento.conectividad_fuente}</p>
                  )}
                </div>
              )}
              {establecimiento.plan_piso_tecnologico && (
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Piso Tecnológico
                  </p>
                  <p className="text-sm text-muted-foreground">{establecimiento.plan_piso_tecnologico}</p>
                  {establecimiento.piso_estado && (
                    <Badge variant="secondary" className="mt-1">
                      {establecimiento.piso_estado}
                    </Badge>
                  )}
                  {establecimiento.piso_fuente && (
                    <p className="text-xs text-muted-foreground mt-1">Fuente: {establecimiento.piso_fuente}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
