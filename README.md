## Atajos de teclado
 
En todos los casos, `Ctrl` equivale a `Cmd` en macOS.
 
### Atajos directos
 
- `Ctrl+S` — Guardar
- `Ctrl+Shift+S` — Guardar como
- `Ctrl+O` — Abrir carpeta *(requiere que Monaco tenga el foco)*
- `Ctrl+Shift+O` — Abrir archivo del ordenador
- `Ctrl+Shift+A` — Nueva nota
- `Ctrl+Shift+F` — Mostrar/ocultar el explorador (barra lateral)
- `Ctrl+E` — Alternar entre editor Monaco y vista previa
- `Ctrl+P` — Buscar y abrir archivo por nombre
- `Ctrl+H` — Abrir el archivo "home" del repositorio/carpeta
- `Ctrl+K` — Insertar enlace (usa el portapapeles como URL si hay algo copiado)
- `Ctrl+Shift+D` — Eliminar línea
- `Ctrl+Shift+M` — Esquema de títulos del documento
- `Ctrl+Shift+X` — Cerrar la pestaña actual
- `Ctrl+L` — Alternar tema claro/oscuro
- `Ctrl+Tab` / `Ctrl+Shift+Tab` — Pestaña siguiente / anterior *(puede no llegar a la app si el navegador lo reserva para sus propias pestañas; funciona de forma fiable vía la tecla líder, ver abajo)*
- `Ctrl+B` — Negrita *(Monaco)*
- `Ctrl+I` — Cursiva *(Monaco)*
- `Ctrl+J` — Unir líneas *(Monaco)*
- `Ctrl+U` — minúsculas sobre la selección *(Monaco)*
- `Ctrl+Shift+U` — MAYÚSCULAS sobre la selección *(Monaco)*
- `Ctrl+Shift+G` — Aumentar tamaño de letra
- `Ctrl+Shift+P` — Reducir tamaño de letra
- `Alt+↑` / `Alt+↓` — Mover línea arriba/abajo *(Monaco)*
- `F1` — Paleta de comandos de Monaco *(también disponible como botón, para táctil)*
- `Enter` en una lista (`- `, `* `, `1. `, `- [ ] `) — Continúa la lista en la línea siguiente; si el elemento está vacío, la termina *(Monaco y modo texto)*
### Tecla líder: `Ctrl+.` (Ctrl + punto), luego una letra
 
Al pulsar `Ctrl+.` aparece un aviso en la barra de estado esperando la siguiente tecla (4 segundos de margen, o `Escape` para cancelar):
 
- `s` — Guardar
- `a` — Guardar como
- `n` — Nueva nota
- `o` — Abrir carpeta
- `b` — Abrir archivo del ordenador
- `g` — Conectar/abrir panel de GitHub
- `p` — Buscar y abrir archivo por nombre
- `h` — Abrir "home"
- `f` — Buscar en el documento
- `k` — Insertar enlace
- `m` — Esquema de títulos
- `d` — Eliminar línea
- `c` — Paleta de comandos de Monaco
- `x` — Cerrar repositorio/carpeta
- `l` — Alternar tema claro/oscuro
- `e` — Cambiar a modo editor (Monaco)
- `v` — Cambiar a modo vista previa
- `t` — Cambiar a modo texto
- `i` — Alternar idioma del corrector (EU/ES)
- `w` — Alternar MAYÚSCULAS/minúsculas sobre la selección
- `q` — Cerrar la pestaña actual
- `j` — Unir líneas
- `Tab` — Pestaña siguiente
- `Shift+Tab` — Pestaña anterior
### Notas sobre atajos reservados por el navegador
 
Algunas combinaciones (`Ctrl+P`, `Ctrl+K`, `Ctrl+H`, `Ctrl+Shift+O`, `Ctrl+Tab`, `Ctrl+L`...) coinciden con atajos que los navegadores reservan para sí mismos (imprimir, historial, barra de direcciones, cambio de pestaña del navegador, etc.). En esos casos la tecla puede no llegar nunca a la aplicación si se usa dentro de una pestaña normal del navegador. Dos formas de evitarlo:
 
- Instalar BubiPad como aplicación web (sin barra de navegador ni pestañas), donde estas combinaciones quedan libres.
- Usar siempre la tecla líder (`Ctrl+.`), que no coincide con ningún atajo reservado conocido y ofrece una alternativa fiable para prácticamente todas las acciones.
 


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
