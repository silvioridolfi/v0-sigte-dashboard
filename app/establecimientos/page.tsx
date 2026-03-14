import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BuscadorEstablecimientos } from "@/components/establecimientos/buscador-establecimientos"
import { Search } from "lucide-react"

export default function EstablecimientosPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-pba-blue mb-2">Establecimientos Educativos</h1>
        <p className="text-muted-foreground">
          Busca y gestiona información de escuelas y establecimientos de la Provincia de Buenos Aires
        </p>
      </div>

      <Card className="border-t-4 border-t-pba-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-pba-cyan" />
            Buscador Inteligente
          </CardTitle>
          <CardDescription>
            Busca por CUE (8 dígitos), Predio (6 dígitos), número de escuela, nombre, distrito o ciudad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BuscadorEstablecimientos />
        </CardContent>
      </Card>
    </div>
  )
}
