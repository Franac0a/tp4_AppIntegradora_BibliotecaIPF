import { router, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Boton } from '../components/Boton';
import { MensajePantalla } from '../components/MensajePantalla';
import { colores } from '../constants/tema';

export default function PantallaNoEncontrada() {
  const ruta = usePathname();
  return (
    <View style={styles.pantalla}>
      <MensajePantalla
        icono="compass-outline"
        tono="aviso"
        titulo="Esta página no existe"
        descripcion={`No encontramos nada en «${ruta}».`}>
        <Boton titulo="Ir al catálogo" onPress={() => router.replace('/')} />
      </MensajePantalla>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
});
