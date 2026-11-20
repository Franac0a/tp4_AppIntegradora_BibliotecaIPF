# Respuestas – TP N° 4 «Biblioteca IPF»

> Las referencias tienen la forma `archivo:línea`. Las marcadas con **[verificar en el teléfono]** salen del análisis del código y hay que confirmarlas en Expo Go antes de entregar.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de `useLibros`

**a) Render por render** (`src/hooks/useLibros.ts:15-58`)

Camino feliz:

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | Montaje del Catálogo (valores iniciales de los `useState`, líneas 16-18). Después del render corre el efecto (línea 22), que llama a `obtenerLibros()` y queda esperando 800 ms. |
| 2 | 16 libros | `false` | `null` | Llega la respuesta: `setLibros(datos)` (línea 33) y `setCargando(false)` en el `finally` (línea 41). Se ejecutan en la misma continuación del `await`, así que React las agrupa (*automatic batching*) en un solo render. |

Son **2 renders** (en desarrollo, `StrictMode` monta, desmonta y vuelve a montar: el primer efecto queda descartado por su limpieza y se ve un pedido extra, pero no cambia lo que se muestra).

Cuando `obtenerLibros()` falla y la persona toca «Reintentar»:

| Render | `libros` | `cargando` | `error` | Qué lo provoca |
|---|---|---|---|---|
| 1 | `[]` | `true` | `null` | Montaje. |
| 2 | `[]` | `false` | mensaje | `setError(MENSAJE_ERROR)` (línea 37) + `setCargando(false)` (línea 41), agrupados. La lista muestra «Sin conexión» con el botón «Reintentar». |
| 3 | `[]` | `true` | `null` | Toque en «Reintentar»: `reintentar` (líneas 52-56) hace `setError(null)`, `setCargando(true)` y `setIntento(+1)` en el mismo evento → un solo render. Como cambió `intento`, corre la limpieza del efecto anterior y el efecto de nuevo. |
| 4 | 16 libros (o `[]`) | `false` | `null` (o mensaje) | Respuesta del segundo pedido. |

**b) ¿Se desmonta el Catálogo?** No al cambiar a «Mis reservas»: las pestañas mantienen montadas sus pantallas (solo se ocultan), por eso al volver la lista sigue cargada y no se pide de nuevo. Tampoco al abrir un detalle: el detalle se apila encima en el Stack del Catálogo y el `index` sigue montado debajo. **[verificar en el teléfono]** con un `console.log('limpieza useLibros')` temporal dentro del `return () => { … }` de la línea 47.

En la práctica la limpieza se ejecuta: (1) cuando la persona toca «Reintentar», porque cambia `intento` y el efecto viejo se limpia antes de correr el nuevo; (2) en desarrollo, por el doble montaje de `StrictMode`; (3) si el Catálogo se desmonta de verdad, por ejemplo al cerrar la app o en un `router.replace('/')` desde la 404. En todos los casos evita que una respuesta vieja haga `setState` sobre un intento que ya no corresponde.

**c) ¿Por qué no `async` directo en `useEffect`?** Una función `async` siempre devuelve una promesa. `useEffect` espera que lo que devuelve el callback sea la función de limpieza (o nada); con una promesa React no tendría cómo limpiar, y además avisa con un warning. Lo resolví declarando una función `async` adentro del efecto y llamándola enseguida (`useLibros.ts:29-46`):

```ts
useEffect(() => {
  let descartado = false;
  async function cargar() { /* await obtenerLibros() … */ }
  cargar();
  return () => { descartado = true; };
}, [intento]);
```

**d) ¿Cómo implementé `reintentar`?** Con un contador `intento` en el estado (`useLibros.ts:20`) que está en el array de dependencias del efecto (línea 50). `reintentar` lo incrementa (línea 55): al cambiar una dependencia, React limpia el efecto anterior y lo vuelve a ejecutar, y eso hace el pedido de nuevo. Usé un número y no, por ejemplo, `error`, porque el efecto no tiene que depender de un valor que él mismo modifica (con `error` como dependencia se dispararía de nuevo al fallar y entraría en un bucle de reintentos automáticos). El contador solo cambia cuando la persona lo pide.

### B2. La condición de carrera del buscador

Mi código: `src/hooks/useBusqueda.ts:24-49` (efecto con debounce y bandera `vigente`) y `:57-61` (solo se muestran resultados del término actual).

| Momento | Qué pasa | Sin limpieza: qué se ve | Con mi código: qué se ve |
|---|---|---|---|
| t = 0 ms | Escribe «bor» → `buscarLibros("bor")`, tarda 1.400 ms | «Buscando…» | «Buscando «bor»…». (Con el debounce real, el pedido sale a los 300 ms solo si no se escribe nada más.) |
| t = 200 ms | Escribe «borges» → `buscarLibros("borges")`, tarda 300 ms | «Buscando…» | La limpieza del efecto de «bor» pone `vigente = false` y cancela su temporizador. Se ve «Buscando «borges»…». |
| t = 500 ms | Llega la respuesta de «borges» | Resultados de «borges» (*Ficciones*, *El Aleph*) | Resultados de «borges». |
| t = 1.400 ms | Llega la respuesta de «bor» | **Se pisa con los resultados de «bor»** mientras el campo dice «borges». | Se descarta: ese `vigente` ya es `false` y no se hace `setRespuesta`. Siguen los resultados de «borges». |

