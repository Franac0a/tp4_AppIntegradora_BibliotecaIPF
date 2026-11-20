import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Boton } from '../components/Boton';
import { MensajePantalla } from '../components/MensajePantalla';
import { Separador } from '../components/Separador';
import { TarjetaAviso } from '../components/TarjetaAviso';
import { TarjetaMostrador } from '../components/TarjetaMostrador';
import { NOMBRE_USUARIO } from '../constants/biblioteca';
import { colores, espaciado } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { buscarPorIsbn } from '../lib/catalogo';
import type { Libro } from '../types';

export default function PantallaMostrador() {
  const { isbnsConEspera, personasEnEspera, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const [ultimaEntrega, setUltimaEntrega] = useState<string | null>(null);

  const libros = isbnsConEspera
    .map((isbn) => buscarPorIsbn(isbn))
    .filter((libro): libro is Libro => libro !== undefined);

  async function entregar(libro: Libro) {
    const persona = await entregarAlSiguiente(libro.isbn);
    if (persona === null) {
      setUltimaEntrega(`Nadie espera «${libro.titulo}» en este momento.`);
      return;
    }
    const destinatario = persona === NOMBRE_USUARIO ? 'la persona usuaria de la app' : persona;
    setUltimaEntrega(`Entregaste «${libro.titulo}» a ${destinatario}.`);
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      ItemSeparatorComponent={Separador}
      renderItem={({ item }) => (
        <TarjetaMostrador
          libro={item}
          personas={personasEnEspera(item.isbn)}
          onEntregar={() => entregar(item)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.encabezado}>
          {ultimaEntrega ? <TarjetaAviso texto={ultimaEntrega} /> : null}
        </View>
      }
      ListEmptyComponent={
        <MensajePantalla
          icono="checkmark-done-outline"
          titulo="No hay listas de espera"
          descripcion="Todos los libros reservados ya fueron entregados."
        />
      }
      ListFooterComponent={
        <View style={styles.pie}>
          <Boton titulo="Cerrar sesión" variante="peligro" onPress={cerrarSesion} />
        </View>
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
  encabezado: {
    paddingBottom: espaciado.md,
  },
  pie: {
    paddingTop: espaciado.xl,
  },
});
