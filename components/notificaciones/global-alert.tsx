"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, CheckCircle } from "lucide-react"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { getNotificacionesPendientes, marcarNotificacionLeida } from "@/lib/actions/notificaciones"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Notificacion {
  id: string
  tipo: string
  titulo: string
  mensaje: string | null
  reunion_id: string | null
  alcance: string
  created_at: string
  sigte_reuniones?: {
    id: string
    titulo: string
    fecha_inicio: string
    fecha_fin: string | null
  }
}

export function GlobalAlert() {
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeUser && activeUser.rol !== "ADMIN") {
      loadNotificaciones()
    }
  }, [activeUser])

  async function loadNotificaciones() {
    if (!activeUser) return

    const { notificaciones: data } = await getNotificacionesPendientes(activeUser.id)
    setNotificaciones(data as Notificacion[])
  }

  async function handleMarcarLeida(notificacionId: string) {
    if (!activeUser) return

    setLoading(true)
    const { error } = await marcarNotificacionLeida(notificacionId, activeUser.id)

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída",
        variant: "destructive",
      })
    } else {
      // Remover la notificación de la lista
      setNotificaciones((prev) => prev.filter((n) => n.id !== notificacionId))
      toast({
        title: "Notificación leída",
        description: "La notificación ha sido marcada como leída",
      })
    }
    setLoading(false)
  }

  // Si no hay notificaciones o el usuario es ADMIN, no mostrar nada
  if (!activeUser || activeUser.rol === "ADMIN" || notificaciones.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 z-[90] max-w-md space-y-2">
      {notificaciones.map((notif) => (
        <Alert
          key={notif.id}
          className="border-pba-cyan bg-gradient-to-r from-white to-pba-cyan/5 shadow-lg rounded-2xl"
        >
          <Bell className="h-5 w-5 text-pba-cyan" />
          <AlertTitle className="flex items-center justify-between gap-2 mb-2">
            <span className="font-semibold text-pba-blue">{notif.titulo}</span>
            <Badge variant="outline" className="shrink-0 text-xs">
              {notif.tipo}
            </Badge>
          </AlertTitle>
          <AlertDescription className="space-y-3">
            {notif.mensaje && <p className="text-sm text-muted-foreground">{notif.mensaje}</p>}

            {notif.sigte_reuniones && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                <p className="font-medium text-sm">{notif.sigte_reuniones.titulo}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(notif.sigte_reuniones.fecha_inicio), "dd/MM/yyyy HH:mm", { locale: es })}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {notif.reunion_id && (
                <Button variant="outline" size="sm" asChild className="text-xs bg-transparent">
                  <Link href={`/reuniones/${notif.reunion_id}`}>Ver detalle</Link>
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleMarcarLeida(notif.id)}
                disabled={loading}
                className="bg-pba-cyan hover:bg-pba-cyan/90 text-white text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmar lectura
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