**a)** La limpieza (`useBusqueda.ts:45-48`) hace dos cosas: `clearTimeout(temporizador)`, que cancela la búsqueda si todavía no salió (debounce), y `vigente = false`, que marca como vieja la respuesta que ya está en camino. Cada ejecución del efecto tiene su propia variable `vigente` (es una clausura distinta), así que al llegar la respuesta de «bor» se evalúa la bandera de *ese* efecto, que ya está apagada. La limpieza se ejecuta justo antes de que corra el efecto siguiente, es decir, en el render en que cambió `termino` (la persona escribió otra letra), y también al desmontar la pantalla. Además, como defensa extra, el hook guarda junto con los libros el término al que pertenecen y solo los muestra si coinciden con el actual (`alDia`, línea 57).

**b) La propuesta `if (texto === q)`** no funciona. La función del `.then()` se creó en el render en que se buscó «bor», y por clausura «ve» el `q` de *ese* render: `q === "bor"` para siempre. Cuando llega la respuesta, `texto === "bor"` y `q === "bor"` → la condición da `true` y se pisan los resultados de «borges». La clausura captura el valor de la variable en el momento en que se creó la función, no el valor «actual». Para que funcione tendría que leer el valor actual desde un `useRef` actualizado en cada render, que es justamente lo que la bandera de la limpieza resuelve sin refs.

**c) URL y botón atrás.** Cada letra llama a `router.setParams({ q })` (`src/app/buscar.tsx:27`), que **reemplaza** los parámetros de la pantalla actual: la URL pasa a `/buscar?q=b`, `/buscar?q=bo`… pero sigue habiendo una sola entrada en la pila. «Atrás» sale del buscador y vuelve al Catálogo. Con `router.push` cada letra apilaría una pantalla nueva de `/buscar`: para salir habría que tocar atrás tantas veces como letras se escribieron, y cada pantalla montaría su propio efecto.

### B3. Mutar o reemplazar

**a)** Muestra **«Personas en espera: 0»**. `encolar` modifica el objeto que ya está en el estado, pero no llama a ningún `setState`; para React nada cambió y no vuelve a renderizar. El texto sigue mostrando el valor del último render.

**b)** Al escribir en el `TextInput` controlado se hace `setState` del texto, React vuelve a renderizar el componente y en ese render lee `espera.tamanio`, que ahora sí vale 3 (los cambios estaban en el objeto, solo que nadie había redibujado). Es un error peor que uno constante porque depende de algo ajeno a la cola: en las pruebas «a veces anda» (si casualmente otro estado provoca un render), no se reproduce de forma confiable, se le echa la culpa al componente equivocado y puede llegar a producción sin que nadie lo vea.

**c) Cómo lo resolví.** En el Context nunca muto la `Cola` o la `Pila` que está en el estado: creo una instancia nueva a partir de la anterior, la modifico y la guardo con `setState`.

```ts
// src/context/BibliotecaContext.tsx:242-244 (reservar)
const nueva = Cola.desde(personasEnEspera(isbn));
nueva.encolar(NOMBRE_USUARIO);
setEsperas((anteriores) => ({ ...anteriores, [isbn]: nueva }));

// :215-224 (registrarVisto)
const nueva = Pila.desde(anterior.aArray());
nueva.apilar(isbn);
return nueva;
```

| Alternativa | Ventaja | Costo |
|---|---|---|
| **Instancia nueva desde la anterior** (la mía) | Funciona con `useState`, el cambio de referencia es explícito y se sigue usando la clase con su API. Hace posible `useMemo` por referencia. | Copia O(n) en cada operación (irrelevante con listas de 2 o 3 personas). Hay que acordarse de no mutar nunca la del estado. |
| **Contador de versión** (`setVersion(v => v + 1)` después de mutar) | Sin copias; la clase se usa tal cual. | La referencia de la cola no cambia, así que `useMemo`/`React.memo` con esa dependencia no se enteran. Es fácil olvidar el contador y volver al bug de B3. |
| **`useReducer`** con acciones (`encolar`, `desencolar`) | Toda la lógica de cambio en un lugar, testeable sin React. | Dentro del reducer igual hay que devolver un estado nuevo (mismo problema de fondo) y es más código. |

---

## B4. ¿Dónde vive cada dato?

| Dato | Dónde vive | Por qué ahí y no en otro lugar |
|---|---|---|
| Texto del buscador | **URL** (`q`, `buscar.tsx:17`) + estado local del campo (`:20`) | Así se puede abrir por deep link (`/buscar?q=borges`) y sobrevive a recargas. El estado local solo existe para que el `TextInput` responda al instante; la fuente de la búsqueda es la URL. |
| Préstamos y reservas | **Context** (`BibliotecaContext.tsx:102`) + AsyncStorage | Los usan varias pantallas (detalle, reservar, Mis reservas, mostrador) y tienen que sobrevivir al cierre de la app. |
| Listas de espera | **Context** (`:105`, una `Cola` por ISBN) + AsyncStorage | Las modifican la persona (reservar) y el personal (mostrador), desde pantallas distintas. |
| Vistos recientemente | **Context** (`:106`, `Pila`) + AsyncStorage | Se escriben en el detalle y se leen en el Catálogo, que están en pantallas distintas. |
| Sesión del personal | **Context** (`:108`), sin persistir | La lee el Stack raíz para los `Stack.Protected`. No se guarda a propósito: al reabrir la app hay que volver a ingresar. |
| Ejemplares disponibles | **Se calcula** (`:195-207`) | `ejemplares` del libro menos los préstamos tomados del estante. Guardarlo aparte duplicaría el dato y podría desincronizarse (ver E4 d). |
| Estado del permiso de cámara | **Sistema operativo**; la app lo consulta con `usePermiso` (estado local del hook) | La fuente de verdad es el SO: la persona lo puede cambiar en Ajustes en cualquier momento. Por eso se vuelve a consultar al enfocar la pantalla y al volver al primer plano. |
| Identificador de la notificación | **Context**, dentro de cada `Prestamo` (`recordatorioId`) + AsyncStorage | Se necesita para cancelarla al apagar el interruptor o devolver el libro, y tiene que sobrevivir al cierre de la app (al iniciar se reconcilia con lo que sigue programado, `:82-93`). |

