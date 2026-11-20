import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '../../components/Boton';
import { LibroNoEncontrado } from '../../components/LibroNoEncontrado';
import { MensajePantalla } from '../../components/MensajePantalla';
import { DIAS_PRESTAMO } from '../../constants/biblioteca';
import { colores, espaciado, fuentes, pesos, radios } from '../../constants/tema';
import { useBiblioteca } from '../../hooks/useBiblioteca';
import { buscarPorIsbn, esIsbnValido } from '../../lib/catalogo';
import { formatearFecha, sumarDias } from '../../lib/fechas';

export default function PantallaConfirmarReserva() {
  const { isbn } = useLocalSearchParams<'/reservar/[isbn]'>();
  const { disponibles, personasEnEspera, yaReservado, reservar } = useBiblioteca();
  // Evita que, durante la animación de cierre, se vea "Ya reservaste" por la reserva recién hecha.
  const [confirmada, setConfirmada] = useState(false);

  const libro = esIsbnValido(isbn) ? buscarPorIsbn(isbn) : undefined;
  if (!libro) {
    return <LibroNoEncontrado isbn={isbn} />;
  }

  if (yaReservado(libro.isbn) && !confirmada) {
    return (
      <MensajePantalla
        icono="bookmark"
        tono="aviso"
        titulo="Ya reservaste este libro"
        descripcion="No se puede reservar dos veces el mismo libro.">
        <Boton titulo="Ver mis reservas" onPress={() => router.dismissTo('/reservas')} />
      </MensajePantalla>
    );
  }

  const hayEjemplares = disponibles(libro.isbn) > 0;
  const posicionFutura = personasEnEspera(libro.isbn).length + 1;
  const devolucion = formatearFecha(sumarDias(new Date(), DIAS_PRESTAMO).toISOString());

  const isbnLibro = libro.isbn;
  function confirmar() {
    setConfirmada(true);
    reservar(isbnLibro);
    // dismissTo cierra el modal y vuelve a la pestaña ya existente: "atrás" no regresa acá.
    router.dismissTo('/reservas');
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo} accessibilityRole="header">
        {libro.titulo}
      </Text>
      <View style={[styles.tarjeta, hayEjemplares ? styles.tarjetaPrestamo : styles.tarjetaEspera]}>
        <Text style={styles.tipo}>{hayEjemplares ? 'Préstamo' : 'Lista de espera'}</Text>
        <Text style={styles.detalle}>
          {hayEjemplares
            ? `Hay un ejemplar para vos. Te lo prestamos por ${DIAS_PRESTAMO} días: lo devolvés el ${devolucion}.`
            : `No quedan ejemplares en el estante. Vas a quedar en el puesto ${posicionFutura} de la lista de espera y te avisamos cuando sea tu turno.`}
        </Text>
      </View>
      <View style={styles.acciones}>
        <Boton titulo="Confirmar" onPress={confirmar} />
        <Boton titulo="Cancelar" variante="secundario" onPress={() => router.back()} />
      </View>
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
  titulo: {
    color: colores.texto,
    fontSize: fuentes.titulo,
    fontWeight: pesos.fuerte,
  },
  tarjeta: {
    padding: espaciado.lg,
    gap: espaciado.sm,
    borderRadius: radios.md,
    borderWidth: 1,
    backgroundColor: colores.superficie,
  },
  tarjetaPrestamo: {
    borderColor: colores.exito,
  },
  tarjetaEspera: {
    borderColor: colores.aviso,
  },
  tipo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.fuerte,
  },
  detalle: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
  acciones: {
    gap: espaciado.sm,
  },
});
