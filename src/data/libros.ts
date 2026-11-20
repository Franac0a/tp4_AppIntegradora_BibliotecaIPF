import type { Libro } from '../types';

// Los dos primeros tienen ISBN real para probar el escáner con un libro físico.
export const LIBROS: Libro[] = [
  {
    isbn: '9780307474728',
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anio: 1967,
    ejemplares: 2,
  },
  {
    isbn: '9788499089515',
    titulo: 'Ficciones',
    autor: 'Jorge Luis Borges',
    anio: 1944,
    ejemplares: 1,
  },
  {
    isbn: '9789875661073',
    titulo: 'El Aleph',
    autor: 'Jorge Luis Borges',
    anio: 1949,
    ejemplares: 0,
  },
  {
    isbn: '9789504901143',
    titulo: 'Rayuela',
    autor: 'Julio Cortázar',
    anio: 1963,
    ejemplares: 0,
  },
  {
    isbn: '9789875661219',
    titulo: 'Bestiario',
    autor: 'Julio Cortázar',
    anio: 1951,
    ejemplares: 3,
  },
  {
    isbn: '9789504901280',
    titulo: 'El túnel',
    autor: 'Ernesto Sabato',
    anio: 1948,
    ejemplares: 0,
  },
  {
    isbn: '9789875661356',
    titulo: 'Martín Fierro',
    autor: 'José Hernández',
    anio: 1872,
    ejemplares: 4,
  },
  {
    isbn: '9789504901426',
    titulo: 'Facundo',
    autor: 'Domingo F. Sarmiento',
    anio: 1845,
    ejemplares: 1,
  },
  {
    isbn: '9789875661493',
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    anio: 2008,
    ejemplares: 2,
  },
  {
    isbn: '9789504901563',
    titulo: 'El programador pragmático',
    autor: 'Andrew Hunt y David Thomas',
    anio: 1999,
    ejemplares: 1,
  },
  {
    isbn: '9789875661639',
    titulo: 'Estructuras de datos en JavaScript',
    autor: 'Loiane Groner',
    anio: 2018,
    ejemplares: 0,
  },
  {
    isbn: '9789504901709',
    titulo: 'Aprendiendo React',
    autor: 'Alex Banks y Eve Porcello',
    anio: 2020,
    ejemplares: 2,
  },
  {
    isbn: '9789875661776',
    titulo: 'Don Segundo Sombra',
    autor: 'Ricardo Güiraldes',
    anio: 1926,
    ejemplares: 1,
  },
  {
    isbn: '9789504901846',
    titulo: 'La invención de Morel',
    autor: 'Adolfo Bioy Casares',
    anio: 1940,
    ejemplares: 2,
  },
  {
    isbn: '9789875661912',
    titulo: 'Cuentos de la selva',
    autor: 'Horacio Quiroga',
    anio: 1918,
    ejemplares: 3,
  },
  {
    isbn: '9789504901983',
    titulo: 'Diseño de interfaces móviles',
    autor: 'Steven Hoober',
    anio: 2011,
    ejemplares: 1,
  },
];

// Lista de espera con la que arranca la app (personas en orden de llegada).
export const ESPERAS_INICIALES: Record<string, string[]> = {
  '9789875661073': ['Ana López', 'Luis Benítez'],
  '9789504901280': ['Carla Gómez'],
  '9789875661639': ['Martín Díaz', 'Sofía Ruiz'],
};
