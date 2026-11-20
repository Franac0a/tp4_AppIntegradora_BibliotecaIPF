import { StyleSheet, Switch, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos, radios, tamanios } from '../constants/tema';
import { formatearFecha } from '../lib/fechas';
import type { Libro, Prestamo } from '../types';
import { Boton } from './Boton';

type Props = {
  libro: Libro;
  prestamo: Prestamo;
  onCambiarRecordatorio: (activo: boolean) => void;
  onDevolver: () => void;
};

export function TarjetaPrestamo({ libro, prestamo, onCambiarRecordatorio, onDevolver }: Props) {
  const recordatorioActivo = prestamo.recordatorioId !== null;
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.etiqueta}>PRÉSTAMO</Text>
      <Text style={styles.titulo}>{libro.titulo}</Text>
      <Text style={styles.vence}>Devolución: {formatearFecha(prestamo.vence)}</Text>
      <View style={styles.filaInterruptor}>
        <Text style={styles.textoInterruptor} nativeID={`recordarme-${libro.isbn}`}>
          Recordarme
        </Text>
        <Switch
          accessibilityLabel={`Recordarme la devolución de ${libro.titulo}`}
          accessibilityLabelledBy={`recordarme-${libro.isbn}`}
          value={recordatorioActivo}
          onValueChange={onCambiarRecordatorio}
          trackColor={{ false: colores.borde, true: colores.primarioPresionado }}
          thumbColor={recordatorioActivo ? colores.primario : colores.textoSecundario}
        />
      </View>
      <Boton titulo="Devolver" variante="peligro" onPress={onDevolver} />
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
    color: colores.exito,
    fontSize: fuentes.chica,
    fontWeight: pesos.fuerte,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.media,
    fontWeight: pesos.medio,
  },
  vence: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
  },
  filaInterruptor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: tamanios.areaTactilMinima,
  },
  textoInterruptor: {
    color: colores.texto,
    fontSize: fuentes.normal,
  },
});
