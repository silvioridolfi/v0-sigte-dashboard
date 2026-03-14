'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getHorariosUsuario } from '@/lib/actions/horarios';
import PageHeader from '@/components/ui/page-header';
import HorarioForm from '@/components/horarios/horario-form';
import { useActiveUser } from '@/lib/hooks/use-active-user';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
];

export default function HorariosPage() {
  const { activeUser } = useActiveUser();
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHorarios = async () => {
      if (!activeUser) return;
      
      try {
        const data = await getHorariosUsuario(activeUser.id);
        setHorarios(data);
      } catch (error) {
        console.error('Error loading horarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHorarios();
  }, [activeUser]);

  const handleHorarioSaved = async () => {
    if (!activeUser) return;
    try {
      const data = await getHorariosUsuario(activeUser.id);
      setHorarios(data);
    } catch (error) {
      console.error('Error refreshing horarios:', error);
    }
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Mis Horarios"
        description="Registra tu disponibilidad en el DTE"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario */}
        <Card className="p-6">
          <h3 className="font-semibold text-pba-blue mb-4">Agregar/Editar Horario</h3>
          <HorarioForm onSaved={handleHorarioSaved} />
        </Card>

        {/* Horarios actuales */}
        <Card className="p-6">
          <h3 className="font-semibold text-pba-blue mb-4">Horarios Registrados</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando horarios...</p>
          ) : horarios.length === 0 ? (
            <p className="text-sm text-gray-500">Sin horarios registrados</p>
          ) : (
            <div className="space-y-3">
              {DIAS_SEMANA.map((dia) => {
                const horario = horarios.find((h) => h.dia_semana === dia.id);
                return (
                  <div key={dia.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{dia.nombre}</span>
                    {horario ? (
                      <span className="text-sm text-pba-blue">
                        {horario.hora_inicio} - {horario.hora_fin}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin horario</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
