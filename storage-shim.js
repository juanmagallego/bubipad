// Polyfill mínimo de chrome.storage.local (API de extensiones) basado en
// localStorage, para que BubiPad funcione igual como PWA independiente.
// Si en algún momento se vuelve a cargar como extensión de Chrome, este
// polyfill no hace nada (se respeta la API nativa).
(function () {
  if (typeof window.chrome === "undefined") window.chrome = {};
  if (!window.chrome.storage) window.chrome.storage = {};
  if (window.chrome.storage.local) return; // ya existe (contexto de extensión)

  var PREFIX = "bp_";

  function readKey(key) {
    var raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return undefined;
    }
  }

  function readAll() {
    var out = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf(PREFIX) === 0) {
        var val = readKey(k.slice(PREFIX.length));
        if (val !== undefined) out[k.slice(PREFIX.length)] = val;
      }
    }
    return out;
  }

  window.chrome.storage.local = {
    get: function (keys, callback) {
      var result = {};
      if (keys == null) {
        result = readAll();
      } else if (Array.isArray(keys)) {
        keys.forEach(function (k) {
          var v = readKey(k);
          if (v !== undefined) result[k] = v;
        });
      } else if (typeof keys === "string") {
        var v = readKey(keys);
        if (v !== undefined) result[keys] = v;
      } else if (typeof keys === "object") {
        Object.keys(keys).forEach(function (k) {
          var v = readKey(k);
          result[k] = v !== undefined ? v : keys[k];
        });
      }
      setTimeout(function () {
        callback && callback(result);
      }, 0);
    },
    set: function (items, callback) {
      Object.keys(items).forEach(function (k) {
        localStorage.setItem(PREFIX + k, JSON.stringify(items[k]));
      });
      setTimeout(function () {
        callback && callback();
      }, 0);
    },
    remove: function (keys, callback) {
      (Array.isArray(keys) ? keys : [keys]).forEach(function (k) {
        localStorage.removeItem(PREFIX + k);
      });
      setTimeout(function () {
        callback && callback();
      }, 0);
    },
  };
})();
