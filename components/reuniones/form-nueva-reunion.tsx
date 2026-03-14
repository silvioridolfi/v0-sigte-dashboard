"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUsuariosDisponibles } from "@/lib/utils/usuarios-helpers"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { crearReunion } from "@/lib/actions/reuniones"
import { datetimeLocalToUTC } from "@/lib/utils/timezone-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Usuario } from "@/lib/types/database"

export function FormNuevaReunion({ fechaInicial }: { fechaInicial?: string }) {
  const router = useRouter()
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([])

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    ambito: "DISTRITAL" as "REGIONAL" | "DISTRITAL",
    distrito: "",
    fecha_inicio: fechaInicial || "",
    fecha_fin: "",
  })

  useEffect(() => {
    async function loadUsuarios() {
      const data = await getUsuariosDisponibles()
      setUsuarios(data)
    }
    loadUsuarios()
  }, [])

  useEffect(() => {
    if (activeUser) {
      setParticipantesSeleccionados([activeUser.id])
      setFormData((prev) => ({ ...prev, distrito: activeUser.distrito }))
    }
  }, [activeUser])

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

    const result = await crearReunion({
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      ambito: formData.ambito,
      distrito: formData.ambito === "DISTRITAL" ? formData.distrito : null,
      fecha_inicio: datetimeLocalToUTC(formData.fecha_inicio),
      fecha_fin: formData.fecha_fin ? datetimeLocalToUTC(formData.fecha_fin) : null,
      creado_por: activeUser.id,
      participantes: participantesSeleccionados,
    })

    setLoading(false)

    if (result.error) {
      toast({
        title: "Error al crear reunión",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reunión creada",
        description: "La reunión se creó correctamente",
      })
      router.push("/calendario")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
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
              placeholder="Ej: Reunión de coordinación mensual"
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              placeholder="Describe los temas a tratar en la reunión..."
            />
          </div>

          <div>
            <Label htmlFor="ambito">Ámbito *</Label>
            <Select
              value={formData.ambito}
              onValueChange={(value: "REGIONAL" | "DISTRITAL") => setFormData({ ...formData, ambito: value })}
            >
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
                placeholder="Nombre del distrito"
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

      <Card>
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
          <CardDescription>Selecciona los usuarios que participarán en la reunión</CardDescription>
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
        <Button type="submit" disabled={loading} className="bg-[#00AEC3] hover:bg-[#00AEC3]/90">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creando...
            </>
          ) : (
            "Crear Reunión"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
