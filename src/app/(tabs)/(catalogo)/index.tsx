import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { EstadoListaCatalogo } from '../../../components/EstadoListaCatalogo';
import { FilaLibro } from '../../../components/FilaLibro';
import { Separador } from '../../../components/Separador';
import { colores, espaciado } from '../../../constants/tema';
import { useBiblioteca } from '../../../hooks/useBiblioteca';
import { useLibros } from '../../../hooks/useLibros';

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { disponibles } = useBiblioteca();

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} disponibles={disponibles(item.isbn)} />}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={
        <EstadoListaCatalogo cargando={cargando} error={error} onReintentar={reintentar} />
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    padding: espaciado.lg,
  },
});
