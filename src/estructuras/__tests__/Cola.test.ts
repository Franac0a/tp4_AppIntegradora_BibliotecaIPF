import { describe, expect, it } from '@jest/globals';

import { Cola } from '../Cola';

describe('Cola', () => {
  it('empieza vacía', () => {
    const cola = new Cola<string>();
    expect(cola.estaVacia()).toBe(true);
    expect(cola.tamanio).toBe(0);
  });

  it('desencola en el mismo orden en que se encoló (FIFO)', () => {
    const cola = Cola.desde(['Ana', 'Luis', 'Carla']);
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.desencolar()).toBe('Luis');
    expect(cola.tamanio).toBe(1);
  });

  it('desencolar una cola vacía devuelve undefined y no rompe el tamaño', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
    cola.encolar('Ana');
    expect(cola.tamanio).toBe(1);
  });

  it('verFrente no quita el elemento', () => {
    const cola = Cola.desde(['Ana', 'Luis']);
    expect(cola.verFrente()).toBe('Ana');
    expect(cola.tamanio).toBe(2);
  });

  it('aArray devuelve una copia del frente al final después de desencolar', () => {
    const cola = Cola.desde([1, 2, 3]);
    cola.desencolar();
    const copia = cola.aArray();
    copia.push(99);
    expect(cola.aArray()).toEqual([2, 3]);
  });

  it('se puede seguir usando después de vaciarse', () => {
    const cola = Cola.desde(['x']);
    cola.desencolar();
    cola.encolar('y');
    expect(cola.verFrente()).toBe('y');
    expect(cola.aArray()).toEqual(['y']);
  });
});
