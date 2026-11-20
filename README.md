# Biblioteca IPF

App integradora del Taller Complementario – React Native II (TP N° 4). Las personas usuarias consultan el catálogo, reservan libros y reciben un recordatorio antes de devolverlos. El personal entrega los libros respetando el orden de las reservas.

- **SDK de Expo:** 58 (`expo ~58.0.26`, `expo-router ~58.0.32`, React Native 0.88, React 19.3)
- **Creado con:** `npx create-expo-app@latest` (TypeScript + Expo Router, carpeta `src/app`)
- **Paquetes agregados con** `npx expo install`: `expo-camera`, `expo-notifications`, `@expo/vector-icons`, `@react-native-async-storage/async-storage`, `jest-expo`, `jest`
- **Tema:** oscuro en toda la app (`userInterfaceStyle: "dark"`), con todos los colores en `src/constants/tema.ts`

## Cómo ejecutarlo

```bash
npm install
npx expo start          # escanear el QR con Expo Go (Android o iOS)
npx tsc --noEmit        # chequeo de tipos
npx expo lint           # lint
npm test                # tests de Pila y Cola (jest-expo)
```

**Credenciales del personal** (fijas en `src/constants/biblioteca.ts`): usuario `biblioteca`, clave `ipf2026`.

**Para probar el escáner** con un libro real: los dos primeros libros de `src/data/libros.ts` tienen ISBN reales (*Cien años de soledad*, Vintage Español: `9780307474728`; *Ficciones*, Debolsillo: `9788499089515`). Si tenés otros libros a mano, reemplazá esos dos ISBN por los de la contratapa.

**Para probar el aviso de entrega:** reservá *El Aleph* (sin ejemplares, ya hay dos personas esperando), entrá como personal y tocá «Entregar al siguiente» tres veces. En la tercera te toca a vos: recibís una notificación si el permiso está concedido, o un aviso en «Mis reservas» si no.

## Árbol de rutas (`src/app`)

```
src/app
├── _layout.tsx                 Stack raíz (BibliotecaProvider, anchor: "(tabs)", Stack.Protected)
├── (tabs)
│   ├── _layout.tsx             Tabs (import { Tabs } from 'expo-router/js-tabs')
│   ├── (catalogo)
│   │   ├── _layout.tsx         Stack propio de la pestaña Catálogo (anchor: "index")
│   │   ├── index.tsx           /                 Catálogo
│   │   └── libro
│   │       └── [isbn].tsx      /libro/[isbn]     Detalle
│   └── reservas.tsx            /reservas         Mis reservas
├── buscar.tsx                  /buscar?q=        Stack raíz
├── escanear.tsx                /escanear         Stack raíz
├── reservar
│   └── [isbn].tsx              /reservar/[isbn]  Stack raíz, presentation: "modal"
├── permisos
│   └── [recurso].tsx           /permisos/[recurso]  presentation: "modal" (camara | notificaciones)
├── login.tsx                   /login            modal, Stack.Protected guard={!sesionIniciada}
├── mostrador.tsx               /mostrador        Stack.Protected guard={sesionIniciada}
├── reserva.tsx                 /reserva          <Redirect href="/reservas" />
└── +not-found.tsx              cualquier otra    404 con la URL inexistente
```

| `_layout` | Navegador |
|---|---|
| `src/app/_layout.tsx` | **Stack raíz**. Monta el provider y delega las pantallas en `src/components/PilaRaiz.tsx`, que lee la sesión del Context para los `Stack.Protected`. `unstable_settings.anchor = '(tabs)'` deja las pestañas debajo de cualquier deep link. |
| `src/app/(tabs)/_layout.tsx` | **Tabs** (`expo-router/js-tabs`, que en SDK 58 reemplaza al `Tabs` exportado desde `expo-router`, ahora deprecado). Íconos de `@expo/vector-icons`. |
| `src/app/(tabs)/(catalogo)/_layout.tsx` | **Stack** de la pestaña Catálogo, con el link «Personal» en el header. `anchor: 'index'` deja el Catálogo debajo de un deep link a `/libro/[isbn]`. |

## Estructura del proyecto

| Carpeta | Contenido |
|---|---|
| `src/app` | Solo rutas y layouts |
| `src/components` | Un componente por archivo (botones, tarjetas, estados de pantalla, visor del escáner…) |
| `src/hooks` | `useLibros`, `useBusqueda`, `usePermiso`, `useBiblioteca` |
| `src/lib` | `api.ts` (entregado), catálogo, fechas, notificaciones, permisos, almacenamiento |
| `src/context` | `BibliotecaContext` (préstamos, listas de espera, recientes, avisos y sesión) |
| `src/estructuras` | `Pila` y `Cola` con `#items`, `tamanio` y `aArray()`, más sus tests |
| `src/data` | `libros.ts` (16 libros y listas de espera iniciales) |
| `src/types` | Tipos compartidos (`Libro` entregado, `Prestamo`, `Aviso`…) |
| `src/constants` | `tema.ts` (colores, espaciados, tamaños), opciones de navegación y constantes de negocio |

