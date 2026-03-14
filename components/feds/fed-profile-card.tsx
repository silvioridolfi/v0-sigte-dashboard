import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface FedProfileCardProps {
  fed: {
    usuario_id: string;
    nombre: string;
    distrito: string;
    visitas_realizadas: number;
    acciones_tecnicas: number;
    acciones_pedagogicas: number;
    total_acciones: number;
  };
}

export default function FedProfileCard({ fed }: FedProfileCardProps) {
  return (
    <Link href={`/feds/${fed.usuario_id}`}>
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-pba-blue">{fed.nombre}</h3>
            <p className="text-xs text-gray-500">{fed.distrito}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-pba-blue/10 p-2">
              <p className="text-gray-600">Visitas</p>
              <p className="font-bold text-pba-blue">{fed.visitas_realizadas}</p>
            </div>
            <div className="rounded bg-pba-cyan/10 p-2">
              <p className="text-gray-600">Acciones</p>
              <p className="font-bold text-pba-cyan">{fed.total_acciones}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">Ver perfil</span>
            <ArrowRight className="h-4 w-4 text-pba-cyan" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
