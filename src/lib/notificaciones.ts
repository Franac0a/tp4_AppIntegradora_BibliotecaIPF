import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO } from '../constants/biblioteca';
import { colores } from '../constants/tema';

export type DatosNotificacion = { isbn: string };

// Muestra la notificación aunque la app esté abierta.
export function configurarNotificaciones(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// En Android 13+ el diálogo de permiso solo aparece si existe al menos un canal.
export async function crearCanalPrestamos(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: 'Préstamos',
    description: 'Recordatorios de devolución y libros listos para retirar.',
    importance: AndroidImportance.HIGH,
    lightColor: colores.primario,
  });
}

export async function pedirPermisoNotificaciones() {
  await crearCanalPrestamos();
  return Notifications.requestPermissionsAsync();
}

export async function tienePermisoNotificaciones(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export async function programarRecordatorio(isbn: string, titulo: string): Promise<string> {
  const datos: DatosNotificacion = { isbn };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Se acerca la devolución',
      body: `Acordate de devolver «${titulo}» en la biblioteca.`,
      data: datos,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function cancelarRecordatorio(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function obtenerIdsProgramados(): Promise<string[]> {
  const programadas = await Notifications.getAllScheduledNotificationsAsync();
  return programadas.map((notificacion) => notificacion.identifier);
}

// Consulta el permiso en el momento: si la persona lo cambió en Ajustes, se respeta.
// Devuelve false cuando no se pudo notificar, para que la app avise dentro de la pantalla.
export async function avisarLibroDisponible(titulo: string): Promise<boolean> {
  if (!(await tienePermisoNotificaciones())) {
    return false;
  }
  await crearCanalPrestamos();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Tu libro está disponible!',
      body: `Ya podés retirar «${titulo}» en el mostrador.`,
    },
    trigger: Platform.OS === 'android' ? { channelId: CANAL_PRESTAMOS } : null,
  });
  return true;
}

export function esDatosNotificacion(valor: unknown): valor is DatosNotificacion {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'isbn' in valor &&
    typeof valor.isbn === 'string'
  );
}