**¿Qué se re-renderiza cuando cambia el `value`?** Todos los componentes que llaman a `useBiblioteca()` (`useContext`), aunque solo usen una parte del valor. El Catálogo usa `disponibles` (en la pantalla) y `recientes` (en `VistosRecientemente`): al activar un recordatorio en otra pestaña cambia `prestamos`, por lo tanto cambia `disponibles` y el `value` (`:345`) → **sí, se re-renderiza**, aunque esté en una pestaña oculta. Para evitarlo se podría dividir el Context (uno para recientes, otro para préstamos, otro para la sesión), o usar una librería con selectores. En una app de este tamaño no vale la pena: son listas de 16 elementos, el re-render es imperceptible y dividirlo agrega complejidad. Lo haría solo si una medición con el Profiler mostrara un problema.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

**[verificar en el teléfono]**

| # | Acción | Pilas resultantes (base → tope) |
|---|---|---|
| 1 | Abre la app | Stack raíz: `[(tabs)]` · Tabs: Catálogo activa · Stack Catálogo: `[index]` |
| 2 | Toca un libro | Stack raíz: `[(tabs)]` · Stack Catálogo: `[index, libro/X]` |
| 3 | Toca «Reservar» | Stack raíz: `[(tabs), reservar/X (modal)]` · Stack Catálogo: `[index, libro/X]` |
| 4 | Toca «Confirmar» | Stack raíz: `[(tabs)]` · Tabs: «Mis reservas» activa · Stack Catálogo: `[index, libro/X]` |
| 5 | Atrás (Android) | Stack raíz: `[(tabs)]` · Tabs: vuelve a Catálogo (el `TabRouter` usa `backBehavior: 'firstRoute'` por defecto) · Stack Catálogo: `[index, libro/X]` → se ve el detalle |
| 6 | Toca la tab «Catálogo» | Stack Catálogo: `[index]` → se ve el Catálogo |

**a)** En el paso 4 uso `router.dismissTo('/reservas')` (`src/app/reservar/[isbn].tsx:47`). Hace un `POP_TO`: saca el modal y vuelve a la ruta `(tabs)` que ya estaba en la pila raíz, cambiando a la pestaña «Mis reservas». Por eso «atrás» no vuelve a la confirmación.
- Con `push('/reservas')` el modal quedaría en la pila debajo de «Mis reservas» (o se apilaría otro `(tabs)`): atrás volvería a la confirmación y se podría confirmar dos veces.
- Con `replace('/reservas')` se reemplaza el modal por la ruta destino; en este caso implica crear la ruta `(tabs)` de nuevo encima de la existente, con una pila duplicada.
- `dismissTo` es el que expresa la intención: «cerrá lo que está encima hasta llegar a esa ruta».

**b)** En el paso 5 ya se ve el detalle (la pestaña conserva su pila). En el paso 6, como la pestaña Catálogo ya está enfocada, tocarla emite `tabPress` y el Stack anidado hace *pop to top*: se ve el **Catálogo**. Me parece correcto: el comportamiento estándar de iOS y Android es que tocar la pestaña activa vuelva a su inicio, y la persona que quería ver el detalle ya lo vio en el paso 5.

### C2. El escáner que dispara de más

**a)** Cada llamada a `router.push` encola una acción de navegación. Con el código frente a la cámara, `onBarcodeScanned` puede llamarse 10 o más veces por segundo: se encolarían 10 `PUSH` del mismo detalle, que el navegador procesa uno detrás de otro (la cola de acciones del TP 2). Resultado: diez detalles apilados, y la persona tiene que tocar atrás diez veces (además de diez registros en «Vistos recientemente», aunque la pila evita el duplicado en el tope).

**b)** Uso `useRef` (`src/components/VisorEscaner.tsx:18`, `navegando`). Un `useState` puesto en `true` no alcanza porque el nuevo valor recién existe en el *próximo render*: las llamadas a `onBarcodeScanned` que llegan antes de ese render son la misma función creada en el render anterior y ven, por clausura, el valor viejo (`false`). Un ref es un objeto mutable compartido entre renders: `navegando.current = true` (línea 27) se ve en la siguiente llamada inmediatamente.

**c)** `router.replace` (`src/app/escanear.tsx:17`) saca al escáner de la pila y pone el detalle en su lugar. Con `push`, al tocar atrás desde el detalle se volvería a la cámara, que seguiría apuntando al mismo código y volvería a abrir el detalle (o la persona tendría que salir de una pantalla que ya no necesita).

