// Registro del service worker (fuera de index.html: la CSP no permite scripts en línea).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((reg) => {
      // Buscar actualizaciones al arrancar y cada 15 minutos.
      reg.update().catch(() => {});
      setInterval(() => reg.update().catch(() => {}), 15 * 60 * 1000);

      reg.addEventListener("updatefound", () => {
        const nuevo = reg.installing;
        if (!nuevo) return;
        nuevo.addEventListener("statechange", () => {
          // Solo avisar si ya había una versión previa controlando la página.
          if (nuevo.state === "installed" && navigator.serviceWorker.controller) {
            mostrarAvisoActualizacion();
          }
        });
      });
    }).catch(console.error);
  });
}

function mostrarAvisoActualizacion() {
  if (document.getElementById("update-banner")) return;
  const aviso = document.createElement("div");
  aviso.id = "update-banner";
  aviso.innerHTML =
    '<span>Hay una versión nueva de BubiPad.</span>' +
    '<button type="button" id="update-reload-btn">Recargar</button>' +
    '<button type="button" id="update-dismiss-btn" aria-label="Descartar">✕</button>';
  document.body.appendChild(aviso);
  document.getElementById("update-reload-btn").addEventListener("click", () => {
    location.reload();
  });
  document.getElementById("update-dismiss-btn").addEventListener("click", () => {
    aviso.remove();
  });
}
