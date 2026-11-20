import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';
import { Boton } from './Boton';
import { EstadoCargando } from './EstadoCargando';
import { MensajePantalla } from './MensajePantalla';

type Props = {
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
};

// Lo que muestra la lista cuando no hay libros: cargando, error o vacío.
export function EstadoListaCatalogo({ cargando, error, onReintentar }: Props) {
  if (cargando) {
    return (
      <View style={styles.contenedor}>
        <EstadoCargando mensaje="Cargando el catálogo…" />
      </View>
    );
  }
  if (error) {
    return (
      <MensajePantalla icono="cloud-offline-outline" titulo="Sin conexión" descripcion={error} tono="error">
        <Boton titulo="Reintentar" onPress={onReintentar} />
      </MensajePantalla>
    );
  }
  return (
    <MensajePantalla
      icono="book-outline"
      titulo="El catálogo está vacío"
      descripcion="Todavía no hay libros cargados en la biblioteca."
    />
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingVertical: espaciado.xxl,
  },
});