**d)** Si el EAN-13 leído no está en el catálogo, se muestra una `TarjetaAviso` dentro de la pantalla («El código … no está en el catálogo. Probá con otro libro.») y la cámara sigue escaneando (`VisorEscaner.tsx:31-36`). Para que no aparezca diez veces guardo en un ref el último código desconocido (`ultimoDesconocido`, línea 19): si llega el mismo código, se ignora; si llega otro, se actualiza el aviso.

### C3. Deep links y rutas protegidas

**[verificar en el teléfono]** con `exp://<IP>:8081/--/…`

| Link | Qué ve la persona | Qué queda debajo en la pila | Qué parte del código lo decide |
|---|---|---|---|
| `bibliotecaipf://libro/9780307474728` | Detalle de *Cien años de soledad* | En el Stack Catálogo, `index` (Catálogo) | `anchor: 'index'` en `src/app/(tabs)/(catalogo)/_layout.tsx:8`; validación en `libro/[isbn].tsx:17` |
| `bibliotecaipf://libro/123` | «Ese código no es un ISBN» con botón «Ir al catálogo» | Catálogo | `esIsbnValido` en `libro/[isbn].tsx:17` + `LibroNoEncontrado.tsx` |
| `bibliotecaipf://buscar?q=borges` | Buscador con «borges» y sus resultados | `(tabs)` con el Catálogo | `anchor: '(tabs)'` en `src/app/_layout.tsx:12`; `useLocalSearchParams` en `buscar.tsx:17` |
| `bibliotecaipf://mostrador` (sin sesión) | Catálogo | Nada (es la base) | `Stack.Protected guard={sesionIniciada}` en `src/components/PilaRaiz.tsx:43`: sin `redirectTo`, redirige al anchor `(tabs)` |
| `bibliotecaipf://reserva` | Mis reservas | `(tabs)` | `<Redirect href="/reservas" />` en `src/app/reserva.tsx` |
| `bibliotecaipf://escanear` (cámara bloqueada) | «La cámara está bloqueada», «Abrir Ajustes» e ingreso manual del ISBN | `(tabs)` con el Catálogo | `usePermiso` → `calcularEstadoPermiso` (`src/lib/permisos.ts:16-24`) y la rama `bloqueado` de `escanear.tsx` |

**¿Por qué `/libro/123` llega al detalle?** Porque el router solo hace coincidir el *patrón* de la URL: `[isbn]` es un segmento dinámico que acepta cualquier texto. El router no sabe qué es un ISBN ni qué libros existen. La responsabilidad de responder bien es de la **pantalla**, que valida el parámetro (13 dígitos) y la existencia del libro y muestra un mensaje claro con una salida.

### C4. Foco, montaje y primer plano

**a)**
- `useEffect` con `[]`: se ejecuta **al montar** la pantalla (y limpia al desmontar).
- `useFocusEffect`: se ejecuta **cada vez que la pantalla gana el foco** de navegación (al volver de otra pestaña, al cerrar un modal que estaba encima) y limpia al perderlo.
- `AppState`: detecta que **la app entera** pasa entre `active`, `background` e `inactive` (por ejemplo, ir a Ajustes y volver).

**b)** Al salir a Ajustes y volver, la pantalla nunca perdió el foco de navegación ni se desmontó: solo se entera `AppState` (cambio a `active`). Al ir a la pestaña Catálogo y volver a «Mis reservas», la app nunca dejó de estar activa y la pantalla no se desmontó (las pestañas quedan montadas): solo se entera `useFocusEffect`.

**c)** Uso **las dos** en `src/hooks/usePermiso.ts`: `useFocusEffect` (líneas 23-27) y un listener de `AppState` con limpieza (líneas 30-37). Ambos llaman a `consultar()`, que vuelve a pedir el estado del permiso al sistema. Así «Mis reservas» y el escáner se actualizan tanto al volver de Ajustes como al cerrar el modal `/permisos/...`. Con solo `useEffect([])` se vería un estado viejo en los dos casos; con solo `AppState`, al cerrar el modal de permisos el escáner seguiría mostrando «Usar la cámara» aunque el permiso ya estuviera concedido.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara (Android 14)

**[verificar en el teléfono]**

| # | Acción | Qué muestra mi app | `status` | `canAskAgain` |
|---|---|---|---|---|
| 1 | Toca «Escanear» por primera vez | Estado *preguntable*: «Escaneá el código del libro» con el botón «Usar la cámara», e ingreso manual. Al tocar el botón se abre `/permisos/camara` con «Continuar» | `undetermined` | `true` |
| 2 | «Continuar» → «No permitir» | El modal se cierra; el escáner sigue en *preguntable* (otra vez «Usar la cámara») | `denied` | `true` |
| 3 | Toca «Escanear» otra vez | *Preguntable*: «Usar la cámara» → `/permisos/camara` con «Continuar» | `denied` | `true` |
| 4 | «Continuar» → «No permitir» | El modal se cierra; el escáner pasa a *bloqueado*: «La cámara está bloqueada», «Abrir Ajustes» e ingreso manual | `denied` | `false` |
| 5 | Toca «Escanear» otra vez | *Bloqueado* directamente (no se puede volver a mostrar el diálogo) | `denied` | `false` |
| 6 | «Abrir Ajustes» → habilita la cámara → vuelve | *Concedido*: aparece la cámara con el visor | `granted` | `true` |

