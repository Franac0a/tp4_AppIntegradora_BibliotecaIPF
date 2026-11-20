import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';
import { Boton } from './Boton';
import { EstadoCargando } from './EstadoCargando';
import { MensajePantalla } from './MensajePantalla';

type Props = {
  termino: string;
  cargando: boolean;
  conError: boolean;
  onReintentar: () => void;
};

// Lo que se ve cuando no hay resultados para mostrar.
export function EstadoBusqueda({ termino, cargando, conError, onReintentar }: Props) {
  if (termino === '') {
    return (
      <MensajePantalla
        icono="search-outline"
        titulo="Buscá en el catálogo"
        descripcion="Escribí parte del título o del nombre del autor."
      />
    );
  }
  if (cargando) {
    return (
      <View style={styles.cargando}>
        <EstadoCargando mensaje={`Buscando «${termino}»…`} />
      </View>
    );
  }
  if (conError) {
    return (
      <MensajePantalla
        icono="cloud-offline-outline"
        tono="error"
        titulo="No pudimos buscar"
        descripcion="Hubo un problema con la conexión. Intentá de nuevo.">
        <Boton titulo="Reintentar" onPress={onReintentar} />
      </MensajePantalla>
    );
  }
  return (
    <MensajePantalla
      icono="sad-outline"
      titulo="Sin resultados"
      descripcion={`No encontramos libros para «${termino}». Probá con otra palabra.`}
    />
  );
}

const styles = StyleSheet.create({
  cargando: {
    paddingVertical: espaciado.xxl,
  },
});
