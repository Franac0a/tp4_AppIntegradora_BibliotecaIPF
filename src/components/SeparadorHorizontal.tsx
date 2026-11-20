import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';

export function SeparadorHorizontal() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  separador: {
    width: espaciado.sm,
  },
});
