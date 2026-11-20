import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';

export function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  separador: {
    height: espaciado.sm,
  },
});
