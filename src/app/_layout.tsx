import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PilaRaiz } from '../components/PilaRaiz';
import { temaNavegacion } from '../constants/navegacion';
import { BibliotecaProvider } from '../context/BibliotecaContext';
import { configurarNotificaciones } from '../lib/notificaciones';

// Un deep link a /buscar (o a cualquier ruta del Stack raíz) deja las pestañas debajo.
export const unstable_settings = {
  anchor: '(tabs)',
};

configurarNotificaciones();

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <ThemeProvider value={temaNavegacion}>
        <StatusBar style="light" />
        <PilaRaiz />
      </ThemeProvider>
    </BibliotecaProvider>
  );
}
