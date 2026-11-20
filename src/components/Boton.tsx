import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuentes, opacidades, pesos, radios, tamanios } from '../constants/tema';

type Variante = 'primario' | 'secundario' | 'peligro';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  deshabilitado?: boolean;
  accessibilityHint?: string;
};

export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  deshabilitado = false,
  accessibilityHint,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        pressed && styles.presionado,
        deshabilitado && styles.deshabilitado,
      ]}>
      <Text style={[styles.texto, variante === 'primario' && styles.textoPrimario]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tamanios.areaTactilMinima,
    minWidth: tamanios.areaTactilMinima,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderRadius: radios.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primario: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  secundario: {
    backgroundColor: colores.superficieAlta,
    borderColor: colores.borde,
  },
  peligro: {
    backgroundColor: colores.transparente,
    borderColor: colores.error,
  },
  presionado: {
    opacity: opacidades.presionado,
  },
  deshabilitado: {
    opacity: opacidades.deshabilitado,
  },
  texto: {
    color: colores.texto,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
  },
  textoPrimario: {
    color: colores.sobrePrimario,
  },
});
