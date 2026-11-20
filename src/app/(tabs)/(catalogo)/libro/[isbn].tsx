import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../../../components/Boton';
import { DatoLibro } from '../../../../components/DatoLibro';
import { LibroNoEncontrado } from '../../../../components/LibroNoEncontrado';
import { colores, espaciado, fuentes, pesos } from '../../../../constants/tema';
import { useBiblioteca } from '../../../../hooks/useBiblioteca';
import { buscarPorIsbn, esIsbnValido } from '../../../../lib/catalogo';

export default function PantallaDetalle() {
  const { isbn } = useLocalSearchParams<'/libro/[isbn]'>();
  const { registrarVisto, disponibles, personasEnEspera, yaReservado } = useBiblioteca();

  // El router acepta cualquier texto en [isbn]: validar es responsabilidad de esta pantalla.
  const libro = esIsbnValido(isbn) ? buscarPorIsbn(isbn) : undefined;
  const isbnEncontrado = libro?.isbn;

  useEffect(() => {
    if (isbnEncontrado) {
      registrarVisto(isbnEncontrado);
    }
  }, [isbnEncontrado, registrarVisto]);

  if (!libro) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <LibroNoEncontrado isbn={isbn} />
      </>
    );
  }

  const cantidadDisponible = disponibles(libro.isbn);
  const enEspera = personasEnEspera(libro.isbn).length;
  const reservado = yaReservado(libro.isbn);

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={styles.cabecera}>
        <Text style={styles.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={styles.autor}>{libro.autor}</Text>
      </View>

      <View>
        <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
        <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(cantidadDisponible)} />
        <DatoLibro
          etiqueta="Personas en lista de espera"
          valor={enEspera === 0 ? 'Nadie' : String(enEspera)}
        />
      </View>

      {reservado ? (
        <Text style={styles.nota}>Ya tenés este libro reservado. Lo ves en «Mis reservas».</Text>
      ) : null}
      <Boton
        titulo="Reservar"
        deshabilitado={reservado}
        onPress={() =>
          router.push({ pathname: '/reservar/[isbn]', params: { isbn: libro.isbn } })
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: espaciado.lg,
    gap: espaciado.xl,
  },
  cabecera: {
    gap: espaciado.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.titulo,
    fontWeight: pesos.fuerte,
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: fuentes.media,
  },
  nota: {
    color: colores.info,
    fontSize: fuentes.normal,
  },
});
