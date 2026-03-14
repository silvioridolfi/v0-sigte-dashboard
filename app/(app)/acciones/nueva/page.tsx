'use client';

import FormNuevaAccion from '@/components/acciones/form-nueva-accion';
import { PageHeader } from '@/components/ui/page-header';

export default function NuevaAccionPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Nueva Acción"
        description="Registra una acción técnica o pedagógica"
        backHref="/acciones"
      />
      <FormNuevaAccion />
    </main>
  );
}
