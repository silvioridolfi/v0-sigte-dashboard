'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getFEDPerfil } from '@/lib/actions/feds';
import { getAccionesPorUsuario } from '@/lib/actions/acciones';
import { PageHeader } from '@/components/ui/page-header';
import { useActiveUser } from '@/lib/hooks/use-active-user';

export default function FedDetailPage() {
  const params = useParams();
  const fedId = params.id as string;
  const { activeUser } = useActiveUser();
  
  const [fed, setFed] = useState<any>(null);
  const [acciones, setAcciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFedProfile = async () => {
      if (!activeUser || activeUser.rol === 'FED') return;
      
      try {
        const { perfil: fedData } = await getFEDPerfil(fedId);
        const { acciones: accionesData } = await getAccionesPorUsuario(fedId);
        
        setFed(fedData);
        setAcciones(accionesData);
      } catch (error) {
        console.error('Error loading FED profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFedProfile();
  }, [activeUser, fedId]);

  if (!activeUser || activeUser.rol === 'FED') {
    return (
      <main className="flex-1 p-6">
        <div className="text-center text-gray-500">
          No tienes permisos para ver este módulo
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="flex-1 p-6 text-center text-gray-500">Cargando perfil...</main>;
  }

  if (!fed) {
    return <main className="flex-1 p-6 text-center text-gray-500">No se encontró el facilitador</main>;
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title={fed.nombre}
        description={`${fed.rol} - ${fed.distrito}`}
        backHref="/feds"
      />

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Visitas Realizadas</p>
            <p className="text-3xl font-bold text-pba-blue">{fed.visitas_realizadas || 0}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Acciones Técnicas</p>
            <p className="text-3xl font-bold text-pba-blue">{fed.acciones_tecnicas || 0}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Acciones Pedagógicas</p>
            <p className="text-3xl font-bold text-pba-cyan">{fed.acciones_pedagogicas || 0}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total Acciones</p>
            <p className="text-3xl font-bold text-pba-blue">{fed.total_acciones || 0}</p>
          </div>
        </Card>
      </div>

      {/* Información de contacto */}
      <Card className="p-6">
        <h3 className="font-semibold text-pba-blue mb-4">Información de Contacto</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Email:</span> {fed.email}</p>
          <p><span className="font-medium">Género:</span> {fed.genero}</p>
          <p><span className="font-medium">Distrito:</span> {fed.distrito}</p>
        </div>
      </Card>

      {/* Acciones registradas */}
      <Card className="p-6">
        <h3 className="font-semibold text-pba-blue mb-4">Acciones Registradas</h3>
        {acciones.length === 0 ? (
          <p className="text-sm text-gray-500">No hay acciones registradas</p>
        ) : (
          <div className="space-y-3">
            {acciones.map((accion) => (
              <div key={accion.id} className="border-l-4 border-pba-cyan pl-4 py-2">
                <p className="text-sm font-medium">{accion.descripcion}</p>
                <p className="text-xs text-gray-500">
                  {accion.tipo === 'TECNICA' ? 'Técnica' : 'Pedagógica'} - {new Date(accion.fecha).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
