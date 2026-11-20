import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos } from '../constants/tema';
import { AccesosRapidos } from './AccesosRapidos';
import { VistosRecientemente } from './VistosRecientemente';

export function EncabezadoCatalogo() {
  return (
    <View style={styles.contenedor}>
      <AccesosRapidos />
      <VistosRecientemente />
      <Text style={styles.titulo} accessibilityRole="header">
        Todos los libros
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.xl,
    paddingBottom: espaciado.md,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.fuerte,
  },
});