## Bloque `plugins` de `app.json` (comentado)

JSON no admite comentarios, por eso se explica acá:

```jsonc
"plugins": [
  // Expo Router: rutas basadas en archivos y deep links con el scheme "bibliotecaipf".
  "expo-router",

  // Splash con el fondo oscuro de la app; se oculta recién cuando el Context terminó de leer lo guardado.
  ["expo-splash-screen", { "backgroundColor": "#0E1116", "image": "./assets/images/splash-icon.png", "imageWidth": 76 }],

  // Cámara: texto de propósito con el molde "Usamos tu [dato] para [beneficio]" (NSCameraUsageDescription en iOS).
  // Mínimo privilegio: la app solo lee códigos de barras, no graba video, así que no pide micrófono
  // (microphonePermission: false quita NSMicrophoneUsageDescription; recordAudioAndroid: false quita RECORD_AUDIO).
  ["expo-camera", {
    "cameraPermission": "Usamos tu cámara para leer el código de barras de la contratapa y abrir ese libro sin tener que escribir el ISBN.",
    "microphonePermission": false,
    "recordAudioAndroid": false
  }],

  // Notificaciones locales: color del ícono en la bandeja de Android. No se usan notificaciones push.
  ["expo-notifications", { "color": "#E0A458" }]
]
```

## Permisos

| Recurso | Módulo | Cuándo se pide | Alternativa si se niega |
|---|---|---|---|
| Cámara | `expo-camera` (`useCameraPermissions`, dentro de `usePermiso`) | Al tocar «Usar la cámara» en `/escanear`, después de la pantalla previa `/permisos/camara` y su botón «Continuar» | Escribir el ISBN a mano en la misma pantalla. Si está bloqueado: botón «Abrir Ajustes» |
| Notificaciones | `expo-notifications` (`createPermissionHook` dentro de `usePermiso`) | Solo al activar «Recordarme» en un préstamo, después de `/permisos/notificaciones`. En Android se crea antes el canal `prestamos` | Los avisos aparecen dentro de «Mis reservas» |

La app no pide ningún otro permiso. No instala `expo-location`, `expo-image-picker` ni `expo-permissions`.

### Justificación de `blockedPermissions` (Android)

Algunas librerías o la plantilla pueden agregar permisos al `AndroidManifest.xml` por su cuenta. `blockedPermissions` los quita aunque una dependencia los declare:

| Permiso bloqueado | Por qué no hace falta |
|---|---|
| `RECORD_AUDIO` | La cámara solo lee códigos de barras; no se graba video con sonido. |
| `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION` | La app no usa la ubicación. |
| `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO` | No se leen ni se guardan fotos, videos ni archivos de la galería. |
| `READ_CONTACTS` | No se usan contactos. |
| `SYSTEM_ALERT_WINDOW` | La app no dibuja sobre otras apps. |

## Deep links de prueba

En Expo Go se reemplaza `bibliotecaipf://` por `exp://<IP>:8081/--/`.

| Link | Qué se espera |
|---|---|
| `bibliotecaipf://libro/9780307474728` | Detalle de *Cien años de soledad*, con el Catálogo debajo |
| `bibliotecaipf://libro/123` | Mensaje «Ese código no es un ISBN» y botón al Catálogo |
| `bibliotecaipf://buscar?q=borges` | Buscador con «borges» cargado y las pestañas debajo |
| `bibliotecaipf://mostrador` (sin sesión) | Redirige al anchor: Catálogo |
| `bibliotecaipf://reserva` | Redirige a «Mis reservas» |
| `bibliotecaipf://escanear` (cámara bloqueada) | Mensaje de cámara bloqueada, «Abrir Ajustes» e ingreso manual del ISBN |
| `bibliotecaipf://cualquier-cosa` | Pantalla 404 con la URL |

## Desafíos opcionales hechos

- **Persistencia:** préstamos (con el identificador de cada recordatorio), recientes, listas de espera y avisos se guardan con AsyncStorage (`src/lib/almacenamiento.ts`). El splash queda visible hasta terminar la carga, así la app nunca aparece vacía.
- **Pruebas:** 11 tests de `Pila` y `Cola` con jest-expo, incluido desencolar una cola vacía.
- **Debounce:** el buscador espera 300 ms sin cambios antes de llamar a `buscarLibros`, y limpia el temporizador.
- **Modo oscuro:** la app usa una única paleta oscura definida en `tema.ts` (`userInterfaceStyle: "dark"`).

## Salida de lint, tipos y tests

```text
$ npx tsc --noEmit
(sin errores, código de salida 0)

$ npx expo lint
(sin errores ni advertencias, código de salida 0)

$ npm test
Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
```

## Video de demostración

En lugar de capturas, el funcionamiento de la app se muestra en un video grabado en el teléfono (1 min 20 s):

[▶ Ver el video de demostración](docs/demo-biblioteca-ipf.mp4)
