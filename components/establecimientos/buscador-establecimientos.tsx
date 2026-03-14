"use client"

import { useState } from "react"
import { Search, Loader2, AlertCircle, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EstablecimientoCardPremium } from "./establecimiento-card-premium"
import { EstablecimientoDetailDrawer } from "./establecimiento-detail-drawer"
import { buscarEstablecimientos, getEstablecimientoByCUE } from "@/lib/actions/establecimientos"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useActiveUser } from "@/components/providers/active-user-provider"
import { parseUserDistricts } from "@/lib/utils/distrito-helpers"

export function BuscadorEstablecimientos() {
  const { activeUser } = useActiveUser()
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [establecimientos, setEstablecimientos] = useState<any[]>([])
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<any>(null)
  const [total, setTotal] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const { toast } = useToast()

  const userDistricts = activeUser ? parseUserDistricts(activeUser.distrito) : []
  const isFED = activeUser?.rol === "FED" && userDistricts.length > 0

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Ingresa un término de búsqueda",
        description: "Busca por CUE (8 dígitos), Predio (6 dígitos), nombre o distrito",
        variant: "destructive",
      })
      return
    }

    setSearching(true)
    setHasSearched(false)

    const result = await buscarEstablecimientos(query, 50, 0, isFED ? userDistricts : undefined)

    setSearching(false)
    setHasSearched(true)

    if (result.error) {
      toast({
        title: "Error al buscar",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setEstablecimientos(result.establecimientos)
      setTotal(result.total)
    }
  }

  const handleCardClick = async (cue: number) => {
    const { establecimiento } = await getEstablecimientoByCUE(cue)
    if (establecimiento) {
      setSelectedEstablecimiento(establecimiento)
    }
  }

  return (
    <div className="space-y-6">
      {isFED && (
        <Alert className="bg-pba-blue/5 border-pba-blue/20">
          <Filter className="h-4 w-4 text-pba-blue" />
          <AlertDescription>
            <span className="font-medium text-pba-blue">Filtro activo:</span> Mostrando solo establecimientos de{" "}
            {userDistricts.length === 1 ? (
              <Badge variant="secondary" className="ml-1">
                {userDistricts[0]}
              </Badge>
            ) : (
              `${userDistricts.length} distritos`
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por CUE, Predio, nombre, número de escuela..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch()
            }}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={searching} className="bg-pba-cyan hover:bg-pba-cyan/90">
          {searching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </>
          )}
        </Button>
      </div>

      {!hasSearched && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Consejos de búsqueda:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                • <strong>CUE:</strong> 8 dígitos exactos (ej: 12345678)
              </li>
              <li>
                • <strong>Predio:</strong> 6 dígitos exactos (ej: 123456)
              </li>
              <li>
                • <strong>Número de escuela:</strong> 1-3 dígitos (ej: "8" para Primaria 8)
              </li>
              <li>
                • <strong>Nombre:</strong> busca por palabras (ej: "tecnica 5", "jardin")
              </li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {hasSearched && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total === 0 ? (
                <span className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  No se encontraron establecimientos para <strong>"{query}"</strong>
                </span>
              ) : (
                <>
                  Se {total === 1 ? "encontró" : "encontraron"} <strong>{total}</strong> establecimiento
                  {total !== 1 ? "s" : ""}
                </>
              )}
            </p>
          </div>

          {establecimientos.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {establecimientos.map((est) => (
                <EstablecimientoCardPremium
                  key={est.id}
                  establecimiento={est}
                  onClick={() => handleCardClick(est.cue)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {selectedEstablecimiento && (
        <EstablecimientoDetailDrawer
          establecimiento={selectedEstablecimiento}
          onClose={() => setSelectedEstablecimiento(null)}
        />
      )}
    </div>
  )
}
