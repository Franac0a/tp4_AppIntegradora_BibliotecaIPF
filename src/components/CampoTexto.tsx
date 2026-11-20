import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colores, espaciado, fuentes, radios, tamanios } from '../constants/tema';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'>;

export function CampoTexto(props: Props) {
  return (
    <TextInput
      {...props}
      style={styles.campo}
      placeholderTextColor={colores.textoTenue}
      selectionColor={colores.primario}
    />
  );
}

const styles = StyleSheet.create({
  campo: {
    minHeight: tamanios.areaTactilMinima,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    color: colores.texto,
    fontSize: fuentes.media,
    backgroundColor: colores.superficie,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },
});
