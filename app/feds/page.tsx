'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getFEDs } from '@/lib/actions/feds';
import { PageHeader } from '@/components/ui/page-header';
import FedProfileCard from '@/components/feds/fed-profile-card';
import { useActiveUser } from '@/lib/hooks/use-active-user';

type Fed = {
  usuario_id: string;
  nombre: string;
  distrito: string;
  visitas_realizadas: number;
  acciones_tecnicas: number;
  acciones_pedagogicas: number;
  total_acciones: number;
};

export default function FedsPage() {
  const { activeUser } = useActiveUser();
  const [feds, setFeds] = useState<Fed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeds = async () => {
      if (!activeUser || activeUser.rol === 'FED') return;

      try {
        const { feds: data } = await getFEDs();
        // getFEDs retorna usuarios básicos; enriquecemos con métricas en cero por ahora
        const enriched: Fed[] = (data || []).map((u) => ({
          usuario_id: u.id,
          nombre: u.nombre,
          distrito: u.distrito,
          visitas_realizadas: 0,
          acciones_tecnicas: 0,
          acciones_pedagogicas: 0,
          total_acciones: 0,
        }));
        setFeds(enriched);
      } catch (error) {
        console.error('Error loading FEDs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeds();
  }, [activeUser]);

  if (!activeUser || activeUser.rol === 'FED') {
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
          <p className="text-gray-500">No hay facilitadores registrados</p>
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
