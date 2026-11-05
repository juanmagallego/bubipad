## Atajos de teclado

Los atajos son los mismos que en la versión de terminal de BubiPad, salvo los que el navegador reserva para sí. `Ctrl` equivale a `Cmd` en macOS. La pantalla de ayuda (botón `?`, o `Ctrl+.` y luego `?`) los lista todos.

En macOS no se capturan las combinaciones `Alt`+letra (con Opción el teclado escribe otros caracteres): ahí valen la tecla líder y el resto de atajos.

### Archivos y navegación

- Nueva nota: ya no se crea desde la web (solo desde la versión de terminal)
- `Ctrl+R` `y` — Exportar copia: guarda una copia en otro sitio **sin cambiar el destino** del archivo (un archivo de GitHub sigue guardándose en GitHub). Sin File System Access API (Safari/iPad) se descarga el archivo
- `Ctrl+S` — Guardar · `Ctrl+Shift+S` — Guardar como
- `Ctrl+O` — Buscar y abrir archivo por nombre
- `Alt+O` / `Ctrl+Shift+O` — Abrir archivo del ordenador
- `Ctrl+P` / `F9` / `Ctrl+Shift+F` — Mostrar u ocultar el explorador
- `Alt+H` — Abrir el archivo «home»
- `Ctrl+W` / `Ctrl+Shift+X` — Cerrar la pestaña actual
- `Ctrl+T` / `Ctrl+Shift+M` — Esquema del documento (en vista previa salta al título sin cambiar de modo)
- `Alt+R` — Panel de GitHub
- `Alt+M` o `F10` — Abre el menú (Archivo) o lo cierra si ya está abierto (`Alt+M` no funciona en macOS, como el resto de atajos `Alt`). Alternativa a `Esc` en Android, donde `Esc` hace de «Atrás» y cierra la app. También `Ctrl+R` y luego `Espacio` (o `Intro`).
- `Esc` — Cierra la ventana o el menú abiertos; si no hay ninguno, abre el primer menú (Archivo). Con un menú abierto: `←`/`→` cambian de menú, `↑`/`↓` (o `Inicio`/`Fin`) se mueven por las opciones, una letra salta a la opción que empieza por ella, `Intro` la ejecuta y `Esc` sale devolviendo el foco al editor. En el editor, `Esc` sigue siendo de Mónaco mientras haya abierto el buscador, las sugerencias o la paleta de comandos
- Esquema (`Ctrl+T`): el foco queda en el primer título; `↑`/`↓`, `Inicio`/`Fin` para moverse e `Intro` para saltar
- `F4` — Abrir el enlace bajo el cursor

### Pestañas e historial

- `Alt+RePág` / `Alt+AvPág` — Pestaña anterior / siguiente (también `Alt+←` / `Alt+→` fuera de macOS, y `Ctrl+Tab` si el navegador lo deja pasar)
- `Alt+1` … `Alt+8` — Ir a esa pestaña · `Alt+9` — la última
- `Alt+Shift+←` / `Alt+Shift+→` — Atrás / adelante en el historial de pestañas (en vista previa también `Retroceso` para ir atrás)

### Vista

- `Ctrl+E` — Alternar vista previa ↔ Mónaco (el botón del toolbar, el chip ■/□ y el menú Ver hacen lo mismo; el texto plano sigue en Ver y `Ctrl+R t`). También con el chip ■/□ de la barra de estado (■ amarillo = vista previa, □ = edición) y con los iconos del editor y del ojo de la barra de herramientas cuando ya están activos
- `Ctrl+R` y luego `l` — Tema claro/oscuro
- `Alt+=` / `Alt+−` — Aumentar / reducir el zoom (también `Ctrl+Shift+G` para aumentar)
- `e` en la vista previa — Editar

### Edición

