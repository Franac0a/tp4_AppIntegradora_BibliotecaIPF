import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuentes, opacidades, pesos, radios, tamanios } from '../constants/tema';
import type { Libro } from '../types';

type Props = { libro: Libro };

export function TarjetaReciente({ libro }: Props) {
  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Visto recientemente: ${libro.titulo}`}
        style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}>
        <Text style={styles.titulo} numberOfLines={2}>
          {libro.titulo}
        </Text>
        <Text style={styles.autor} numberOfLines={1}>
          {libro.autor}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    width: tamanios.anchoTarjetaReciente,
    minHeight: tamanios.areaTactilMinima,
    padding: espaciado.md,
    gap: espaciado.xs,
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionada: {
    opacity: opacidades.presionado,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: fuentes.chica,
  },
});
