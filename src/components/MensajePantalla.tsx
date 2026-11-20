import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos, tamanios } from '../constants/tema';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];
type Tono = 'neutro' | 'error' | 'aviso';

type Props = {
  icono: NombreIcono;
  titulo: string;
  descripcion?: string;
  tono?: Tono;
  children?: ReactNode;
};

const COLOR_POR_TONO: Record<Tono, string> = {
  neutro: colores.textoSecundario,
  error: colores.error,
  aviso: colores.aviso,
};

// Pantalla centrada para estados de error, vacío o "no encontrado", con acciones debajo.
export function MensajePantalla({ icono, titulo, descripcion, tono = 'neutro', children }: Props) {
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={tamanios.iconoGrande} color={COLOR_POR_TONO[tono]} />
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
      {children ? <View style={styles.acciones}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
    padding: espaciado.xl,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.grande,
    fontWeight: pesos.fuerte,
    textAlign: 'center',
  },
  descripcion: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
    textAlign: 'center',
  },
  acciones: {
    marginTop: espaciado.sm,
    gap: espaciado.sm,
    alignSelf: 'stretch',
  },
});
