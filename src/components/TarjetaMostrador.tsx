import { StyleSheet, Text, View } from 'react-native';

import { NOMBRE_USUARIO } from '../constants/biblioteca';
import { colores, espaciado, fuentes, pesos, radios } from '../constants/tema';
import type { Libro } from '../types';
import { Boton } from './Boton';

type Props = {
  libro: Libro;
  personas: string[];
  onEntregar: () => void;
};

export function TarjetaMostrador({ libro, personas, onEntregar }: Props) {
  const alFrente = personas[0];
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.detalle}>
        Al frente:{' '}
        <Text style={styles.persona}>
          {alFrente === NOMBRE_USUARIO ? 'Vos (persona usuaria de la app)' : alFrente}
        </Text>
      </Text>
      <Text style={styles.detalle}>
        {personas.length === 1 ? '1 persona espera' : `${personas.length} personas esperan`}
      </Text>
      <Boton
        titulo="Entregar al siguiente"
        onPress={onEntregar}
        accessibilityHint={`Entrega «${libro.titulo}» a ${alFrente}`}
      />
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
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.medio,
  },
  detalle: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
  persona: {
    color: colores.primario,
    fontWeight: pesos.medio,
  },
});
