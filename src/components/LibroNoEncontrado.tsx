import { router } from 'expo-router';

import { esIsbnValido } from '../lib/catalogo';
import { Boton } from './Boton';
import { MensajePantalla } from './MensajePantalla';

type Props = { isbn: string };

// Mensaje para /libro/[isbn] y /reservar/[isbn] cuando el parámetro no sirve.
export function LibroNoEncontrado({ isbn }: Props) {
  const formatoValido = esIsbnValido(isbn);
  return (
    <MensajePantalla
      icono="help-circle-outline"
      tono="aviso"
      titulo={formatoValido ? 'No encontramos ese libro' : 'Ese código no es un ISBN'}
      descripcion={
        formatoValido
          ? `No hay ningún libro con el ISBN ${isbn} en la biblioteca.`
          : `«${isbn}» no es válido: un ISBN tiene 13 números, sin guiones.`
      }>
      <Boton titulo="Ir al catálogo" onPress={() => router.dismissTo('/')} />
    </MensajePantalla>
  );
}
