import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { AvisosReservas } from '../../components/AvisosReservas';
import { Boton } from '../../components/Boton';
import { MensajePantalla } from '../../components/MensajePantalla';
import { Separador } from '../../components/Separador';
import { TarjetaEspera } from '../../components/TarjetaEspera';
import { TarjetaPrestamo } from '../../components/TarjetaPrestamo';
import { colores, espaciado } from '../../constants/tema';
import { useBiblioteca } from '../../hooks/useBiblioteca';
import { usePermiso } from '../../hooks/usePermiso';
import { buscarPorIsbn } from '../../lib/catalogo';
import type { Libro, Prestamo } from '../../types';

// Un libro no puede estar prestado y en espera a la vez, así que el ISBN sirve de key.
type Item =
  | { tipo: 'prestamo'; libro: Libro; prestamo: Prestamo }
  | { tipo: 'espera'; libro: Libro };

export default function PantallaMisReservas() {
  const {
    prestamos,
    misEsperas,
    posicionEnEspera,
    personasEnEspera,
    devolver,
    activarRecordatorio,
    desactivarRecordatorio,
  } = useBiblioteca();
  const { estado: estadoNotificaciones } = usePermiso('notificaciones');

  const items: Item[] = [];
  prestamos.forEach((prestamo) => {
    const libro = buscarPorIsbn(prestamo.isbn);
    if (libro) {
      items.push({ tipo: 'prestamo', libro, prestamo });
    }
  });
  misEsperas.forEach((isbn) => {
    const libro = buscarPorIsbn(isbn);
    if (libro) {
      items.push({ tipo: 'espera', libro });
    }
  });

  function cambiarRecordatorio(isbn: string, activo: boolean) {
    if (!activo) {
      desactivarRecordatorio(isbn);
      return;
    }
    // El permiso se pide recién acá, cuando la persona quiere el recordatorio.
    if (estadoNotificaciones === 'concedido') {
      activarRecordatorio(isbn);
      return;
    }
    router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones', isbn } });
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={items}
      keyExtractor={(item) => item.libro.isbn}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={<AvisosReservas estadoNotificaciones={estadoNotificaciones} />}
      ListEmptyComponent={
        <MensajePantalla
          icono="bookmark-outline"
          titulo="No tenés reservas"
          descripcion="Elegí un libro del catálogo y tocá «Reservar».">
          <Boton titulo="Ir al catálogo" onPress={() => router.navigate('/')} />
        </MensajePantalla>
      }
      renderItem={({ item }) =>
        item.tipo === 'prestamo' ? (
          <TarjetaPrestamo
            libro={item.libro}
            prestamo={item.prestamo}
            onCambiarRecordatorio={(activo) => cambiarRecordatorio(item.libro.isbn, activo)}
            onDevolver={() => devolver(item.libro.isbn)}
          />
        ) : (
          <TarjetaEspera
            libro={item.libro}
            posicion={posicionEnEspera(item.libro.isbn)}
            total={personasEnEspera(item.libro.isbn).length}
          />
        )
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
