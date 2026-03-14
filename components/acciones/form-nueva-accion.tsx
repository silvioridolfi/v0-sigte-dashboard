'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createAccion } from '@/lib/actions/acciones';
import { useActiveUser } from '@/lib/hooks/use-active-user';

export default function FormNuevaAccion() {
  const router = useRouter();
  const { activeUser } = useActiveUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'TECNICA' as 'TECNICA' | 'PEDAGOGICA',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    setLoading(true);
    setError(null);

    try {
      await createAccion({
        tipo: formData.tipo,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        usuario_id: activeUser.id,
      });

      router.push('/acciones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la acción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-pba-blue mb-2">
            Tipo de Acción *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="TECNICA"
                checked={formData.tipo === 'TECNICA'}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'TECNICA' | 'PEDAGOGICA' })}
                className="h-4 w-4"
              />
              <span>Técnica</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="PEDAGOGICA"
                checked={formData.tipo === 'PEDAGOGICA'}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'TECNICA' | 'PEDAGOGICA' })}
                className="h-4 w-4"
              />
              <span>Pedagógica</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-pba-blue mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describe la acción realizada..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pba-cyan focus:outline-none focus:ring-1 focus:ring-pba-cyan"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-pba-blue mb-2">
            Fecha *
          </label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-pba-cyan focus:outline-none focus:ring-1 focus:ring-pba-cyan"
            required
          />
        </div>

        {error && (
          <div className="rounded-lg bg-pba-pink/10 p-3 text-sm text-pba-pink">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.descripcion}
            className="bg-pba-cyan hover:bg-pba-cyan/90"
          >
            {loading ? 'Guardando...' : 'Guardar Acción'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
