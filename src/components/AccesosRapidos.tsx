import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, opacidades, pesos, radios, tamanios } from '../constants/tema';

type Acceso = {
  titulo: string;
  href: Href;
  icono: ComponentProps<typeof Ionicons>['name'];
};

const ACCESOS: Acceso[] = [
  { titulo: 'Buscar', href: '/buscar', icono: 'search' },
  { titulo: 'Escanear', href: '/escanear', icono: 'barcode-outline' },
];

export function AccesosRapidos() {
  return (
    <View style={styles.fila}>
      {ACCESOS.map((acceso) => (
        <Link key={acceso.titulo} href={acceso.href} asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.acceso, pressed && styles.presionado]}>
            <Ionicons name={acceso.icono} size={tamanios.icono} color={colores.primario} />
            <Text style={styles.texto}>{acceso.titulo}</Text>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  acceso: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.sm,
    minHeight: tamanios.areaTactilMinima,
    paddingVertical: espaciado.md,
    backgroundColor: colores.superficieAlta,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  presionado: {
    opacity: opacidades.presionado,
  },
  texto: {
    color: colores.texto,
    fontSize: fuentes.normal,
    fontWeight: pesos.medio,
  },
});
