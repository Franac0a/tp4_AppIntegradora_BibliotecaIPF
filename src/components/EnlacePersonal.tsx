import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espaciado, fuentes, opacidades, pesos, tamanios } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';

// Link "Personal" del header: con sesión va directo al mostrador.
export function EnlacePersonal() {
  const { sesionIniciada } = useBiblioteca();
  return (
    <Link href={sesionIniciada ? '/mostrador' : '/login'} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sesionIniciada ? 'Ir al mostrador' : 'Ingreso del personal'}
        style={({ pressed }) => [styles.boton, pressed && styles.presionado]}>
        <Text style={styles.texto}>{sesionIniciada ? 'Mostrador' : 'Personal'}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: tamanios.areaTactilMinima,
    minWidth: tamanios.areaTactilMinima,
    paddingHorizontal: espaciado.sm,
    justifyContent: 'center',
  },
  presionado: {
    opacity: opacidades.presionado,
  },
  texto: {
    color: colores.primario,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
  },
});
