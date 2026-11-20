import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

const PATRON_ISBN = /^\d{13}$/;

export function esIsbnValido(valor: string): boolean {
  return PATRON_ISBN.test(valor);
}

// Búsqueda local y sincrónica: el detalle no depende de la red para validar el ISBN.
export function buscarPorIsbn(isbn: string): Libro | undefined {
  return LIBROS.find((libro) => libro.isbn === isbn);
}

// Normaliza lo que escribe la persona: quita guiones y espacios.
export function limpiarIsbn(texto: string): string {
  return texto.replace(/[\s-]/g, '');
}
