// Nombre con el que la persona usuaria aparece en las listas de espera.
export const NOMBRE_USUARIO = 'Vos';

export const DIAS_PRESTAMO = 7;

// Modo demostración: el recordatorio llega a los 15 segundos en lugar de días.
export const SEGUNDOS_RECORDATORIO = 15;

export const CANAL_PRESTAMOS = 'prestamos';

export const CANTIDAD_RECIENTES = 3;

export const DEMORA_BUSQUEDA_MS = 300;

export const DEMORA_GUARDADO_MS = 300;

// Credenciales fijas del personal (consigna: usuario y clave fijos en el código).
export const CREDENCIALES_PERSONAL = {
  usuario: 'biblioteca',
  clave: 'ipf2026',
} as const;
