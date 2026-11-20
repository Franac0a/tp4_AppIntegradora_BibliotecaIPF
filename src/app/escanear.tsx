import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '../components/Boton';
import { EstadoCargando } from '../components/EstadoCargando';
import { IngresoIsbn } from '../components/IngresoIsbn';
import { MensajePantalla } from '../components/MensajePantalla';
import { VisorEscaner } from '../components/VisorEscaner';
import { colores, espaciado } from '../constants/tema';
import { usePermiso } from '../hooks/usePermiso';

export default function PantallaEscanear() {
  const { estado, abrirAjustes } = usePermiso('camara');

  // replace: el escáner sale de la pila y "atrás" desde el detalle no vuelve a la cámara.
  function abrirLibro(isbn: string) {
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        {estado === 'cargando' ? <EstadoCargando mensaje="Preparando la cámara…" /> : null}

        {estado === 'concedido' ? <VisorEscaner onLibroEncontrado={abrirLibro} /> : null}

        {estado === 'preguntable' ? (
          <MensajePantalla
            icono="camera-outline"
            titulo="Escaneá el código del libro"
            descripcion="Para leer el código de barras necesitamos usar la cámara.">
            <Boton titulo="Usar la cámara" onPress={() => router.push('/permisos/camara')} />
          </MensajePantalla>
        ) : null}

        {estado === 'bloqueado' ? (
          <MensajePantalla
            icono="eye-off-outline"
            tono="aviso"
            titulo="La cámara está bloqueada"
            descripcion="Podés habilitarla en los Ajustes del teléfono o escribir el ISBN acá abajo.">
            <Boton titulo="Abrir Ajustes" variante="secundario" onPress={abrirAjustes} />
          </MensajePantalla>
        ) : null}

        <IngresoIsbn onLibroEncontrado={abrirLibro} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    padding: espaciado.lg,
    gap: espaciado.xl,
  },
});
