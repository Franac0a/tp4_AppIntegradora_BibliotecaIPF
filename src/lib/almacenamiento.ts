import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Aviso, Prestamo } from '../types';

const CLAVE = 'biblioteca-ipf/estado/v1';

export type EstadoGuardado = {
  prestamos: Prestamo[];
  recientes: string[];
  esperas: Record<string, string[]>;
  avisos: Aviso[];
};

function esEstadoGuardado(valor: unknown): valor is EstadoGuardado {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    'prestamos' in valor &&
    Array.isArray(valor.prestamos) &&
    'recientes' in valor &&
    Array.isArray(valor.recientes) &&
    'esperas' in valor &&
    typeof valor.esperas === 'object' &&
    'avisos' in valor &&
    Array.isArray(valor.avisos)
  );
}

// Si no hay nada guardado o el contenido está dañado, la app arranca con los datos iniciales.
export async function cargarEstado(): Promise<EstadoGuardado | null> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE);
    if (texto === null) {
      return null;
    }
    const datos: unknown = JSON.parse(texto);
    return esEstadoGuardado(datos) ? datos : null;
  } catch {
    return null;
  }
}

export async function guardarEstado(estado: EstadoGuardado): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Si el guardado falla la app sigue funcionando con el estado en memoria.
  }
}
