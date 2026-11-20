import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';

import { colores } from '../constants/tema';

type Props = {
  nombre: ComponentProps<typeof Ionicons>['name'];
  color: ColorValue;
  size: number;
};

export function IconoTab({ nombre, color, size }: Props) {
  // Las pestañas siempre mandan un color en texto; si no, se usa el secundario del tema.
  const colorIcono = typeof color === 'string' ? color : colores.textoSecundario;
  return <Ionicons name={nombre} color={colorIcono} size={size} />;
}
