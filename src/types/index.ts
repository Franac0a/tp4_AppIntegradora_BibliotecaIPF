export type Libro = {
  isbn: string; // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number; // ejemplares en el estante al iniciar la app
};

export type OrigenPrestamo = 'estante' | 'mostrador';

export type Prestamo = {
  isbn: string;
  vence: string; // fecha ISO de devolución
  origen: OrigenPrestamo;
  recordatorioId: string | null;
};

export type Aviso = {
  id: string;
  texto: string;
};

export type RecursoPermiso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type ResultadoReserva =
  | { tipo: 'prestamo'; vence: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'repetida' }
  | { tipo: 'inexistente' };
