// Pila LIFO: el último elemento apilado es el primero en salir.
export class Pila<T> {
  #items: T[] = [];

  static desde<T>(items: readonly T[]): Pila<T> {
    const pila = new Pila<T>();
    items.forEach((item) => pila.apilar(item));
    return pila;
  }

  apilar(item: T): void {
    this.#items.push(item);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  verTope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  // Copia de base a tope: quien la reciba no puede modificar la pila.
  aArray(): T[] {
    return [...this.#items];
  }
}
