import * as Notifications from 'expo-notifications';
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  CANTIDAD_RECIENTES,
  CREDENCIALES_PERSONAL,
  DEMORA_GUARDADO_MS,
  DIAS_PRESTAMO,
  NOMBRE_USUARIO,
} from '../constants/biblioteca';
import { ESPERAS_INICIALES } from '../data/libros';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import { cargarEstado, guardarEstado } from '../lib/almacenamiento';
import { buscarPorIsbn } from '../lib/catalogo';
import { sumarDias } from '../lib/fechas';
import {
  avisarLibroDisponible,
  cancelarRecordatorio,
  esDatosNotificacion,
  obtenerIdsProgramados,
  programarRecordatorio,
} from '../lib/notificaciones';
import type { Aviso, Prestamo, ResultadoReserva } from '../types';

type Esperas = Record<string, Cola<string>>;

export type BibliotecaContextValue = {
  listo: boolean;
  prestamos: Prestamo[];
  avisos: Aviso[];
  recientes: string[];
  sesionIniciada: boolean;
  isbnsConEspera: string[];
  misEsperas: string[];
  disponibles: (isbn: string) => number;
  personasEnEspera: (isbn: string) => string[];
  posicionEnEspera: (isbn: string) => number;
  yaReservado: (isbn: string) => boolean;
  registrarVisto: (isbn: string) => void;
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  entregarAlSiguiente: (isbn: string) => Promise<string | null>;
  descartarAviso: (id: string) => void;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
};

export const BibliotecaContext = createContext<BibliotecaContextValue | null>(null);

function crearEsperas(listas: Record<string, string[]>): Esperas {
  const esperas: Esperas = {};
  Object.entries(listas).forEach(([isbn, personas]) => {
    esperas[isbn] = Cola.desde(personas);
  });
  return esperas;
}

function crearEsperasIniciales(): Esperas {
  return crearEsperas(ESPERAS_INICIALES);
}

function esperasAListas(esperas: Esperas): Record<string, string[]> {
  const listas: Record<string, string[]> = {};
  Object.entries(esperas).forEach(([isbn, cola]) => {
    listas[isbn] = cola.aArray();
  });
  return listas;
}

// Un recordatorio que ya llegó (o que el sistema descartó) no debe seguir figurando como activo.
async function reconciliarRecordatorios(prestamos: Prestamo[]): Promise<Prestamo[]> {
  try {
    const programados = await obtenerIdsProgramados();
    return prestamos.map((p) =>
      p.recordatorioId && !programados.includes(p.recordatorioId)
        ? { ...p, recordatorioId: null }
        : p,
    );
  } catch {
    return prestamos;
  }
}

function crearId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type Props = { children: ReactNode };

