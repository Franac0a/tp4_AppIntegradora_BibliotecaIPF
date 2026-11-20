import { describe, expect, it } from '@jest/globals';

import { Pila } from '../Pila';

describe('Pila', () => {
  it('empieza vacía', () => {
    const pila = new Pila<number>();
    expect(pila.estaVacia()).toBe(true);
    expect(pila.tamanio).toBe(0);
    expect(pila.verTope()).toBeUndefined();
  });

  it('desapila en orden inverso al apilado (LIFO)', () => {
    const pila = Pila.desde([1, 2, 3]);
    expect(pila.desapilar()).toBe(3);
    expect(pila.desapilar()).toBe(2);
    expect(pila.tamanio).toBe(1);
  });

  it('verTope no quita el elemento', () => {
    const pila = Pila.desde(['a', 'b']);
    expect(pila.verTope()).toBe('b');
    expect(pila.tamanio).toBe(2);
  });

  it('desapilar una pila vacía devuelve undefined', () => {
    const pila = new Pila<string>();
    expect(pila.desapilar()).toBeUndefined();
    expect(pila.tamanio).toBe(0);
  });

  it('aArray devuelve una copia de base a tope', () => {
    const pila = Pila.desde([1, 2]);
    const copia = pila.aArray();
    copia.push(99);
    expect(pila.aArray()).toEqual([1, 2]);
  });
});
