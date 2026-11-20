import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos, radios } from '../constants/tema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
  posicion: number;
  total: number;
};

export function TarjetaEspera({ libro, posicion, total }: Props) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>EN LISTA DE ESPERA</Text>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.posicion}>
        {posicion === 1
          ? 'Sos la próxima persona en recibirlo.'
          : `Estás en el puesto ${posicion} de ${total}.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: espaciado.lg,
    gap: espaciado.sm,
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  etiqueta: {
    color: colores.aviso,
    fontSize: fuentes.chica,
    fontWeight: pesos.fuerte,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.medio,
  },
  posicion: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
});
