"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { crearVisita } from "@/lib/actions/visitas"
import { getEstablecimientoByCUE } from "@/lib/actions/establecimientos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Usuario } from "@/lib/types/database"
import { datetimeLocalToUTC } from "@/lib/utils/timezone-helpers"
import { getUsuariosDisponibles } from "@/lib/utils/usuarios-helpers"

export function FormNuevaVisita({ cueInicial, fechaInicial }: { cueInicial?: string; fechaInicial?: string }) {
  const router = useRouter()
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [establecimiento, setEstablecimiento] = useState<any>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([])

  const [formData, setFormData] = useState({
    cue: cueInicial || "",
    titulo: "",
    descripcion: "",
    tipo: "TECNICA" as "TECNICA" | "PEDAGOGICA" | "MIXTA" | "ADMIN",
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
    }
  }, [activeUser])

  useEffect(() => {
    if (cueInicial) {
      handleBuscarCUE()
    }
  }, [cueInicial])

  async function handleBuscarCUE() {
    if (!formData.cue || formData.cue.length !== 8) {
      toast({
        title: "CUE inválido",
        description: "El CUE debe tener 8 dígitos",
        variant: "destructive",
      })
      return
    }

    const { establecimiento: est, error } = await getEstablecimientoByCUE(Number.parseInt(formData.cue))
    if (error || !est) {
      toast({
        title: "Establecimiento no encontrado",
        description: "No se encontró un establecimiento con ese CUE",
        variant: "destructive",
      })
      setEstablecimiento(null)
    } else {
      setEstablecimiento(est)
      setFormData((prev) => ({ ...prev, titulo: `Visita a ${est.nombre}` }))
    }
  }

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

    if (!establecimiento) {
      toast({
        title: "Error",
        description: "Debes buscar y seleccionar un establecimiento válido",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const result = await crearVisita({
      cue: Number.parseInt(formData.cue),
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      tipo: formData.tipo,
      fecha_inicio: datetimeLocalToUTC(formData.fecha_inicio),
      fecha_fin: formData.fecha_fin ? datetimeLocalToUTC(formData.fecha_fin) : null,
      distrito: establecimiento.distrito,
      creado_por: activeUser.id,
      participantes: participantesSeleccionados,
    })

    setLoading(false)

    if (result.error) {
      toast({
        title: "Error al crear visita",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Visita creada",
        description: "La visita se creó correctamente",
      })
      router.push("/calendario")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Establecimiento</CardTitle>
          <CardDescription>Busca el establecimiento por su CUE (8 dígitos)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Ingresa el CUE (8 dígitos)"
                value={formData.cue}
                onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                maxLength={8}
                required
              />
            </div>
            <Button type="button" onClick={handleBuscarCUE} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>

          {establecimiento && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="font-semibold text-green-900">{establecimiento.nombre}</p>
              <p className="text-sm text-green-700">
                {establecimiento.distrito} - {establecimiento.ciudad}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Participantes</CardTitle>
          <CardDescription>Selecciona los usuarios que participarán en la visita</CardDescription>
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
        <Button type="submit" disabled={loading || !establecimiento} className="bg-[#00AEC3] hover:bg-[#00AEC3]/90">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creando...
            </>
          ) : (
            "Crear Visita"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
