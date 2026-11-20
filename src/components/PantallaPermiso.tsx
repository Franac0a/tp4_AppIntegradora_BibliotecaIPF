import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colores, espaciado, fuentes, pesos, tamanios } from '../constants/tema';
import { useBiblioteca } from '../hooks/useBiblioteca';
import { usePermiso } from '../hooks/usePermiso';
import { TEXTOS_PERMISO } from '../lib/permisos';
import type { RecursoPermiso } from '../types';
import { Boton } from './Boton';
import { EstadoCargando } from './EstadoCargando';

type Props = {
  recurso: RecursoPermiso;
  // Préstamo cuyo recordatorio se activa si la persona concede las notificaciones.
  isbn?: string;
};

// Pantalla previa al diálogo del sistema: beneficio en una frase y un único botón.
export function PantallaPermiso({ recurso, isbn }: Props) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const { activarRecordatorio } = useBiblioteca();
  const textos = TEXTOS_PERMISO[recurso];

  async function continuar() {
    const respuesta = estado === 'concedido' ? null : await pedir();
    const concedido = estado === 'concedido' || respuesta?.granted === true;
    if (concedido && recurso === 'notificaciones' && isbn) {
      await activarRecordatorio(isbn);
    }
    router.back();
  }

  if (estado === 'cargando') {
    return <EstadoCargando mensaje="Consultando el permiso…" />;
  }

  const bloqueado = estado === 'bloqueado';

  return (
    <View style={styles.pantalla}>
      <View style={styles.cuerpo}>
        <Ionicons
          name={recurso === 'camara' ? 'camera-outline' : 'notifications-outline'}
          size={tamanios.iconoGrande}
          color={colores.primario}
        />
        <Text style={styles.titulo} accessibilityRole="header">
          {textos.titulo}
        </Text>
        <Text style={styles.beneficio}>{textos.beneficio}</Text>
        {bloqueado ? (
          <Text style={styles.bloqueado}>
            El permiso está bloqueado. Podés habilitarlo desde los Ajustes del teléfono.
          </Text>
        ) : null}
        <Text style={styles.alternativa}>{textos.alternativa}</Text>
      </View>
      {bloqueado ? (
        <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      ) : (
        <Boton titulo="Continuar" onPress={continuar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.xl,
    justifyContent: 'space-between',
    backgroundColor: colores.fondo,
  },
  cuerpo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.lg,
  },
  titulo: {
    color: colores.texto,
    fontSize: fuentes.titulo,
    fontWeight: pesos.fuerte,
  },
  beneficio: {
    color: colores.texto,
    fontSize: fuentes.media,
    textAlign: 'center',
  },
  bloqueado: {
    color: colores.aviso,
    fontSize: fuentes.normal,
    textAlign: 'center',
  },
  alternativa: {
    color: colores.textoSecundario,
    fontSize: fuentes.normal,
    textAlign: 'center',
  },
});
