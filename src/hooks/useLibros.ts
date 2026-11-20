import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

type ResultadoUseLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

const MENSAJE_ERROR = 'No pudimos conectarnos con la biblioteca. Revisá tu conexión e intentá de nuevo.';

export function useLibros(): ResultadoUseLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número es lo que vuelve a disparar el efecto.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // La limpieza marca la respuesta como descartada si la pantalla se desmonta
    // o si empieza otro intento antes de que termine éste.
    let descartado = false;

    // useEffect no acepta una función async (devolvería una promesa, no una limpieza),
    // por eso se declara adentro y se llama enseguida.
    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (!descartado) {
          setLibros(datos);
        }
      } catch {
        if (!descartado) {
          setError(MENSAJE_ERROR);
        }
      } finally {
        if (!descartado) {
          setCargando(false);
        }
      }
    }

    cargar();
    return () => {
      descartado = true;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setError(null);
    setCargando(true);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
