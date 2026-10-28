## Atajos de teclado

Los atajos son los mismos que en la versión de terminal de BubiPad, salvo los que el navegador reserva para sí. `Ctrl` equivale a `Cmd` en macOS. La pantalla de ayuda (botón `?`, o `Ctrl+.` y luego `?`) los lista todos.

En macOS no se capturan las combinaciones `Alt`+letra (con Opción el teclado escribe otros caracteres): ahí valen la tecla líder y el resto de atajos.

### Archivos y navegación

- `Ctrl+N` / `Ctrl+Shift+A` — Nueva nota
- `Ctrl+S` — Guardar · `Ctrl+Shift+S` — Guardar como
- `Ctrl+O` — Buscar y abrir archivo por nombre
- `Alt+O` / `Ctrl+Shift+O` — Abrir archivo del ordenador
- `Ctrl+P` / `F9` / `Ctrl+Shift+F` — Mostrar u ocultar el explorador
- `Alt+H` — Abrir el archivo «home»
- `Ctrl+W` / `Ctrl+Shift+X` — Cerrar la pestaña actual
- `Ctrl+T` / `Ctrl+Shift+M` — Esquema del documento (en vista previa salta al título sin cambiar de modo)
- `Alt+R` — Panel de GitHub
- `F4` — Abrir el enlace bajo el cursor

### Pestañas e historial

- `Alt+RePág` / `Alt+AvPág` — Pestaña anterior / siguiente (también `Alt+←` / `Alt+→` fuera de macOS, y `Ctrl+Tab` si el navegador lo deja pasar)
- `Alt+1` … `Alt+8` — Ir a esa pestaña · `Alt+9` — la última
- `Alt+Shift+←` / `Alt+Shift+→` — Atrás / adelante en el historial de pestañas (en vista previa también `Retroceso` para ir atrás)

### Vista

- `Ctrl+E` — Alternar vista previa ↔ edición (vuelve al último modo de edición usado: Monaco o texto). También con el chip ■/□ de la barra de estado (■ amarillo = vista previa, □ = edición) y con los iconos del editor y del ojo de la barra de herramientas cuando ya están activos
- `Ctrl+R` y luego `l` — Tema claro/oscuro
- `Alt+=` / `Alt+−` — Aumentar / reducir el zoom (también `Ctrl+Shift+G` para aumentar)
- `e` en la vista previa — Editar

### Edición

- `Ctrl+B` / `Ctrl+I` (o `Alt+I`) — Negrita / cursiva · `Ctrl+K` — Insertar enlace (usa el portapapeles como URL)
- `Alt+E` o `:` — Selector de emojis
- `Ctrl+U` — minúsculas → MAYÚSCULAS → Título → minúsculas (sobre la selección o la palabra bajo el cursor)
- `Ctrl+J` — Unir líneas · `Ctrl+D` / `Ctrl+Shift+K` — Eliminar línea · `Ctrl+L` — Seleccionar línea
- `Ctrl+↑` / `Ctrl+↓` — Inicio / final del archivo (en macOS, `Cmd+↑/↓`)
- `Alt+↑` / `Alt+↓` o `Ctrl+Shift+↑` / `Ctrl+Shift+↓` — Mover línea · `Alt+Shift+↑` / `Alt+Shift+↓` — Duplicar línea
- `Alt+X` — Unicode ↔ carácter
- `Ctrl+F` / `Ctrl+H` — Buscar / reemplazar · `F3` / `Shift+F3` — Siguiente / anterior
- `F1` o `Ctrl+Shift+P` — Paleta de comandos de Monaco
- `Enter` en una lista (`- `, `* `, `1. `, `- [ ] `) — Continúa la lista; si el elemento está vacío, la termina

### Corrector ortográfico

- `Alt+L` (o `F6`) — Idioma: español → euskera → ninguno. La app arranca sin corrector y el idioma elegido se mantiene durante la sesión
- `Ctrl+R` y luego `z` — Activar/desactivar el corrector
- `F7` / `Shift+F7` — Error siguiente / anterior
- `F8` o `Alt+Intro` — Sugerencias para el error bajo el cursor, con opciones para añadir la palabra al diccionario (se guarda en el navegador) o ignorarla en la sesión

### Tecla líder: `Ctrl+R` (o `Ctrl+.`, o `F2`), luego una letra

Al pulsarla aparece un aviso en la barra de estado esperando la siguiente tecla (4 segundos de margen, o `Escape` para cancelar):

- `s` guardar · `a` guardar como · `n` nueva nota · `o` abrir carpeta · `b` abrir archivo del ordenador
- `p` buscar archivo · `h` home · `g` panel de GitHub · `x` cerrar carpeta/repositorio · `q` cerrar pestaña
- `f` buscar · `r` reemplazar · `k` insertar enlace · `m` esquema · `u` lista de enlaces de la nota
- `e` editor · `v` vista previa · `t` texto plano
- `d` eliminar línea · `j` unir líneas · `w` minúsculas/MAYÚSCULAS/Título · `c` paleta de comandos
- `l` tema · `i` idioma del corrector · `z` corrector sí/no · `+` / `-` zoom
- `←` / `→` historial · `↑` / `↓` mover línea · `Tab` / `Shift+Tab` pestaña siguiente / anterior · `?` ayuda

### Cambios respecto a versiones anteriores

