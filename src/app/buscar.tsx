import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '../components/CampoTexto';
import { EstadoBusqueda } from '../components/EstadoBusqueda';
import { FilaLibro } from '../components/FilaLibro';
import { Separador } from '../components/Separador';
import { colores, espaciado } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { useBusqueda } from '../hooks/useBusqueda';

type Parametros = { q?: string };

export default function PantallaBuscar() {
  // La búsqueda vive en la URL (/buscar?q=…): se puede compartir y abrir por deep link.
  const { q } = useLocalSearchParams<Parametros>();
  const consulta = typeof q === 'string' ? q : '';
  // Estado local solo para que el campo responda al instante mientras se actualiza la URL.
  const [texto, setTexto] = useState(consulta);
  const { libros, cargando, conError, reintentar } = useBusqueda(consulta.trim());
  const { disponibles } = useBiblioteca();

  function cambiarTexto(valor: string) {
    setTexto(valor);
    // setParams reemplaza el parámetro de la pantalla actual: no apila una pantalla por letra.
    router.setParams({ q: valor });
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.buscador}>
        <CampoTexto
          accessibilityLabel="Buscar por título o autor"
          value={texto}
          onChangeText={cambiarTexto}
          placeholder="Título o autor"
          autoFocus={consulta === ''}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <FlatList
        contentContainerStyle={styles.contenido}
        data={libros}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} disponibles={disponibles(item.isbn)} />}
        ItemSeparatorComponent={Separador}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EstadoBusqueda
            termino={consulta.trim()}
            cargando={cargando}
            conError={conError}
            onReintentar={reintentar}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  buscador: {
    padding: espaciado.lg,
    paddingBottom: espaciado.sm,
  },
  contenido: {
    flexGrow: 1,
    padding: espaciado.lg,
  },
});