- `Ctrl+B` / `Ctrl+I` (o `Alt+I`) — Negrita / cursiva · `Ctrl+K` — Insertar enlace (usa el portapapeles como URL)
- `:` — Selector de emojis (ya no tiene atajo `Alt+E`)
- `Alt+E` / `Alt+C` — Corrector en euskera / en español (también `Ctrl+R e` / `Ctrl+R c`)
- `Ctrl+U` — minúsculas → MAYÚSCULAS → Título → minúsculas (sobre la selección o la palabra bajo el cursor)
- `Ctrl+Shift+8` (o `Ctrl+R` `n`) — Poner o quitar viñetas/lista en todas las líneas seleccionadas: si todas ya son viñeta (`- `, `* `, `+ `, `- [ ] `) o lista numerada (`1. `), se quitan; si no, se añade `- ` a las que no la tienen (sin tocar las líneas vacías). Está también en Editar
- `Ctrl+J` — Unir líneas · `Ctrl+D` / `Ctrl+Shift+K` — Eliminar línea · `Ctrl+L` — Seleccionar línea
- `Ctrl+↑` / `Ctrl+↓` — Inicio / final del archivo (en macOS, `Cmd+↑/↓`)
- `Ctrl+Shift+←` / `Ctrl+Shift+→` — Seleccionar palabra a palabra (no cambia de pestaña ni salta de párrafo; en macOS también con `Ctrl`, no con `Cmd`)
- `Alt+↑` / `Alt+↓` o `Ctrl+Shift+↑` / `Ctrl+Shift+↓` — Mover línea · `Alt+Shift+↑` / `Alt+Shift+↓` — Duplicar línea (en Mónaco y en texto plano; no añade cursor). Varios cursores: `Alt`+clic
- `Alt+X` — Unicode ↔ carácter
- `Ctrl+F` / `Ctrl+H` — Buscar / reemplazar · `F3` / `Shift+F3` — Siguiente / anterior
- `F1` o `Ctrl+Shift+P` — Paleta de comandos de Monaco
- `Enter` en una lista (`- `, `* `, `1. `, `- [ ] `) — Continúa la lista; si el elemento está vacío, la termina. Con el cursor antes de la viñeta (o dentro de ella) solo abre una línea vacía encima y la viñeta se queda en su línea

### Corrector ortográfico

- `Alt+L` (o `F6`) — Idioma: español → euskera → ninguno. La app arranca sin corrector y el idioma elegido se mantiene durante la sesión
- `Ctrl+R` y luego `z` — Activar/desactivar el corrector
- `F7` / `Shift+F7` — Error siguiente / anterior
- `F8` o `Alt+Intro` — Sugerencias para el error bajo el cursor, con opciones para añadir la palabra al diccionario (se guarda en el navegador) o ignorarla en la sesión

### Tecla líder: `Ctrl+R` (o `Ctrl+.`, o `F2`), luego una letra

Al pulsarla aparece un aviso en la barra de estado esperando la siguiente tecla (4 segundos de margen, o `Escape` para cancelar):

- `s` guardar · `a` guardar como · `y` exportar copia · `o` abrir carpeta · `b` abrir archivo del ordenador
- `p` buscar archivo · `h` home · `g` panel de GitHub · `x` cerrar carpeta/repositorio · `q` cerrar pestaña
- `f` buscar · `r` reemplazar · `k` insertar enlace · `u` lista de enlaces de la nota (el esquema sigue en `Ctrl+T`)
- `m` editor (Mónaco) · `v` vista previa · `t` texto plano
- `e` corrector en euskera · `c` corrector en español (fijan el idioma; para quitarlo, `Alt+L` o `z`)
- `d` eliminar línea · `j` unir líneas · `w` minúsculas/MAYÚSCULAS/Título (la paleta de comandos sigue en `F1` / `Ctrl+Shift+P`)
- `l` tema · `i` idioma del corrector · `z` corrector sí/no · `+` / `-` zoom
- `Espacio` o `Intro` abren el menú (Archivo) · `←` / `→` historial · `↑` / `↓` mover línea · `Tab` / `Shift+Tab` pestaña siguiente / anterior · `?` ayuda

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
- **Qué se abre solo:** con el campo vacío solo se abren repositorios **privados**, y nunca `bubipad`. Un repositorio público (o `bubipad`) solo se abre si lo escribes en el campo (`usuario/repositorio`) o si sigues un enlace a él desde una nota.
- **Orden de carga:** el repositorio **Notas** (el principal) se carga y se muestra siempre el primero, también cuando el token da acceso a más de seis (Notas nunca queda fuera del recorte). Se descarga nada más conectar, antes que cualquier otro, y la búsqueda de archivos (`Ctrl+O`) y «home» también recorren Notas primero.
- **Home:** se busca primero un archivo llamado exactamente `Home.md` (en cualquier repositorio, empezando por Notas); si no hay, el primero cuyo nombre empiece por «home» (`Home_ALEA.md`); si tampoco, cualquiera que contenga «home» en el nombre (`ALEA_Home.md`). A igualdad de criterio gana el más cercano a la raíz y, después, el repositorio Notas / el último usado. `Alt+H` sigue el mismo criterio.
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


