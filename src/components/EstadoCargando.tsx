import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes } from '../constants/tema';

type Props = { mensaje: string };

export function EstadoCargando({ mensaje }: Props) {
  return (
    <View style={styles.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colores.primario} />
      <Text style={styles.texto}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.md,
    padding: espaciado.xl,
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
});
