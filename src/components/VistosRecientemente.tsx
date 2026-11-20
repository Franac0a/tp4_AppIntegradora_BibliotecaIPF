import { FlatList, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { buscarPorIsbn } from '../lib/catalogo';
import type { Libro } from '../types';
import { SeparadorHorizontal } from './SeparadorHorizontal';
import { TarjetaReciente } from './TarjetaReciente';

export function VistosRecientemente() {
  const { recientes } = useBiblioteca();
  const libros = recientes
    .map((isbn) => buscarPorIsbn(isbn))
    .filter((libro): libro is Libro => libro !== undefined);

  return (
    <View style={styles.seccion}>
      <Text style={styles.titulo} accessibilityRole="header">
        Vistos recientemente
      </Text>
      <FlatList
        horizontal
        data={libros}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <TarjetaReciente libro={item} />}
        ItemSeparatorComponent={SeparadorHorizontal}
        ListEmptyComponent={
          <Text style={styles.vacio}>Los libros que abras van a aparecer acá.</Text>
        }
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: {
    gap: espaciado.sm,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.fuerte,
  },
  vacio: {
    color: colores.textoTenue,
    fontSize: fuentes.chica,
  },
});