**a) En iOS** el diálogo del sistema se muestra **una sola vez**: después del primer «No permitir» (paso 2) iOS devuelve `canAskAgain: false`. El resultado cambia en el **paso 2-3**: al cerrar el modal el escáner ya pasa a *bloqueado* y en el paso 3 muestra «La cámara está bloqueada» con «Abrir Ajustes» (en Android eso pasa recién en el paso 4).

**b)** La línea que decide es `src/lib/permisos.ts:23`:

```ts
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

y `PantallaPermiso.tsx` muestra «Abrir Ajustes» si el estado es `bloqueado` y «Continuar» si no. Usa **`canAskAgain`** porque `status` vale `denied` tanto en el paso 2 (todavía se puede preguntar) como en el paso 4 (ya no): mirando solo `status`, la app ofrecería «Continuar» y el botón no haría nada (el sistema ya no muestra el diálogo), o mandaría a Ajustes a alguien a quien todavía se le puede preguntar.

**c)** Se entera el listener de `AppState` de `src/hooks/usePermiso.ts:30-37`: al volver de Ajustes la app pasa a `active` y se llama a `consultar()`, que actualiza la respuesta y hace que aparezca la cámara. Sin esa parte la pantalla seguiría mostrando «La cámara está bloqueada» hasta salir y volver a entrar al escáner (el foco de navegación no cambia al ir a Ajustes).

### D2. Notificaciones y consistencia

**a)** La notificación quedaría programada en el sistema operativo aunque el préstamo ya no exista: a los 15 segundos llegaría «Acordate de devolver *X*» de un libro que la persona ya devolvió. La app perdería confianza (avisos falsos) y, si se repite, la persona termina desactivando las notificaciones. Por eso `devolver` cancela el recordatorio (`BibliotecaContext.tsx:250-256`).

**b)** El identificador se guarda en el `Prestamo` (`recordatorioId`) dentro del Context y se persiste con AsyncStorage (`BibliotecaContext.tsx:137-150`). Si la app se cierra antes de que llegue, la notificación **sigue programada en el SO y llega igual**. Sin persistencia, el identificador se perdería con la memoria: al reabrir la app el interruptor aparecería apagado aunque la notificación siga pendiente, y no habría forma de cancelarla al devolver el libro. Mi solución tiene dos partes: (1) persistir el identificador junto al préstamo; (2) al iniciar, reconciliarlo con `getAllScheduledNotificationsAsync()` (`reconciliarRecordatorios`, líneas 82-93): si el identificador ya no está programado (porque llegó mientras la app estaba cerrada), el interruptor se apaga. Con la app abierta, un listener de notificaciones recibidas hace lo mismo (líneas 159-174).

**c)** Desde Android 13 las notificaciones requieren el permiso `POST_NOTIFICATIONS` en tiempo de ejecución, y el sistema solo muestra el diálogo si la app tiene **al menos un canal creado**. Si se pide antes de crear el canal, `requestPermissionsAsync` puede volver sin haber mostrado nada. Por eso `pedirPermisoNotificaciones` crea el canal `prestamos` primero (`src/lib/notificaciones.ts:35-38`). En Android 12 o anterior no existe ese permiso en tiempo de ejecución: las notificaciones están permitidas al instalar, `requestPermissionsAsync` devuelve `granted` sin diálogo, y el canal sigue siendo necesario (desde Android 8) para que la notificación se muestre con su importancia.

**d)** Si el permiso está denegado, al «Entregar al siguiente» y ser yo la persona del frente, `entregarAlSiguiente` agrega un aviso en el Context que se muestra en «Mis reservas» (`TarjetaAviso`). El código que decide:

```ts
// src/lib/notificaciones.ts:72-75
export async function avisarLibroDisponible(titulo: string): Promise<boolean> {
  if (!(await tienePermisoNotificaciones())) {
    return false;
  }
  // … programa la notificación inmediata

// src/context/BibliotecaContext.tsx:299-302
const notificado = await avisarLibroDisponible(titulo);
if (!notificado) {
  agregarAviso(`¡Ya podés retirar «${titulo}» en el mostrador! …`);
}
```

**Consulta el permiso en ese momento** (`getPermissionsAsync`), no usa un valor guardado. Importa porque la persona puede haber cambiado el permiso en Ajustes entre que se guardó el valor y la entrega: con un valor viejo se podría intentar una notificación que el sistema descarta en silencio (y la persona no se entera de nada), o mostrar un aviso dentro de la app cuando ya recibió la notificación.

### D3. Lo que tu app pide y lo que no

| Plataforma | Permiso o clave declarada | Función que lo justifica | ¿Quién lo agrega? |
|---|---|---|---|
| Android | `android.permission.CAMERA` | Leer el código de barras en `/escanear` | Plugin `expo-camera` |
| Android | `android.permission.POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de entrega | `expo-notifications` |
| Android | `RECEIVE_BOOT_COMPLETED`, `SCHEDULE_EXACT_ALARM` (si la versión del módulo los incluye) | Que los recordatorios programados sobrevivan a un reinicio y se disparen a tiempo | `expo-notifications` |
| Android | `INTERNET` | Conexión con el servidor de desarrollo (Metro) y futuros servicios | Plantilla de Expo / React Native |
| iOS | `NSCameraUsageDescription` («Usamos tu cámara para leer el código de barras…») | Escáner | Plugin `expo-camera` con `cameraPermission` |
| iOS | Notificaciones (no requiere clave en `Info.plist`; el diálogo lo muestra el sistema) | Recordatorios | `expo-notifications` |
| Android | **Bloqueados** con `blockedPermissions`: `RECORD_AUDIO`, ubicación, almacenamiento/medios, contactos, `SYSTEM_ALERT_WINDOW` | La app no los usa (justificación en el README) | `app.json` |

**[verificar]** la lista exacta de Android en el `AndroidManifest.xml` generado con `npx expo prebuild --platform android` (sin commitear la carpeta).

**a)** `expo-camera` puede grabar video con sonido, por eso su plugin agrega por defecto `RECORD_AUDIO` en Android y `NSMicrophoneUsageDescription` en iOS. Esta app solo lee códigos de barras, así que lo desactivo:

