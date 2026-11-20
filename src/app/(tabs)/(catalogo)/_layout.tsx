import { Stack } from 'expo-router';

import { EnlacePersonal } from '../../../components/EnlacePersonal';
import { opcionesEncabezado } from '../../../constants/navegacion';

// Un deep link a /libro/[isbn] deja el Catálogo debajo dentro de esta pestaña.
export const unstable_settings = {
  anchor: 'index',
};

export default function LayoutCatalogo() {
  return (
    <Stack screenOptions={opcionesEncabezado}>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <EnlacePersonal /> }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
