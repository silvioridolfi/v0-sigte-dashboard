import { FormNuevaVisita } from "@/components/visitas/form-nueva-visita"

export default async function NuevaVisitaPage({
  searchParams,
}: {
  searchParams: Promise<{ cue?: string; fecha?: string }>
}) {
  const { cue, fecha } = await searchParams

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-pba-blue">Nueva Visita</h1>
        <p className="text-muted-foreground">Crea una nueva visita a un establecimiento educativo</p>
      </div>

      <FormNuevaVisita cueInicial={cue} fechaInicial={fecha} />
    </div>
  )
}
