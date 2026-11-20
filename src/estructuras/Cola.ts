// Cola FIFO: el primero en llegar es el primero en salir.
// No usa shift() (que es O(n)): avanza un índice al frente y desencolar es O(1).
export class Cola<T> {
  #items: Record<number, T> = {};
  #frente = 0;
  #fin = 0;

  static desde<T>(items: readonly T[]): Cola<T> {
    const cola = new Cola<T>();
    items.forEach((item) => cola.encolar(item));
    return cola;
  }

  encolar(item: T): void {
    this.#items[this.#fin] = item;
    this.#fin += 1;
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const item = this.#items[this.#frente];
    delete this.#items[this.#frente];
    this.#frente += 1;
    return item;
  }

  verFrente(): T | undefined {
    return this.estaVacia() ? undefined : this.#items[this.#frente];
  }

  estaVacia(): boolean {
    return this.#fin === this.#frente;
  }

  get tamanio(): number {
    return this.#fin - this.#frente;
  }

  // Copia del frente al final.
  aArray(): T[] {
    const resultado: T[] = [];
    for (let i = this.#frente; i < this.#fin; i += 1) {
      resultado.push(this.#items[i]);
    }
    return resultado;
  }
}