## Menús y botones

La barra superior tiene los menús **Archivo, Editar, Ver, Ir, GIT, EU/ES y Ayuda**; todas las funciones están en ellos. Debajo quedan solo los botones más habituales: abrir GitHub, guardar, buscar archivo (icono de carpeta), mover línea (↑/↓), esquema del documento (icono de jerarquía), buscar, vista previa/edición, EU, ES y, al final, borrar línea. «Cerrar todas las pestañas» está en Archivo. El menú Ir ya no tiene «Atrás / Adelante en el historial» (los atajos siguen funcionando). Los archivos se abren en Mónaco; la vista previa y el texto plano se eligen desde Ver. Al abrir no se busca ningún archivo «home»: sin archivos abiertos se muestra el logotipo y cuatro enlaces (Archivo = buscar, Home = siempre en vista previa, GitHub y Salir). Desde la vista previa, los enlaces a otras notas las abren también en vista previa hasta que pases a edición (doble clic, menú Ver o chip ■/□). El menú Editar incluye Copiar, Cortar y Pegar; las operaciones con líneas están en Ir, tras «Ir a la línea». El corrector arranca desactivado; los botones ES y EU fijan cada idioma y el ciclo ES → EU → ninguno está en el menú EU/ES (y en `Alt+L`). Monaco no resalta corchetes, paréntesis ni otros elementos de código, y tampoco cierra solo corchetes, paréntesis, comillas ni otros pares.


## Autocorrección

BubiPad sustituye ciertos textos mientras escribes. Las sustituciones están en **`autocorrect.json`**, junto a `index.html`, con el formato de los snippets de VS Code. Para añadir o cambiar una, edita ese archivo en el repositorio de la app y súbelo (la app lo lee al arrancar; recarga la página tras cambiarlo).

```json
{
  "Guion largo": { "prefix": "--", "body": "—", "expand": "next" },
  "Comilla de apertura": { "prefix": "\"ii", "body": "“" },
  "Comilla de cierre": { "prefix": "\"dd", "body": "”" }
}
```

- `prefix` — lo que se escribe (una cadena, o una lista de cadenas para varios disparadores). No puede contener saltos de línea.
- `body` — lo que lo sustituye (una cadena, o una lista de líneas). `$0` marca dónde queda el cursor.
- `expand` (opcional) — `"type"` (por defecto): sustituye en cuanto se escribe el último carácter del `prefix`. `"next"`: espera a la tecla siguiente y solo sustituye si el `prefix` no forma parte de una serie más larga; por eso `--` da `—` pero `---` (línea horizontal, tablas, cabecera YAML) no se toca.
- `description` y cualquier otro campo se ignoran: sirven para anotar.
- Si hay varios `prefix` que encajan, gana el más largo.
- No se aplica dentro de bloques de código (` ``` `) ni de código en línea (`` ` ``).
- Cada sustitución es un paso de deshacer independiente: `Ctrl+Z` devuelve el texto tal como lo escribiste.
- Funciona en Mónaco y en texto plano. Si `autocorrect.json` no se puede leer o está mal formado, se usan las tres sustituciones de arriba.
