"use client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Users } from "lucide-react"
import { formatDatetimeLocal } from "@/lib/utils/timezone-helpers"
import { useActiveUser } from "@/components/providers/active-user-provider"

export function QuickCreateDialog({
  date,
  open,
  onOpenChange,
  onSuccess,
}: {
  date: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const router = useRouter()
  const { activeUser } = useActiveUser()

  const canCreateReunion = activeUser?.rol === "CED" || activeUser?.rol === "ADMIN"

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const fechaInicial = formatDatetimeLocal(date)

  function handleCreateVisita() {
    router.push(`/visitas/nueva?fecha=${fechaInicial}`)
  }

  function handleCreateReunion() {
    router.push(`/reuniones/nueva?fecha=${fechaInicial}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-pba-blue" />
            Crear evento
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            onClick={handleCreateVisita}
            className="w-full bg-pba-cyan hover:bg-pba-cyan/90 justify-start"
            size="lg"
          >
            <CalendarIcon className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-semibold">Nueva Visita</div>
              <div className="text-xs opacity-90">Visita a establecimiento educativo</div>
            </div>
          </Button>

          {canCreateReunion && (
            <Button
              onClick={handleCreateReunion}
              className="w-full bg-pba-blue hover:bg-pba-blue/90 justify-start"
              size="lg"
            >
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Nueva Reunión</div>
                <div className="text-xs opacity-90">Reunión de equipo regional o distrital</div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
