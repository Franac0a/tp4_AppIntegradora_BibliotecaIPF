import { createPermissionHook, type PermissionResponse } from 'expo';
import * as Notifications from 'expo-notifications';

import type { EstadoPermiso, RecursoPermiso } from '../types';
import { pedirPermisoNotificaciones } from './notificaciones';

// Mismo formato que useCameraPermissions: [respuesta, pedir, consultar].
// pedirPermisoNotificaciones crea el canal de Android antes de mostrar el diálogo.
export const usePermisosNotificaciones = createPermissionHook({
  getMethod: () => Notifications.getPermissionsAsync(),
  requestMethod: () => pedirPermisoNotificaciones(),
});

// Traduce la respuesta del sistema a los cuatro estados de la app.
// canAskAgain distingue "todavía se puede preguntar" de "bloqueado": status solo dice "denied" en ambos.
export function calcularEstadoPermiso(respuesta: PermissionResponse | null): EstadoPermiso {
  if (respuesta === null) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function esRecursoPermiso(valor: string): valor is RecursoPermiso {
  return valor === 'camara' || valor === 'notificaciones';
}

export const TEXTOS_PERMISO: Record<
  RecursoPermiso,
  { titulo: string; beneficio: string; alternativa: string }
> = {
  camara: {
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro al instante.',
    alternativa: 'Si no la permitís, igual podés escribir el ISBN a mano.',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio:
      'Usamos las notificaciones para recordarte la devolución de tus préstamos y avisarte cuando un libro que esperás está listo.',
    alternativa: 'Si no las permitís, los avisos te van a aparecer dentro de la app.',
  },
};
