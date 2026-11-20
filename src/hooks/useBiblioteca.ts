import { useContext } from 'react';

import { BibliotecaContext, type BibliotecaContextValue } from '../context/BibliotecaContext';

export function useBiblioteca(): BibliotecaContextValue {
  const contexto = useContext(BibliotecaContext);
  if (!contexto) {
    throw new Error('useBiblioteca debe usarse dentro de <BibliotecaProvider>.');
  }
  return contexto;
}