Para coincidir con la versión de terminal: `Ctrl+O` ahora busca archivo (antes abría carpeta; ahora es `Ctrl+.` `o`), `Ctrl+P` alterna el explorador (antes buscaba archivo), `Alt+H` abre «home» (antes `Ctrl+H`, que vuelve a ser «reemplazar» de Monaco), `Ctrl+D` elimina la línea (antes añadía la siguiente coincidencia a la selección; sigue disponible desde la paleta de comandos), `Ctrl+U` cicla mayúsculas/minúsculas/Título y `Ctrl+Shift+P` abre la paleta de comandos (antes reducía el tamaño de letra: ahora `Alt+−`).

### Notas sobre atajos reservados por el navegador

Algunas combinaciones (`Ctrl+N`, `Ctrl+O`, `Ctrl+P`, `Ctrl+W`, `Ctrl+T`, `Ctrl+Tab`, `Ctrl+H`...) coinciden con atajos que los navegadores reservan para sí mismos. En una pestaña normal pueden no llegar nunca a la aplicación. Dos formas de evitarlo:

- Instalar BubiPad como aplicación web (sin barra de navegador ni pestañas), donde estas combinaciones quedan libres.
- Usar siempre la tecla líder (`Ctrl+.` o `F2`), que no coincide con ningún atajo reservado conocido y ofrece una alternativa fiable para prácticamente todas las acciones.



## GitHub: uno o varios repositorios con el mismo token

En el panel de GitHub (icono del gato, `Alt+R`) basta con pegar el token y pulsar «Conectar»:

- **Campo de repositorios vacío:** se abren todos los repositorios a los que da acceso el token (hasta 6, por orden alfabético, ignorando los archivados y prefiriendo aquellos en los que se puede escribir). Un token limitado a un solo repositorio (por ejemplo, solo KZ) abre solo ese, exactamente como antes. Un token con acceso a varios abre todos sin tener que elegir.
- **Lista explícita:** `usuario/Notas, usuario/KZ`. Se abren en el orden escrito; si alguno falla se avisa y se abren los demás.
- Con un solo repositorio el explorador es el de siempre (`GH: usuario/repo`). Con varios, cada repositorio es una carpeta de la raíz `GH: …`; su contenido se descarga la primera vez que se despliega (o al buscar archivos con `Ctrl+O`, que lista los archivos de todos los repositorios, una línea por archivo). El repositorio del archivo abierto aparece en la barra de estado, a la izquierda del chip ■/□.
- **Home:** al conectar o recargar se abre el archivo cuyo nombre contenga «home» del último repositorio en el que abriste un archivo; si no hay historial, del primero de la lista; si ese no tiene, del siguiente. `Alt+H` sigue el mismo criterio.
- Los enlaces `[[nota]]` y los enlaces relativos se resuelven dentro del repositorio del archivo abierto. No se puede crear archivos ni eliminar en la raíz `GH:`, ni eliminar un repositorio entero.
- El token se guarda en el navegador. En un token «fine-grained», concede acceso solo a los repositorios que quieras ver.

# Diccionarios incluidos en la app

BubiPad busca aquí, en `dic/index.json`, la lista de diccionarios Hunspell
disponibles "de fábrica" (sin necesidad de elegir una carpeta local, algo
que iOS no permite). Se cargan por `fetch()` desde el propio origen de la
app, así que funcionan igual en escritorio, Android e iOS, y quedan
cacheados por el Service Worker para uso sin conexión tras la primera carga.

## Formato de `index.json`

```json
[
  { "id": "es_ES", "label": "Español (España)" },
  { "id": "en_US", "label": "English (US)" }
]
```

Para cada entrada, la app pide `dic/<id>.aff` y `dic/<id>.dic` (mismo
formato que usan LibreOffice/Firefox). Si quieres apuntar a otros nombres
de fichero puedes añadir `"aff"` y `"dic"` con rutas explícitas:

```json
{ "id": "fr_FR", "label": "Français", "aff": "dic/fr/fr_FR.aff", "dic": "dic/fr/fr_FR.dic" }
```

## Añadir un idioma nuevo

1. Copia el par `<idioma>.aff` + `<idioma>.dic` en esta carpeta (los mismos
   ficheros que usan LibreOffice o Firefox; por ejemplo, desde
   https://github.com/LibreOffice/dictionaries).
2. Añade una entrada en `index.json`.
3. Sube los cambios al repositorio de GitHub del que se sirve la app
   (GitHub Pages u otro hosting estático): al estar dentro del propio
   repo, no hace falta tocar la Content-Security-Policy ni pedir permisos
   de sistema de archivos.

## Diccionarios incluidos por defecto

`es_ES` y `en_US` provienen de LibreOffice/dictionaries
(https://github.com/LibreOffice/dictionaries), con licencia GPLv3 / LGPLv3
/ MPL a elección del usuario. Ver `README_es_ES.md` y `README_en_US.txt`
para más detalle.

## La carpeta local sigue disponible

En navegadores de escritorio compatibles con la File System Access API
(Chrome, Edge...) el botón "Elegir carpeta de diccionarios" del selector
de idioma sigue funcionando igual que antes, como opción adicional para
diccionarios propios sin tener que republicar la app. En iOS ese botón se
oculta automáticamente porque el navegador no soporta esa API.
