import { router, useLocalSearchParams } from 'expo-router';

import { Boton } from '../../components/Boton';
import { MensajePantalla } from '../../components/MensajePantalla';
import { PantallaPermiso } from '../../components/PantallaPermiso';
import { esRecursoPermiso } from '../../lib/permisos';

type Parametros = {
  recurso: string;
  isbn?: string;
};

// La ruta solo valida el parámetro; la pantalla previa vive en PantallaPermiso.
export default function RutaPermiso() {
  const { recurso, isbn } = useLocalSearchParams<Parametros>();

  if (!esRecursoPermiso(recurso)) {
    return (
      <MensajePantalla
        icono="help-circle-outline"
        tono="aviso"
        titulo="Permiso desconocido"
        descripcion="Esta app solo usa la cámara y las notificaciones.">
        <Boton titulo="Volver" onPress={() => router.back()} />
      </MensajePantalla>
    );
  }

  return <PantallaPermiso recurso={recurso} isbn={isbn} />;
}
