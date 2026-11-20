const MS_POR_DIA = 24 * 60 * 60 * 1000;

export function sumarDias(desde: Date, dias: number): Date {
  return new Date(desde.getTime() + dias * MS_POR_DIA);
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
