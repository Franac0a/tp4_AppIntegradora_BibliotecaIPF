// Paleta oscura única de la app: todos los colores, tamaños y espaciados salen de acá.
export const colores = {
  fondo: '#0E1116',
  superficie: '#161B22',
  superficieAlta: '#1F2630',
  borde: '#2D3540',
  texto: '#E6EDF3',
  textoSecundario: '#9DA7B3',
  textoTenue: '#6E7681',
  primario: '#E0A458',
  primarioPresionado: '#C98B3F',
  sobrePrimario: '#1A1206',
  exito: '#4FBF8B',
  error: '#F2777A',
  aviso: '#E5C07B',
  info: '#6CB6FF',
  transparente: 'transparent',
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radios = {
  sm: 8,
  md: 12,
  lg: 16,
  pastilla: 999,
} as const;

export const fuentes = {
  chica: 13,
  normal: 15,
  media: 17,
  grande: 20,
  titulo: 26,
} as const;

export const pesos = {
  normal: '400',
  medio: '600',
  fuerte: '700',
} as const;

export const tamanios = {
  areaTactilMinima: 44,
  icono: 22,
  iconoGrande: 48,
  visorEscaner: 240,
  anchoTarjetaReciente: 150,
} as const;

export const opacidades = {
  presionado: 0.7,
  deshabilitado: 0.4,
} as const;