```json
[
  "expo-camera",
  {
    "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin tener que escribir el ISBN.",
    "microphonePermission": false,
    "recordAudioAndroid": false
  }
]
```

y además `"android.permission.RECORD_AUDIO"` está en `blockedPermissions` por si otra dependencia lo agrega.

**b)** Usaría `expo-image-picker` (`launchImageLibraryAsync`). En Android 13+ y en iOS 14+ el selector de fotos del sistema no requiere permiso de galería (la persona elige una foto y la app solo recibe esa); habría que sacar `READ_MEDIA_IMAGES` de `blockedPermissions` solo si se necesitara acceso completo. **Hace falta una build nueva**: es un módulo nativo que no está en el binario actual (y su plugin modifica `app.json`/`Info.plist`). Una actualización OTA solo cambia el JavaScript y los assets, no puede agregar código nativo ni permisos. (En Expo Go funcionaría porque ya lo trae incluido, pero eso no vale para la app publicada.)

**c)** En Expo Go no pude verificar: (1) el **texto de propósito** de la cámara, porque Expo Go usa su propio `Info.plist`/manifest con sus textos; (2) `blockedPermissions` y `microphonePermission: false`, porque el manifest es el de Expo Go, que declara muchos más permisos; (3) el **canal `prestamos`** y su importancia del modo en que lo vería la app instalada (Expo Go comparte la configuración de notificaciones de su propia app). Lo verificaría con un *development build* (`npx expo run:android` o `eas build --profile development`): ahí se ve el diálogo con mi texto, el manifest generado y el canal en Ajustes → Apps → Biblioteca IPF → Notificaciones.

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas** (clasificación del TP 1: error de ejecución, advertencia, rendimiento/optimización, mala práctica)

| # | Línea | Clase | Problema y por qué pasa | Corrección |
|---|---|---|---|---|
| 1 | 18-20 | Rendimiento (bucle) | Efecto **sin array de dependencias**: corre después de cada render; `setLibros` provoca un render, que vuelve a correr el efecto… pedidos infinitos cada ~800 ms. | `useLibros` con `[intento]` como dependencia. |
| 2 | 19 | Error de ejecución | Sin `catch`: cuando `obtenerLibros()` falla (1 de cada 5) queda una promesa rechazada sin manejar y la persona no ve nada. | `try/catch`, estado `error` y botón «Reintentar». |
| 3 | 18-20 | Advertencia / mala práctica | Sin limpieza: si la pantalla se desmonta o llega una respuesta vieja, se hace `setState` igual. | Bandera `descartado` en la limpieza. |
| 4 | 13-16 | Mala práctica (rechazo en tiendas) | Pide cámara y notificaciones **al abrir el Catálogo**, sin contexto ni pantalla previa, y sin manejar la respuesta. | Pedir cada permiso cuando se usa la función, después de `/permisos/[recurso]`. |
| 5 | 16 | Advertencia (lint) | Dependencias incompletas: usa `pedirPermiso` y no está en el array (`react-hooks/exhaustive-deps`). | Se elimina el efecto (punto 4). |
| 6 | 10, 22 | Mala práctica | `any`: se pierde el chequeo de tipos (`libro.titulo` podría no existir). | `useState<Libro[]>` y `{ libro: Libro }`. |
| 7 | 22-30 | Rendimiento / error sutil | `Fila` está **declarado dentro** de `Catalogo`: en cada render es un tipo de componente nuevo, React desmonta y vuelve a montar todas las filas (se pierde estado interno). | Componente a nivel de módulo en su archivo (`FilaLibro.tsx`). |
| 8 | 34-35 | Advertencia / error sutil | `key={i}` (índice): si la lista cambia de orden o se filtra, React asocia mal los elementos. | `keyExtractor={(libro) => libro.isbn}`. |
| 9 | 33-36 | Rendimiento | `ScrollView` + `map` renderiza todos los libros de una; no virtualiza. | `FlatList` con `ListEmptyComponent`. |
| 10 | — | Mala práctica | No hay estados de carga, error ni vacío: mientras carga se ve una pantalla en blanco. | `EstadoListaCatalogo`. |
| 11 | 25 | Mala práctica | Estilos en línea con colores fijos (`#333` sobre fondo oscuro ni siquiera se lee). | `StyleSheet.create` + `tema.ts`. |
| 12 | 24 | Mala práctica | `'/libro/' + libro.isbn`: concatenar rompe las rutas tipadas. | `{ pathname: '/libro/[isbn]', params: { isbn } }`. |
| 13 | 37-39 | Accesibilidad | Botón de solo ícono sin `accessibilityRole` ni `accessibilityLabel`; un lector de pantalla dice «botón» sin más. El ícono de 28 px sin padding no llega a 44 × 44. | `accessibilityRole="button"`, `accessibilityLabel="Escanear"`, tamaño mínimo. |
| 14 | 11 | Mala práctica | Hook de cámara en el Catálogo, que no usa la cámara. | Solo en `/escanear` (vía `usePermiso`). |

