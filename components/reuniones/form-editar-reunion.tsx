"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { actualizarReunion } from "@/lib/actions/reuniones"
import { actualizarParticipantesReunion } from "@/lib/actions/reuniones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Usuario } from "@/lib/types/database"
import { datetimeLocalToUTC, utcToDatetimeLocal } from "@/lib/utils/timezone-helpers"
import { getUsuariosDisponibles } from "@/lib/utils/usuarios-helpers"

export function FormEditarReunion({
  reunionId,
  reunionData,
  participantesIniciales,
}: { reunionId: string; reunionData: any; participantesIniciales: any[] }) {
  const router = useRouter()
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: reunionData.titulo,
    descripcion: reunionData.descripcion || "",
    ambito: reunionData.ambito as "REGIONAL" | "DISTRITAL",
    distrito: reunionData.distrito || "",
    fecha_inicio: utcToDatetimeLocal(reunionData.fecha_inicio),
    fecha_fin: reunionData.fecha_fin ? utcToDatetimeLocal(reunionData.fecha_fin) : "",
  })

  useEffect(() => {
    async function loadUsuarios() {
      const data = await getUsuariosDisponibles()
      setUsuarios(data)
    }
    loadUsuarios()
  }, [])

  useEffect(() => {
    setParticipantesSeleccionados(participantesIniciales.map((p: any) => p.usuario_id))
  }, [participantesIniciales])

  function toggleParticipante(userId: string) {
    setParticipantesSeleccionados((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!activeUser) {
      toast({
        title: "Error",
        description: "Debes seleccionar un usuario activo",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const result = await actualizarReunion(reunionId, {
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      ambito: formData.ambito,
      distrito: formData.distrito || null,
      fecha_inicio: datetimeLocalToUTC(formData.fecha_inicio),
      fecha_fin: formData.fecha_fin ? datetimeLocalToUTC(formData.fecha_fin) : null,
    })

    if (!result.error) {
      await actualizarParticipantesReunion(reunionId, participantesSeleccionados)
    }

    setLoading(false)

    if (result.error) {
      toast({
        title: "Error al actualizar reunión",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reunión actualizada",
        description: "Los cambios se guardaron correctamente",
      })
      router.push(`/reuniones/${reunionId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Detalles de la Reunión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="ambito">Ámbito *</Label>
            <Select value={formData.ambito} onValueChange={(value: any) => setFormData({ ...formData, ambito: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGIONAL">Regional</SelectItem>
                <SelectItem value="DISTRITAL">Distrital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.ambito === "DISTRITAL" && (
            <div>
              <Label htmlFor="distrito">Distrito</Label>
              <Input
                id="distrito"
                type="text"
                value={formData.distrito}
                onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="fecha_inicio">Fecha y hora de inicio *</Label>
              <Input
                id="fecha_inicio"
                type="datetime-local"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="fecha_fin">Fecha y hora de fin</Label>
              <Input
                id="fecha_fin"
                type="datetime-local"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="flex items-center gap-2">
                <Checkbox
                  id={usuario.id}
                  checked={participantesSeleccionados.includes(usuario.id)}
                  onCheckedChange={() => toggleParticipante(usuario.id)}
                />
                <Label htmlFor={usuario.id} className="flex-1 cursor-pointer">
                  {usuario.nombre} - {usuario.rol} ({usuario.distrito})
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="bg-pba-cyan hover:bg-pba-cyan/90">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
