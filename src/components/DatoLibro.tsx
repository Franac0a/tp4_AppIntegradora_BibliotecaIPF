import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos } from '../constants/tema';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espaciado.md,
    paddingVertical: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  etiqueta: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
  valor: {
    flexShrink: 1,
    color: colores.texto,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
    textAlign: 'right',
  },
});
