import { StyleSheet, View } from 'react-native';

import { espaciado } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import type { EstadoPermiso } from '../types';
import { TarjetaAviso } from './TarjetaAviso';

type Props = { estadoNotificaciones: EstadoPermiso };

export function AvisosReservas({ estadoNotificaciones }: Props) {
  const { avisos, descartarAviso } = useBiblioteca();
  const sinPermiso =
    estadoNotificaciones === 'preguntable' || estadoNotificaciones === 'bloqueado';

  return (
    <View style={styles.contenedor}>
      {sinPermiso ? (
        <TarjetaAviso texto="Las notificaciones están desactivadas: los avisos de tus libros te aparecen acá." />
      ) : null}
      {avisos.map((aviso) => (
        <TarjetaAviso
          key={aviso.id}
          texto={aviso.texto}
          onDescartar={() => descartarAviso(aviso.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
    paddingBottom: espaciado.md,
  },
});
