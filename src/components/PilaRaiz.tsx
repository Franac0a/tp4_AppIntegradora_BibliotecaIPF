import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { opcionesEncabezado } from '../constants/navegacion';
import { useBiblioteca } from '../hooks/useBiblioteca';

// Stack raíz. Vive fuera de src/app porque necesita leer la sesión del Context,
// y el provider se monta en el layout raíz que lo contiene.
export function PilaRaiz() {
  const { sesionIniciada, listo } = useBiblioteca();

  useEffect(() => {
    if (listo) {
      SplashScreen.hideAsync();
    }
  }, [listo]);

  // Hasta cargar lo guardado se mantiene el splash en lugar de una app vacía.
  if (!listo) {
    return null;
  }

  return (
    <Stack screenOptions={opcionesEncabezado}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
      <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
      <Stack.Screen
        name="reservar/[isbn]"
        options={{ presentation: 'modal', title: 'Confirmar reserva' }}
      />
      <Stack.Screen
        name="permisos/[recurso]"
        options={{ presentation: 'modal', title: 'Permiso' }}
      />
      <Stack.Protected guard={!sesionIniciada}>
        <Stack.Screen
          name="login"
          options={{ presentation: 'modal', title: 'Ingreso del personal' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={sesionIniciada}>
        <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
      </Stack.Protected>
      <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
    </Stack>
  );
}
