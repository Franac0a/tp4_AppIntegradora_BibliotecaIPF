import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, opacidades, radios, tamanios } from '../constants/tema';

type Props = {
  texto: string;
  onDescartar?: () => void;
};

// Aviso dentro de la app: reemplaza a la notificación cuando no hay permiso.
export function TarjetaAviso({ texto, onDescartar }: Props) {
  return (
    <View style={styles.tarjeta} accessibilityRole="alert">
      <Ionicons name="notifications-outline" size={tamanios.icono} color={colores.info} />
      <Text style={styles.texto}>{texto}</Text>
      {onDescartar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Descartar aviso"
          hitSlop={espaciado.sm}
          onPress={onDescartar}
          style={({ pressed }) => [styles.cerrar, pressed && styles.presionado]}>
          <Ionicons name="close" size={tamanios.icono} color={colores.textoSecundario} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    padding: espaciado.md,
    backgroundColor: colores.superficieAlta,
    borderRadius: radios.md,
    borderLeftWidth: 4,
    borderLeftColor: colores.info,
  },
  texto: {
    flex: 1,
    color: colores.texto,
    fontSize: fuentes.normal,
  },
  cerrar: {
    width: tamanios.areaTactilMinima,
    height: tamanios.areaTactilMinima,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presionado: {
    opacity: opacidades.presionado,
  },
});
