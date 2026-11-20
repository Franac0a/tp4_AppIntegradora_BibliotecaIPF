import type { PermissionResponse } from 'expo';
import { useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState, Linking } from 'react-native';

import { calcularEstadoPermiso, usePermisosNotificaciones } from '../lib/permisos';
import type { EstadoPermiso, RecursoPermiso } from '../types';

type ResultadoUsePermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<PermissionResponse>;
  abrirAjustes: () => Promise<void>;
};

export function usePermiso(recurso: RecursoPermiso): ResultadoUsePermiso {
  // Los dos hooks se llaman siempre (regla de los hooks); solo se usa el del recurso pedido.
  const camara = useCameraPermissions();
  const notificaciones = usePermisosNotificaciones();
  const [respuesta, pedir, consultar] = recurso === 'camara' ? camara : notificaciones;

  // Volver a la pantalla (por ejemplo, al cerrar el modal de permisos) vuelve a consultar.
  useFocusEffect(
    useCallback(() => {
      consultar();
    }, [consultar]),
  );

  // Volver de Ajustes no cambia el foco de la pantalla: la app pasa de "background" a "active".
  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar();
      }
    });
    return () => suscripcion.remove();
  }, [consultar]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  return { estado: calcularEstadoPermiso(respuesta), pedir, abrirAjustes };
}
