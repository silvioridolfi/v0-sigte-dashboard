"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { subirActa } from "@/lib/actions/visitas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2 } from "lucide-react"

export function SubirActaButton({ visitaId }: { visitaId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { activeUser } = useActiveUser()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file || !activeUser) {
      toast({
        title: "Error",
        description: "Debes seleccionar un archivo y tener un usuario activo",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Subir archivo a Supabase Storage
      const fileName = `${visitaId}-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from("actas").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("actas").getPublicUrl(fileName)

      // Guardar referencia en la base de datos
      const result = await subirActa({
        visita_id: visitaId,
        archivo_url: publicUrl,
        subido_por: activeUser.id,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Acta subida correctamente",
        description: "La visita ha sido marcada como cerrada",
      })

      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error al subir acta",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00AEC3] hover:bg-[#00AEC3]/90">
          <Upload className="h-4 w-4 mr-2" />
          Subir Acta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Acta de Visita</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Archivo (PDF, JPG, PNG)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Al subir el acta, la visita se cerrará y no podrá editarse
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !file} className="bg-[#00AEC3] hover:bg-[#00AEC3]/90">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Subiendo...
                </>
              ) : (
                "Subir y Cerrar Visita"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