**b) El efecto sin dependencias durante el primer minuto.** Render 1 (lista vacía) → corre el efecto → pedido → a los 800 ms `setLibros(datos)` → render 2 → corre el efecto otra vez (no hay array) → otro pedido → 800 ms → `setLibros` → render 3… Resultado: un pedido cada ~800 ms, unos **75 pedidos por minuto**, con su consumo de batería y datos. Cuando falla (20 %) hay un rechazo sin manejar, el estado no cambia, no hay render y el ciclo **se corta**: la lista queda con los datos del último éxito (o vacía si falla el primero). Si `obtenerLibros()` devolviera **siempre el mismo array** (misma referencia), `setLibros` recibiría un valor `Object.is`-igual al actual y React evitaría el render: el bucle se cortaría después del segundo pedido. Como cada respuesta trae objetos nuevos (`map(libro => ({ ...libro }))`), React siempre ve un estado distinto y el bucle sigue.

**c) Reescritura con los hooks, componentes y constantes de mi app** (es lo que hay en `src/app/(tabs)/(catalogo)/index.tsx`):

```tsx
import { FlatList, StyleSheet } from 'react-native';

import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { EstadoListaCatalogo } from '../../../components/EstadoListaCatalogo';
import { FilaLibro } from '../../../components/FilaLibro';
import { Separador } from '../../../components/Separador';
import { colores, espaciado } from '../../../constants/tema';
import { useBiblioteca } from '../../../hooks/useBiblioteca';
import { useLibros } from '../../../hooks/useLibros';

export default function PantallaCatalogo() {
  const { libros, cargando, error, reintentar } = useLibros();
  const { disponibles } = useBiblioteca();

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.contenido}
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} disponibles={disponibles(item.isbn)} />}
      ItemSeparatorComponent={Separador}
      ListHeaderComponent={<EncabezadoCatalogo />}
      ListEmptyComponent={
        <EstadoListaCatalogo cargando={cargando} error={error} onReintentar={reintentar} />
      }
    />
  );
}

const styles = StyleSheet.create({
  lista: { backgroundColor: colores.fondo },
  contenido: { flexGrow: 1, padding: espaciado.lg },
});
```

El acceso a «Escanear» (con rol de botón y área de 44 × 44) está en `AccesosRapidos`, dentro de `EncabezadoCatalogo`, y los permisos ya no se piden acá.

**d)** **Rechazo en la tienda:** pedir cámara y notificaciones apenas se abre la app, sin relación con una acción de la persona (líneas 13-16). Las guías de Apple (5.1.1) piden solicitar permisos en contexto y con un propósito claro; una app que pide la cámara al abrir el catálogo, sin usarla ahí, es candidata a rechazo. **Desinstalación:** el efecto sin dependencias (líneas 18-20): pedidos continuos que gastan batería y datos, y cuando la red falla una pantalla en blanco sin forma de reintentar. Sumado a los dos diálogos de permisos de entrada, es la primera impresión de la app.

### E2. Organización y acoplamiento

**a) Importaciones entre carpetas**

```
app ──────────► components, hooks, constants, lib, types
components ───► hooks, constants, lib, types, (otros components)
hooks ────────► context, lib, types, constants
context ──────► estructuras, lib, data, constants, types
lib ──────────► data, constants, types
estructuras ──► (nada)
data ─────────► types
constants ────► (nada; navegacion.ts usa tipos de expo-router)
types ────────► (nada)
```

No hay importaciones «hacia arriba»: ningún archivo fuera de `src/app` importa de `src/app`. Sería un problema porque `src/app` es lo más cambiante (rutas y pantallas) y Expo Router trata cada archivo como ruta: un hook que importara una pantalla quedaría acoplado a la navegación, podría generar dependencias circulares y no se podría reutilizar ni testear sin cargar la pantalla. Lo más cercano es `PilaRaiz` en `components`, que *contiene* la definición del Stack raíz pero no importa nada de `src/app`.

**b) Si el catálogo viniera de una API real**, cambiaría `src/lib/api.ts` (hacer `fetch` en vez de leer `LIBROS`) y `src/lib/catalogo.ts` (`buscarPorIsbn` hoy lee los datos locales en forma sincrónica). Además, el Context y algunas pantallas llaman a `buscarPorIsbn` de forma sincrónica (detalle, reservar, Mis reservas, mostrador), así que habría que pasar a una caché o a un hook `useLibro(isbn)` con estados de carga. Que la lista pase de dos archivos me dice que la **lectura sincrónica de los datos locales se filtró** fuera de `lib`: para un cambio de origen de datos limpio, el resto de la app debería depender de una única interfaz asincrónica (por ejemplo `obtenerLibro(isbn): Promise<Libro>`).

