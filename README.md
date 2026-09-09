# Aplicación

[https://juanmagallego.github.io/bubipad/](https://juanmagallego.github.io/bubipad/)

# ATAJOS

Directos (Monaco con foco)

- Ctrl+S — guardar
- Ctrl+O — abrir carpeta
- Ctrl+B — negrita
- Ctrl+I — cursiva
- Ctrl+J — unir líneas
- Ctrl+U — minúsculas (selección)
- Ctrl+Shift+U — MAYÚSCULAS (selección)
- Ctrl+Shift+G — aumentar tamaño de letra
- Ctrl+Shift+P — reducir tamaño de letra


Ctrl+Shift+X (atajo normal)



A nivel de documento (funcionan sin importar el foco)

- Ctrl+E — alternar Monaco / vista previa
- Ctrl+K — insertar enlace
- Ctrl+H — abrir "home"
- Ctrl+P — buscar y abrir archivo por nombre
- Ctrl+Shift+D — eliminar línea
- Ctrl+Shift+M — esquema de títulos
- Ctrl+Shift+A — nueva nota
- Ctrl+Shift+O — abrir archivo del ordenador
- Ctrl+Shift+S — guardar como
- Ctrl+Shift+F — alternar barra lateral
- Ctrl+Shift+X - cerrar pestaña
- Alt+↑ / Alt+↓ — mover línea arriba/abajo (dentro de Monaco

- Ctrl+. / Cmd+., s   → guardar
- Ctrl+. / Cmd+., a   → guardar como
- Ctrl+. / Cmd+., n   → nueva nota
- Ctrl+. / Cmd+., o   → abrir carpeta
- Ctrl+. / Cmd+., f   → abrir archivo del ordenador
- Ctrl+. / Cmd+., g   → conectar/abrir panel de GitHub
- Ctrl+. / Cmd+., p   → buscar y abrir archivo por nombre
- Ctrl+. / Cmd+., h   → abrir "home"
- Ctrl+. / Cmd+., b   → buscar en el documento
- Ctrl+. / Cmd+., k   → insertar enlace
- Ctrl+. / Cmd+., m   → esquema de títulos
- Ctrl+. / Cmd+., d   → eliminar línea
- Ctrl+. / Cmd+., c   → paleta de comandos de Monaco (F1)
- Ctrl+. / Cmd+., x   → cerrar repositorio/carpeta
- Ctrl+. / Cmd+., l   → alternar barra lateral
- Ctrl+. / Cmd+., e / v / t → modo edición / vista previa / texto
- Ctrl+. / Cmd+., u   → alternar tema claro/oscuro
- Ctrl+. / Cmd+., i   → alternar idioma EU/ES
- Ctrl+. / Cmd+., w   → alternar MAYÚSCULAS/minúsculas (sobre la selección)
- Ctrl+. / Cmd+., q cerrar pestaña


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
