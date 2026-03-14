import { notFound, redirect } from "next/navigation"
import { getReunion } from "@/lib/actions/reuniones"
import { getActiveUserServer, canManageReuniones } from "@/lib/utils/get-active-user-server"
import { FormEditarReunion } from "@/components/reuniones/form-editar-reunion"

export default async function EditarReunionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { reunion, participantes, error } = await getReunion(id)

  if (error || !reunion) {
    notFound()
  }

  const activeUser = await getActiveUserServer()
  if (!canManageReuniones(activeUser)) {
    redirect(`/reuniones/${id}`)
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold text-pba-blue mb-6">Editar Reunión</h1>
      <FormEditarReunion reunionId={id} reunionData={reunion} participantesIniciales={participantes} />
    </div>
  )
}
