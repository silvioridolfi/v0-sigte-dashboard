'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getAllFeds } from '@/lib/actions/feds';
import PageHeader from '@/components/ui/page-header';
import FedProfileCard from '@/components/feds/fed-profile-card';
import { useActiveUser } from '@/lib/hooks/use-active-user';
import { canViewFeds } from '@/lib/utils/permisos';

type Fed = Awaited<ReturnType<typeof getAllFeds>>[0];

export default function FedsPage() {
  const { activeUser } = useActiveUser();
  const [feds, setFeds] = useState<Fed[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDistrito, setFiltroDistrito] = useState<string>('');

  useEffect(() => {
    const loadFeds = async () => {
      if (!activeUser || !canViewFeds(activeUser.rol)) return;
      
      try {
        const data = await getAllFeds(
          activeUser.rol === 'FED' ? activeUser.distrito : filtroDistrito
        );
        setFeds(data);
      } catch (error) {
        console.error('Error loading FEDs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeds();
  }, [activeUser, filtroDistrito]);

  if (!activeUser || !canViewFeds(activeUser.rol)) {
    return (
      <main className="flex-1 p-6">
        <div className="text-center text-gray-500">
          No tienes permisos para ver este módulo
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Facilitadores Educativos"
        description="Visualiza el perfil y métricas de tu equipo"
      />

      {loading ? (
        <div className="text-center text-gray-500">Cargando FEDs...</div>
      ) : feds.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No hay facilitadores en tu distrito</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {feds.map((fed) => (
            <FedProfileCard key={fed.usuario_id} fed={fed} />
          ))}
        </div>
      )}
    </main>
  );
}
