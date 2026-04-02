# FocusFlow PWA

Temporizador tipo Pomodoro en una sola pagina (`index.html`), con historial, configuracion de fondo/alarma y modo offline via Service Worker.

## Uso rapido

- Instala dependencias: `npm install`
- Compila TypeScript: `npm run build`
- Sirve con un servidor local (por ejemplo `npx serve .`).
- Abre la URL local y no el archivo directamente para validar PWA/offline.

## Build TypeScript

- `npm run build`: compila `src/**/*.ts` a `dist/src/*.js` y `sw.ts` a `sw.js`.
- `npm run typecheck`: chequeo estricto de tipos para la app.

## Atajos de teclado

- `Space` o `Enter`: alterna entre iniciar, pausar y reanudar el temporizador.
- `S`: detener el temporizador (cuando esta en ejecucion o pausa).
- `Shift+H`: abrir/cerrar el panel de historial.
- `,` o `P`: abrir/cerrar el panel de configuracion.
- `Esc`: cerrar paneles abiertos.

Navegacion en menus abiertos (vim-style):

- `j` / `k`: mover foco abajo/arriba.
- `G`: ir al final.
- `gg`: ir al inicio.
- En historial: `h` / `l` cambia de dia seleccionado.
- `Enter`: activa elemento enfocado (tab, bloque o sesion).

## Historial

- Boton `Borrar` en la cabecera del panel lateral para limpiar todo el historial.
- El historial ahora se agrupa por dias (tabs).
- Cada dia muestra bloques `Morning`, `Afternoon`, `Evening`.
- Solo se contabiliza tiempo de `focus` para los totales diarios y de bloque.
- Click o `Enter` sobre una sesion de focus aplica esa duracion al temporizador.

Notas de comportamiento:

- Los atajos no se disparan mientras escribes en `input`, `textarea`, `select` o elementos `contenteditable`.
- `Space` y `Enter` no interceptan la interaccion normal cuando el foco esta en botones/enlaces.

## Ajuste del panel derecho (historial)

Se corrigio el posicionamiento del menu lateral derecho para evitar que el tab/panel se vea desalineado o montado:

- El tab de historial queda fijo al borde derecho.
- El panel ahora se posiciona de forma absoluta respecto al wrapper y se desliza con `transform`.
- Se agrego un ancho responsive (`min(230px, 78vw)`) para mejorar comportamiento en pantallas pequenas.

## Estructura principal

- `index.html`: shell principal de UI y estilos.
- `src/main.ts`: modulo principal (timer, teclado global, lazy loading).
- `src/state.ts`: estado global y utilidades de tiempo.
- `src/ring.ts`: logica del anillo y animacion rAF.
- `src/timerCore.ts`: flujo start/pause/resume/stop del temporizador.
- `src/uiBindings.ts`: render y binding de eventos de UI.
- `src/keyboard.ts`: atajos globales y navegacion vim en menus.
- `src/storage.ts`: localStorage + IndexedDB + serializacion.
- `src/lazyModules.ts`: carga lazy de historial/audio.
- `src/historyMenu.ts`: modulo lazy para historial por dia/bloques.
- `src/audioEngine.ts`: modulo lazy para sonidos de alarma.
- `dist/src/*.js`: salida compilada usada por `index.html`.
- `sw.js`: Service Worker para cache/offline.
- `sw.ts`: fuente TypeScript del Service Worker.
- `manifest.json`: configuracion instalable de la PWA.