**c) `<ConPermiso recurso="camara">`**: ganaría menos código repetido en cada pantalla (los cuatro estados, el texto previo y «Abrir Ajustes» quedarían en un solo lugar) y sería difícil olvidarse de un estado. Perdería flexibilidad: el escáner necesita mostrar el ingreso manual **en todos los estados** y decidir qué ve en cada uno; un envoltorio que solo renderiza a sus hijos cuando hay permiso esconde eso o se llena de props. Para las notificaciones **no sirve**: no hay una pantalla que envolver, el permiso se pide al activar un interruptor y la decisión es una acción (programar o no) dentro de un evento. Para eso sirve más un hook (`usePermiso`) que devuelve estado y funciones, que es lo que usé.

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
|---|---|---|
| `obtenerLibros()` falla | «Sin conexión» con el mensaje claro y «Reintentar» | `src/hooks/useLibros.ts:35-38`; `src/components/EstadoListaCatalogo.tsx:22-28` |
| Se abre `/libro/abc` | «Ese código no es un ISBN» + «Ir al catálogo» | `src/app/(tabs)/(catalogo)/libro/[isbn].tsx:17,26-33`; `src/components/LibroNoEncontrado.tsx` |
| Se escanea un ISBN que no está | Aviso «El código … no está en el catálogo»; la cámara sigue | `src/components/VisorEscaner.tsx:26-36` |
| La cámara está bloqueada | «La cámara está bloqueada», «Abrir Ajustes» e ingreso manual | `src/lib/permisos.ts:23`; rama `bloqueado` de `src/app/escanear.tsx` |
| Las notificaciones están denegadas | Aviso fijo en «Mis reservas» y los avisos de entrega dentro de la app | `src/components/AvisosReservas.tsx`; `src/context/BibliotecaContext.tsx:299-302` |
| Se intenta reservar un libro ya reservado | En el detalle, «Reservar» deshabilitado con explicación; en `/reservar/[isbn]`, «Ya reservaste este libro» + «Ver mis reservas» | `libro/[isbn].tsx` (`yaReservado`); `src/app/reservar/[isbn].tsx:25-35`; `BibliotecaContext.tsx:231-233` |
| «Entregar al siguiente» con la lista vacía | No se puede llegar desde la UI: el mostrador solo lista libros con espera. Si ocurriera, mensaje «Nadie espera … en este momento» | `BibliotecaContext.tsx:286-290`; `src/app/mostrador.tsx` |
| Login con clave incorrecta | «Usuario o clave incorrectos. Revisalos e intentá de nuevo.» | `src/app/login.tsx:17-21` |

### E4. Decisiones con argumentos

**a) Identificador: ISBN.** En esta app el ISBN es el dato que trae el mundo real: el escáner lee el EAN-13 de la contratapa y lo usa directo para abrir el detalle, sin tabla intermedia; además hace que los deep links sean legibles y estables (`/libro/9780307474728`). Como `useLocalSearchParams` devuelve **strings**, un ISBN como texto evita conversiones (`Number("0123…")` perdería ceros y un id numérico requeriría `parseInt` y validar `NaN`); por eso el tipo es `string` y la validación es una regex de 13 dígitos. Los contras son reales: dos ediciones del mismo título tienen ISBN distintos (para mí es correcto: son ejemplares distintos en el estante), pero libros viejos sin ISBN o materiales propios del Instituto no tendrían clave. Si la biblioteca los incorporara, pasaría a un `id` propio (string) y dejaría el ISBN como dato opcional y buscable.

**b) Estructuras: clase con `#items`.** La clase me dio encapsulamiento: nadie puede hacer `shift()` o insertar en el medio de una lista de espera, y la API (`encolar`, `desencolar`, `verFrente`, `tamanio`) expresa la regla del negocio. Además pude testearla sin React. Lo que complicó fue combinarla con React: el estado tiene que ser inmutable y la clase es mutable, así que cada operación crea una instancia nueva (`Cola.desde(...)`, ver B3) y para persistir hay que pasar por `aArray()`, porque `JSON.stringify` no ve los campos privados. Con un array en el estado (`[...pila, x]`, `slice`) eso sería natural, pero la regla FIFO quedaría repartida en cada lugar que toca el array.

**c) Memorización.** Usé `useMemo` para el `value` del Context (`BibliotecaContext.tsx:345`) y `useCallback` para sus funciones. Ahí aportan: sin `useMemo`, cada render del provider crea un objeto nuevo y re-renderiza a **todos** los consumidores aunque nada haya cambiado. También `recientes` (`:322`), que deduplica la pila. Serían ruido, por ejemplo, en un `useCallback` para el `onPress` de un botón suelto (`() => router.back()`) o en un `useMemo` para calcular `posicionFutura` en la confirmación: son cálculos triviales y los hijos no están memoizados. El proyecto tiene además el **React Compiler** activo (`experiments.reactCompiler` en `app.json`), que memoiza automáticamente; mis `useMemo`/`useCallback` dejan explícito lo que importa y no dependen del compilador. Para comprobarlo en vez de suponerlo: React DevTools → Profiler, grabar «activar un recordatorio» y ver qué componentes se renderizaron y cuánto tardaron, con y sin la memorización (o la opción «Highlight updates when components render»).

**d) Datos duplicados: los calculo.** `disponibles(isbn)` es `libro.ejemplares - préstamos del estante` (`BibliotecaContext.tsx:195-207`). Si guardara un contador `disponibles` además de la lista de préstamos, cada operación (reservar, devolver, entregar desde el mostrador, cargar desde AsyncStorage) tendría que actualizar los dos lugares; si una se olvida (o falla a la mitad), el contador dice «2 disponibles» mientras la lista de préstamos dice otra cosa, y la app podría prestar un ejemplar que no existe. Con un solo lugar de verdad (los préstamos) y el resto calculado, esa inconsistencia no puede pasar.
