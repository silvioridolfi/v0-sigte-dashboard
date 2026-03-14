'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Filter, Calendar } from 'lucide-react';
import { getAccionesPorUsuario } from '@/lib/actions/acciones';
import { useActiveUser } from '@/lib/hooks/use-active-user';
import { PageHeader } from '@/components/ui/page-header';

type Accion = Awaited<ReturnType<typeof getAccionesPorUsuario>>["acciones"][number];

export default function AccionesPage() {
  const { activeUser } = useActiveUser();
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<'TODAS' | 'TECNICA' | 'PEDAGOGICA'>('TODAS');

  useEffect(() => {
    const loadAcciones = async () => {
      if (!activeUser) return;
      try {
        const { acciones: data } = await getAccionesPorUsuario(activeUser.id);
        setAcciones(data);
      } catch (error) {
        console.error('Error loading acciones:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAcciones();
  }, [activeUser]);

  const accionesFiltradas = acciones.filter(
    (a) => tipoFiltro === 'TODAS' || a.tipo === tipoFiltro
  );

  const accionesPorTipo = {
    tecnicas: accionesFiltradas.filter((a) => a.tipo === 'TECNICA').length,
    pedagogicas: accionesFiltradas.filter((a) => a.tipo === 'PEDAGOGICA').length,
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Acciones"
        description="Registra acciones técnicas y pedagógicas asociadas a tus visitas"
        action={
          <Link href="/acciones/nueva">
            <Button className="gap-2 bg-pba-cyan hover:bg-pba-cyan/90">
              <Plus className="h-4 w-4" />
              Nueva Acción
            </Button>
          </Link>
        }
      />

      {/* Filtros y métricas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Acciones Técnicas</p>
            <p className="text-3xl font-bold text-pba-blue">{accionesPorTipo.tecnicas}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Acciones Pedagógicas</p>
            <p className="text-3xl font-bold text-pba-cyan">{accionesPorTipo.pedagogicas}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-3xl font-bold text-pba-blue">{accionesFiltradas.length}</p>
          </div>
        </Card>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-2">
        <Button
          variant={tipoFiltro === 'TODAS' ? 'default' : 'outline'}
          onClick={() => setTipoFiltro('TODAS')}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Todas
        </Button>
        <Button
          variant={tipoFiltro === 'TECNICA' ? 'default' : 'outline'}
          onClick={() => setTipoFiltro('TECNICA')}
          className={tipoFiltro === 'TECNICA' ? 'bg-pba-blue hover:bg-pba-blue/90' : ''}
        >
          Técnicas
        </Button>
        <Button
          variant={tipoFiltro === 'PEDAGOGICA' ? 'default' : 'outline'}
          onClick={() => setTipoFiltro('PEDAGOGICA')}
          className={tipoFiltro === 'PEDAGOGICA' ? 'bg-pba-cyan hover:bg-pba-cyan/90' : ''}
        >
          Pedagógicas
        </Button>
      </div>

      {/* Listado de acciones */}
      {loading ? (
        <div className="text-center text-gray-500">Cargando acciones...</div>
      ) : accionesFiltradas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No hay acciones registradas</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {accionesFiltradas.map((accion) => (
            <Card key={accion.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-2 py-1 text-xs font-semibold text-white ${
                        accion.tipo === 'TECNICA'
                          ? 'bg-pba-blue'
                          : 'bg-pba-cyan'
                      }`}
                    >
                      {accion.tipo === 'TECNICA' ? 'Técnica' : 'Pedagógica'}
                    </span>
                    <span className="text-sm text-gray-500">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {new Date(accion.fecha).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{accion.descripcion}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
