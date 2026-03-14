"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { actualizarVisita } from "@/lib/actions/visitas"
import { actualizarParticipantesVisita } from "@/lib/actions/visitas"
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

export function FormEditarVisita({
  visitaId,
  visitaData,
  participantesIniciales,
}: { visitaId: string; visitaData: any; participantesIniciales: any[] }) {
  const router = useRouter()
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: visitaData.titulo,
    descripcion: visitaData.descripcion || "",
    tipo: visitaData.tipo as "TECNICA" | "PEDAGOGICA" | "MIXTA" | "ADMIN",
    fecha_inicio: utcToDatetimeLocal(visitaData.fecha_inicio),
    fecha_fin: visitaData.fecha_fin ? utcToDatetimeLocal(visitaData.fecha_fin) : "",
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

    const result = await actualizarVisita(visitaId, {
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      tipo: formData.tipo,
      fecha_inicio: datetimeLocalToUTC(formData.fecha_inicio),
      fecha_fin: formData.fecha_fin ? datetimeLocalToUTC(formData.fecha_fin) : null,
    })

    if (!result.error) {
      await actualizarParticipantesVisita(visitaId, participantesSeleccionados, activeUser.id)
    }

    setLoading(false)

    if (result.error) {
      toast({
        title: "Error al actualizar visita",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Visita actualizada",
        description: "Los cambios se guardaron correctamente",
      })
      router.push(`/visitas/${visitaId}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Detalles de la Visita</CardTitle>
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
            <Label htmlFor="tipo">Tipo de Visita *</Label>
            <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TECNICA">Técnica</SelectItem>
                <SelectItem value="PEDAGOGICA">Pedagógica</SelectItem>
                <SelectItem value="MIXTA">Mixta</SelectItem>
                <SelectItem value="ADMIN">Administrativa</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
