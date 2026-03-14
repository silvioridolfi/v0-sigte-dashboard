"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { eliminarReunion } from "@/lib/actions/reuniones"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Loader2 } from "lucide-react"

export function EliminarReunionButton({ reunionId }: { reunionId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { activeUser } = useActiveUser()

  async function handleEliminar() {
    if (!activeUser || (activeUser.rol !== "CED" && activeUser.rol !== "ADMIN")) {
      toast({
        title: "Error",
        description: "No tienes permisos para eliminar reuniones",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const result = await eliminarReunion(reunionId)
    setLoading(false)

    if (result.error) {
      toast({
        title: "Error al eliminar reunión",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reunión eliminada",
        description: "La reunión se eliminó correctamente",
      })
      router.push("/reuniones")
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La reunión será eliminada permanentemente del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleEliminar} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
