"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Phone, Mail, Building2, Edit, Save, ExternalLink, Users, School, Wifi, Monitor } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { updateEstablecimiento, updateContacto, createContacto, getContactoByCUE } from "@/lib/actions/establecimientos"
import { useToast } from "@/hooks/use-toast"
import { SigteMap } from "@/components/map/sigte-map"

type EstablecimientoFull = any

export function EstablecimientoDetailDrawer({
  establecimiento,
  onClose,
}: {
  establecimiento: EstablecimientoFull
  onClose: () => void
}) {
  const { activeUser } = useActiveUser()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [contacto, setContacto] = useState<any>(null)
  const [loadingContacto, setLoadingContacto] = useState(true)

  // Form state
  const [direccion, setDireccion] = useState(establecimiento.direccion || "")
  const [lat, setLat] = useState(establecimiento.lat?.toString() || "")
  const [lon, setLon] = useState(establecimiento.lon?.toString() || "")
  const [contactoNombre, setContactoNombre] = useState("")
  const [contactoApellido, setContactoApellido] = useState("")
  const [contactoCargo, setContactoCargo] = useState("")
  const [contactoTelefono, setContactoTelefono] = useState("")
  const [contactoCorreo, setContactoCorreo] = useState("")

  const hasCoordinates = establecimiento.lat && establecimiento.lon

  // Check edit permissions
  const canEdit =
    activeUser &&
    (activeUser.rol === "CED" || (activeUser.rol === "FED" && activeUser.distrito === establecimiento.distrito))

  useEffect(() => {
    async function loadContacto() {
      const { contacto: contactoData } = await getContactoByCUE(establecimiento.cue)
      setContacto(contactoData)
      if (contactoData) {
        setContactoNombre(contactoData.nombre || "")
        setContactoApellido(contactoData.apellido || "")
        setContactoCargo(contactoData.cargo || "")
        setContactoTelefono(contactoData.telefono || "")
        setContactoCorreo(contactoData.correo || "")
      }
      setLoadingContacto(false)
    }
    loadContacto()
  }, [establecimiento.cue])

  const handleSave = async () => {
    setSaving(true)

    // Validate coordinates
    const latNum = lat ? Number.parseFloat(lat) : null
    const lonNum = lon ? Number.parseFloat(lon) : null

    if (latNum !== null && (latNum < -90 || latNum > 90)) {
      toast({ title: "Error", description: "Latitud debe estar entre -90 y 90", variant: "destructive" })
      setSaving(false)
      return
    }

    if (lonNum !== null && (lonNum < -180 || lonNum > 180)) {
      toast({ title: "Error", description: "Longitud debe estar entre -180 y 180", variant: "destructive" })
      setSaving(false)
      return
    }

    // Update establecimiento
    const { success: estSuccess } = await updateEstablecimiento(establecimiento.cue, {
      direccion: direccion || null,
      lat: latNum,
      lon: lonNum,
    })

    // Update or create contacto
    let contactoSuccess = true
    if (contactoNombre || contactoApellido) {
      if (contacto) {
        const { success } = await updateContacto(establecimiento.cue, {
          nombre: contactoNombre,
          apellido: contactoApellido,
          cargo: contactoCargo || undefined,
          telefono: contactoTelefono || undefined,
          correo: contactoCorreo || undefined,
        })
        contactoSuccess = success
      } else {
        const { success } = await createContacto(establecimiento.cue, {
          nombre: contactoNombre,
          apellido: contactoApellido,
          cargo: contactoCargo || undefined,
          telefono: contactoTelefono || undefined,
          correo: contactoCorreo || undefined,
        })
        contactoSuccess = success
      }
    }

    setSaving(false)

    if (estSuccess && contactoSuccess) {
      toast({ title: "Guardado", description: "Los cambios se guardaron correctamente" })
      setIsEditing(false)
      // Reload page to show updated data
      window.location.reload()
    } else {
      toast({ title: "Error", description: "No se pudieron guardar los cambios", variant: "destructive" })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl sm:max-h-[90vh] max-h-[95vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-pba-blue to-pba-cyan text-white p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold pr-12 mb-2">{establecimiento.nombre}</h2>
          <div className="flex items-center gap-4 text-white/90 text-sm">
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
          {canEdit && (
            <div className="mt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="secondary">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} size="sm" variant="secondary">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
          {!canEdit && activeUser?.rol === "FED" && activeUser.distrito !== establecimiento.distrito && (
            <p className="text-sm text-white/80 mt-2">Solo puedes editar establecimientos de tu distrito</p>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-pba-blue border-b pb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Distrito</p>
                  <p className="text-gray-900">{establecimiento.distrito}</p>
                </div>
                {establecimiento.ciudad && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ciudad</p>
                    <p className="text-gray-900">{establecimiento.ciudad}</p>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ingrese la dirección"
                  />
                </div>
              ) : (
                establecimiento.direccion && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dirección</p>
                    <p className="text-gray-900">{establecimiento.direccion}</p>
                  </div>
                )
              )}

              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitud (-90 a 90)</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="-34.603722"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lon">Longitud (-180 a 180)</Label>
                    <Input
                      id="lon"
                      type="number"
                      step="0.000001"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      placeholder="-58.381592"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {hasCoordinates && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Coordenadas</p>
                          <p className="font-mono text-sm text-gray-900">
                            {establecimiento.lat.toFixed(6)}, {establecimiento.lon.toFixed(6)}
                          </p>
                        </div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${establecimiento.lat},${establecimiento.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-pba-blue text-white rounded-lg hover:bg-pba-blue/90 transition-colors text-sm"
                        >
                          <MapPin className="w-4 h-4" />
                          Ver en Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <SigteMap
                        lat={establecimiento.lat}
                        lon={establecimiento.lon}
                        nombre={establecimiento.nombre}
                        altura="h-64"
                      />
                    </div>
                  )}
                </>
              )}

              {establecimiento.ambito && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Ámbito</p>
                  <Badge variant="outline">{establecimiento.ambito}</Badge>
                </div>
              )}
            </div>

            {/* Educational Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-pba-blue border-b pb-2 flex items-center gap-2">
                <School className="h-5 w-5" />
                Información Educativa
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {establecimiento.tipo_establecimiento && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo</p>
                    <p className="text-gray-900">{establecimiento.tipo_establecimiento}</p>
                  </div>
                )}
                {establecimiento.nivel && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nivel</p>
                    <Badge className="bg-pba-blue/10 text-pba-blue">{establecimiento.nivel}</Badge>
                  </div>
                )}
                {establecimiento.modalidad && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Modalidad</p>
                    <Badge variant="secondary">{establecimiento.modalidad}</Badge>
                  </div>
                )}
                {establecimiento.turnos && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Turnos</p>
                    <Badge variant="outline">{establecimiento.turnos}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment */}
            {(establecimiento.matricula || establecimiento.varones || establecimiento.mujeres) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pba-blue border-b pb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Matrícula
                </h3>

                <div className="bg-gradient-to-br from-pba-blue/5 to-pba-cyan/5 rounded-lg p-4 border border-pba-blue/20">
                  {establecimiento.matricula && (
                    <div className="mb-4">
                      <p className="text-4xl font-bold text-pba-blue">{establecimiento.matricula.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">estudiantes totales</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {establecimiento.varones !== null && (
                      <div>
                        <p className="text-sm text-gray-600">Varones</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {establecimiento.varones?.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {establecimiento.mujeres !== null && (
                      <div>
                        <p className="text-sm text-gray-600">Mujeres</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {establecimiento.mujeres?.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {establecimiento.secciones && (
                      <div>
                        <p className="text-sm text-gray-600">Secciones</p>
                        <p className="text-xl font-semibold text-gray-900">{establecimiento.secciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-pba-blue border-b pb-2 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contacto Institucional
              </h3>

              {loadingContacto ? (
                <p className="text-sm text-gray-500">Cargando...</p>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contacto-nombre">Nombre</Label>
                      <Input
                        id="contacto-nombre"
                        value={contactoNombre}
                        onChange={(e) => setContactoNombre(e.target.value)}
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contacto-apellido">Apellido</Label>
                      <Input
                        id="contacto-apellido"
                        value={contactoApellido}
                        onChange={(e) => setContactoApellido(e.target.value)}
                        placeholder="Apellido"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contacto-cargo">Cargo</Label>
                    <Input
                      id="contacto-cargo"
                      value={contactoCargo}
                      onChange={(e) => setContactoCargo(e.target.value)}
                      placeholder="Ej: Director/a"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contacto-telefono">Teléfono</Label>
                      <Input
                        id="contacto-telefono"
                        type="tel"
                        value={contactoTelefono}
                        onChange={(e) => setContactoTelefono(e.target.value)}
                        placeholder="011-1234-5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contacto-correo">Correo</Label>
                      <Input
                        id="contacto-correo"
                        type="email"
                        value={contactoCorreo}
                        onChange={(e) => setContactoCorreo(e.target.value)}
                        placeholder="contacto@escuela.edu.ar"
                      />
                    </div>
                  </div>
                </div>
              ) : contacto ? (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {contacto.nombre} {contacto.apellido}
                    </p>
                    {contacto.cargo && <p className="text-sm text-gray-600">{contacto.cargo}</p>}
                  </div>
                  {contacto.telefono && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{contacto.telefono}</span>
                    </div>
                  )}
                  {contacto.correo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${contacto.correo}`} className="text-pba-cyan hover:underline">
                        {contacto.correo}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin información de contacto</p>
              )}
            </div>

            {/* Connectivity */}
            {(establecimiento.plan_enlace || establecimiento.plan_piso_tecnologico) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-pba-blue border-b pb-2 flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Conectividad y Tecnología
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {establecimiento.plan_enlace && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="h-4 w-4 text-pba-cyan" />
                        <p className="font-medium text-gray-900">Plan de Enlace</p>
                      </div>
                      <p className="text-sm text-gray-700">{establecimiento.plan_enlace}</p>
                      {establecimiento.conectividad_estado && (
                        <Badge variant="secondary" className="mt-2">
                          {establecimiento.conectividad_estado}
                        </Badge>
                      )}
                    </div>
                  )}
                  {establecimiento.plan_piso_tecnologico && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Monitor className="h-4 w-4 text-pba-blue" />
                        <p className="font-medium text-gray-900">Piso Tecnológico</p>
                      </div>
                      <p className="text-sm text-gray-700">{establecimiento.plan_piso_tecnologico}</p>
                      {establecimiento.piso_estado && (
                        <Badge variant="secondary" className="mt-2">
                          {establecimiento.piso_estado}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
