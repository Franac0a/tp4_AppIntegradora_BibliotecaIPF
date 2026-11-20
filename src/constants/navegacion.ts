import { DarkTheme, type Theme } from 'expo-router';

import { colores, fuentes, pesos } from './tema';

// Tema oscuro de los navegadores, armado con los mismos colores de tema.ts.
export const temaNavegacion: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colores.primario,
    background: colores.fondo,
    card: colores.superficie,
    text: colores.texto,
    border: colores.borde,
    notification: colores.primario,
  },
};

export const opcionesEncabezado = {
  headerStyle: { backgroundColor: colores.superficie },
  headerTintColor: colores.texto,
  headerTitleStyle: { fontSize: fuentes.media, fontWeight: pesos.fuerte },
  contentStyle: { backgroundColor: colores.fondo },
} as const;

export const opcionesPestanias = {
  tabBarActiveTintColor: colores.primario,
  tabBarInactiveTintColor: colores.textoSecundario,
  tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
  headerStyle: { backgroundColor: colores.superficie },
  headerTintColor: colores.texto,
} as const;
