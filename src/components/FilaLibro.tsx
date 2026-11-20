import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, opacidades, pesos, radios, tamanios } from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
  disponibles: number;
};

export function FilaLibro({ libro, disponibles }: Props) {
  const hayEjemplares = disponibles > 0;
  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${libro.titulo}, de ${libro.autor}. ${hayEjemplares ? `${disponibles} disponibles` : 'Sin ejemplares'}`}
        style={({ pressed }) => [styles.fila, pressed && styles.presionada]}>
        <View style={styles.textos}>
          <Text style={styles.titulo} numberOfLines={2}>
            {libro.titulo}
          </Text>
          <Text style={styles.autor}>{libro.autor}</Text>
        </View>
        <Text style={[styles.estado, hayEjemplares ? styles.disponible : styles.agotado]}>
          {hayEjemplares ? `${disponibles} disp.` : 'Agotado'}
        </Text>
        <Ionicons name="chevron-forward" size={tamanios.icono} color={colores.textoTenue} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    minHeight: tamanios.areaTactilMinima,
    padding: espaciado.lg,
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionada: {
    opacity: opacidades.presionado,
  },
  textos: {
    flex: 1,
    gap: espaciado.xs,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.medio,
  },
  autor: {
    color: colores.textoSecundario,
    fontSize: fuentes.chica,
  },
  estado: {
    fontSize: fuentes.chica,
    fontWeight: pesos.medio,
  },
  disponible: {
    color: colores.exito,
  },
  agotado: {
    color: colores.aviso,
  },
});
