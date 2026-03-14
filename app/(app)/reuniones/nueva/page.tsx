import { FormNuevaReunion } from "@/components/reuniones/form-nueva-reunion"
import { redirect } from "next/navigation"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"

export default async function NuevaReunionPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const activeUser = await getActiveUserServer()

  if (!canManageReuniones(activeUser)) {
    redirect("/reuniones")
  }

  const { fecha } = await searchParams

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-pba-blue">Nueva Reunión</h1>
        <p className="text-muted-foreground">Crea una nueva reunión de equipo</p>
      </div>

      <FormNuevaReunion fechaInicial={fecha} />
    </div>
  )
}
