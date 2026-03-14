import { notFound, redirect } from "next/navigation"
import { getVisita } from "@/lib/actions/visitas"
import { getActiveUserServer } from "@/lib/utils/get-active-user-server"
import { FormEditarVisita } from "@/components/visitas/form-editar-visita"

export default async function EditarVisitaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { visita, participantes, acta, error } = await getVisita(id)

  if (error || !visita) {
    notFound()
  }

  const activeUser = await getActiveUserServer()
  if (!activeUser || visita.creado_por !== activeUser.id) {
    redirect(`/visitas/${id}`)
  }

  if (acta) {
    redirect(`/visitas/${id}`)
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold text-pba-blue mb-6">Editar Visita</h1>
      <FormEditarVisita visitaId={id} visitaData={visita} participantesIniciales={participantes} />
    </div>
  )
}
