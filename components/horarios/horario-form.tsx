'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { guardarHorario } from '@/lib/actions/horarios';
import { useActiveUser } from '@/lib/hooks/use-active-user';

const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
];

interface HorarioFormProps {
  onSaved?: () => void;
}

export default function HorarioForm({ onSaved }: HorarioFormProps) {
  const { activeUser } = useActiveUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dia_semana: 1,
    hora_inicio: '08:00',
    hora_fin: '17:00',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    setLoading(true);
    setError(null);

    try {
      await guardarHorario({
        usuario_id: activeUser.id,
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      });

      onSaved?.();
      setFormData({ dia_semana: 1, hora_inicio: '08:00', hora_fin: '17:00' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar horario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-pba-blue mb-2">
          Día de la Semana *
        </label>
        <select
          value={formData.dia_semana}
          onChange={(e) => setFormData({ ...formData, dia_semana: parseInt(e.target.value) })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pba-cyan focus:outline-none focus:ring-1 focus:ring-pba-cyan"
        >
          {DIAS_SEMANA.map((dia) => (
            <option key={dia.id} value={dia.id}>
              {dia.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-pba-blue mb-2">
            Hora Inicio *
          </label>
          <input
            type="time"
            value={formData.hora_inicio}
            onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pba-cyan focus:outline-none focus:ring-1 focus:ring-pba-cyan"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pba-blue mb-2">
            Hora Fin *
          </label>
          <input
            type="time"
            value={formData.hora_fin}
            onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pba-cyan focus:outline-none focus:ring-1 focus:ring-pba-cyan"
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-pba-pink/10 p-3 text-sm text-pba-pink">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-pba-cyan hover:bg-pba-cyan/90"
      >
        {loading ? 'Guardando...' : 'Guardar Horario'}
      </Button>
    </form>
  );
}
