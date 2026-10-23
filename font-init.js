// Lista de fuentes que alterna el botón «Aa» de la barra de herramientas,
// y aplicación temprana de la elegida la última vez (antes de que arranque
// el editor, para que no haya parpadeo de fuente al abrir).
// Cada nombre tiene que coincidir con un bloque @font-face de fonts.css.
// El primero es la fuente por defecto.
(function () {
  window.BP_FONTS = ["Courier Prime", "Roboto Mono", "Nanotype Mono"];
  try {
    var raw = localStorage.getItem("bp_notepad_mono_font");
    var name = raw ? JSON.parse(raw) : null;
    if (name && window.BP_FONTS.indexOf(name) > -1) {
      document.documentElement.style.setProperty("--app-mono-font", '"' + name + '"');
    }
  } catch (e) {}
})();
