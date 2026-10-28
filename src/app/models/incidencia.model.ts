
export type PrioridadIncidencia = 'baja' | 'media' | 'alta';

export type EstadoIncidencia =
  | 'pendiente'
  | 'en progreso'
  | 'resuelta';

export interface Incidencia {
  id?: string;
  codigo: string;
  tipo: string;
  descripcion: string;
  dirreccion: string;
  sector: string;
  prioridad: PrioridadIncidencia;
  estado: EstadoIncidencia;
  fotografia: string;
  latitud?: number | null;
  longitud?: number | null;
  observacion: string;
  fecha: string;
}
