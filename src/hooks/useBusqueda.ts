import { useCallback, useEffect, useState } from 'react';

import { DEMORA_BUSQUEDA_MS } from '../constants/biblioteca';
import { buscarLibros } from '../lib/api';
import type { Libro } from '../types';

type Respuesta = {
  termino: string;
  libros: Libro[];
  conError: boolean;
};

type ResultadoUseBusqueda = {
  libros: Libro[];
  cargando: boolean;
  conError: boolean;
  reintentar: () => void;
};

export function useBusqueda(termino: string): ResultadoUseBusqueda {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (termino === '') {
      return;
    }
    // Cada búsqueda tiene su propio "vigente". Cuando cambia el término, la limpieza
    // lo pone en false: si la respuesta vieja llega tarde, se descarta.
    let vigente = true;
    // Debounce: se busca recién cuando pasan 300 ms sin que cambie el término.
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(termino);
        if (vigente) {
          setRespuesta({ termino, libros, conError: false });
        }
      } catch {
        if (vigente) {
          setRespuesta({ termino, libros: [], conError: true });
        }
      }
    }, DEMORA_BUSQUEDA_MS);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [termino, intento]);

  const reintentar = useCallback(() => {
    setRespuesta(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  // Solo se muestran resultados que correspondan al término actual.
  const alDia = respuesta !== null && respuesta.termino === termino;
  return {
    libros: alDia ? respuesta.libros : [],
    cargando: termino !== '' && !alDia,
    conError: alDia && respuesta.conError,
    reintentar,
  };
}