export function BibliotecaProvider({ children }: Props) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  // Pila y Cola se reemplazan por instancias nuevas en cada cambio (nunca se mutan
  // las que están en el estado) para que React detecte el cambio y re-renderice.
  const [esperas, setEsperas] = useState<Esperas>(crearEsperasIniciales);
  const [vistos, setVistos] = useState<Pila<string>>(() => new Pila<string>());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);
  // Mientras se lee lo guardado, la app sigue en el splash: nunca se ve "vacía".
  const [listo, setListo] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function hidratar() {
      const guardado = await cargarEstado();
      if (guardado) {
        const prestamosGuardados = await reconciliarRecordatorios(guardado.prestamos);
        if (cancelado) {
          return;
        }
        setPrestamos(prestamosGuardados);
        setVistos(Pila.desde(guardado.recientes));
        setEsperas(crearEsperas(guardado.esperas));
        setAvisos(guardado.avisos);
      }
      if (!cancelado) {
        setListo(true);
      }
    }
    hidratar();
    return () => {
      cancelado = true;
    };
  }, []);

  // La sesión del personal no se guarda: al reabrir la app hay que volver a ingresar.
  useEffect(() => {
    if (!listo) {
      return;
    }
    const temporizador = setTimeout(() => {
      guardarEstado({
        prestamos,
        recientes: vistos.aArray(),
        esperas: esperasAListas(esperas),
        avisos,
      });
    }, DEMORA_GUARDADO_MS);
    return () => clearTimeout(temporizador);
  }, [listo, prestamos, vistos, esperas, avisos]);

  // Último valor de préstamos, para consultarlo después de un await.
  const prestamosRef = useRef(prestamos);
  useEffect(() => {
    prestamosRef.current = prestamos;
  }, [prestamos]);

  // Si el recordatorio llega con la app abierta, el interruptor vuelve a apagarse.
  useEffect(() => {
    const suscripcion = Notifications.addNotificationReceivedListener((notificacion) => {
      const datos = notificacion.request.content.data;
      if (!esDatosNotificacion(datos)) {
        return;
      }
      setPrestamos((anteriores) =>
        anteriores.map((p) =>
          p.isbn === datos.isbn && p.recordatorioId === notificacion.request.identifier
            ? { ...p, recordatorioId: null }
            : p,
        ),
      );
    });
    return () => suscripcion.remove();
  }, []);

  const agregarAviso = useCallback((texto: string) => {
    setAvisos((anteriores) => [...anteriores, { id: crearId(), texto }]);
  }, []);

  const descartarAviso = useCallback((id: string) => {
    setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id));
  }, []);

  const personasEnEspera = useCallback(
    (isbn: string) => esperas[isbn]?.aArray() ?? [],
    [esperas],
  );

  const posicionEnEspera = useCallback(
    (isbn: string) => personasEnEspera(isbn).indexOf(NOMBRE_USUARIO) + 1,
    [personasEnEspera],
  );

  // Los ejemplares disponibles se calculan: no se guardan en un segundo lugar.
  const disponibles = useCallback(
    (isbn: string) => {
      const libro = buscarPorIsbn(isbn);
      if (!libro) {
        return 0;
      }
      const prestadosDelEstante = prestamos.filter(
        (p) => p.isbn === isbn && p.origen === 'estante',
      ).length;
      return Math.max(0, libro.ejemplares - prestadosDelEstante);
    },
    [prestamos],
  );

  const yaReservado = useCallback(
    (isbn: string) =>
      prestamos.some((p) => p.isbn === isbn) || posicionEnEspera(isbn) > 0,
    [prestamos, posicionEnEspera],
  );

  const registrarVisto = useCallback((isbn: string) => {
    setVistos((anterior) => {
      if (anterior.verTope() === isbn) {
        return anterior;
      }
      const nueva = Pila.desde(anterior.aArray());
      nueva.apilar(isbn);
      return nueva;
    });
  }, []);

  const reservar = useCallback(
    (isbn: string): ResultadoReserva => {
      if (!buscarPorIsbn(isbn)) {
        return { tipo: 'inexistente' };
      }
      if (yaReservado(isbn)) {
        return { tipo: 'repetida' };
      }
      if (disponibles(isbn) > 0) {
        const vence = sumarDias(new Date(), DIAS_PRESTAMO).toISOString();
        setPrestamos((anteriores) => [
          ...anteriores,
          { isbn, vence, origen: 'estante', recordatorioId: null },
        ]);
        return { tipo: 'prestamo', vence };
      }
      const nueva = Cola.desde(personasEnEspera(isbn));
      nueva.encolar(NOMBRE_USUARIO);
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
      return { tipo: 'espera', posicion: nueva.tamanio };
    },
    [yaReservado, disponibles, personasEnEspera],
  );

  const devolver = useCallback(async (isbn: string) => {
    const prestamo = prestamosRef.current.find((p) => p.isbn === isbn);
    setPrestamos((anteriores) => anteriores.filter((p) => p.isbn !== isbn));
    if (prestamo?.recordatorioId) {
      await cancelarRecordatorio(prestamo.recordatorioId);
    }
  }, []);

  const activarRecordatorio = useCallback(async (isbn: string) => {
    const libro = buscarPorIsbn(isbn);
    if (!libro) {
      return;
    }
    const id = await programarRecordatorio(isbn, libro.titulo);
    // Si mientras se programaba la persona devolvió el libro, no dejamos la notificación colgada.
    if (!prestamosRef.current.some((p) => p.isbn === isbn)) {
      await cancelarRecordatorio(id);
      return;
    }
    setPrestamos((anteriores) =>
      anteriores.map((p) => (p.isbn === isbn ? { ...p, recordatorioId: id } : p)),
    );
  }, []);

  const desactivarRecordatorio = useCallback(async (isbn: string) => {
    const prestamo = prestamosRef.current.find((p) => p.isbn === isbn);
    setPrestamos((anteriores) =>
      anteriores.map((p) => (p.isbn === isbn ? { ...p, recordatorioId: null } : p)),
    );
    if (prestamo?.recordatorioId) {
      await cancelarRecordatorio(prestamo.recordatorioId);
    }
  }, []);

  const entregarAlSiguiente = useCallback(
    async (isbn: string) => {
      const nueva = Cola.desde(personasEnEspera(isbn));
      const persona = nueva.desencolar();
      if (persona === undefined) {
        return null;
      }
      setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));
      if (persona === NOMBRE_USUARIO) {
        const vence = sumarDias(new Date(), DIAS_PRESTAMO).toISOString();
        setPrestamos((anteriores) => [
          ...anteriores,
          { isbn, vence, origen: 'mostrador', recordatorioId: null },
        ]);
        const titulo = buscarPorIsbn(isbn)?.titulo ?? 'tu libro';
        const notificado = await avisarLibroDisponible(titulo);
        if (!notificado) {
          agregarAviso(`¡Ya podés retirar «${titulo}» en el mostrador! Te lo reservamos por ${DIAS_PRESTAMO} días.`);
        }
      }
      return persona;
    },
    [personasEnEspera, agregarAviso],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const valido =
      usuario.trim().toLowerCase() === CREDENCIALES_PERSONAL.usuario &&
      clave === CREDENCIALES_PERSONAL.clave;
    if (valido) {
      setSesionIniciada(true);
    }
    return valido;
  }, []);

  const cerrarSesion = useCallback(() => setSesionIniciada(false), []);

  // Del más reciente al más antiguo, sin repetir (la pila puede tener un libro más abajo).
  const recientes = useMemo(() => {
    const unicos: string[] = [];
    vistos
      .aArray()
      .reverse()
      .forEach((isbn) => {
        if (unicos.length < CANTIDAD_RECIENTES && !unicos.includes(isbn)) {
          unicos.push(isbn);
        }
      });
    return unicos;
  }, [vistos]);

  const isbnsConEspera = useMemo(
    () => Object.keys(esperas).filter((isbn) => esperas[isbn].tamanio > 0),
    [esperas],
  );

  const misEsperas = useMemo(
    () => isbnsConEspera.filter((isbn) => esperas[isbn].aArray().includes(NOMBRE_USUARIO)),
    [isbnsConEspera, esperas],
  );

  const value = useMemo<BibliotecaContextValue>(
    () => ({
      listo,
      prestamos,
      avisos,
      recientes,
      sesionIniciada,
      isbnsConEspera,
      misEsperas,
      disponibles,
      personasEnEspera,
      posicionEnEspera,
      yaReservado,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    }),
    [
      listo,
      prestamos,
      avisos,
      recientes,
      sesionIniciada,
      isbnsConEspera,
      misEsperas,
      disponibles,
      personasEnEspera,
      posicionEnEspera,
      yaReservado,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      descartarAviso,
      iniciarSesion,
      cerrarSesion,
    ],
  );

  return <BibliotecaContext.Provider value={value}>{children}</BibliotecaContext.Provider>;
}
