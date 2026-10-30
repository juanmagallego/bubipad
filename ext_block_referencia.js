/* ------------------------------------------------------------------ */
/* Coherencia con la versión de terminal (atajos y mejoras adaptadas)   */
/* ------------------------------------------------------------------ */
// Resumen de decisiones:
//  - Se usa e.code (posición física de la tecla) para las combinaciones con
//    Alt, porque con Alt/Opción muchos teclados producen otro carácter.
//  - En macOS no se capturan las combinaciones Alt+letra (Opción+letra escribe
//    caracteres y acentos); ahí valen la tecla líder (Ctrl+.) y el resto.
//  - Ctrl equivale a Cmd en macOS (igual que en el resto de la app).
const bpIsMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
var bpLastEditMode, bpNavBack, bpNavFwd, bpNavBusy, bpUserWordSet, bpIgnoredWordSet;

/* --- Alternar vista previa <-> edición (chip de la barra de estado) ---- */

function bpToggleMode() {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  if (lp === "preview") nB(bpEditMode());
  else nB("preview");
}

function bpUpdateModeChip() {
  const chip = document.getElementById("mode-chip");
  if (!chip) return;
  const preview = lp === "preview";
  chip.style.display = sp() ? "inline-flex" : "none";
  chip.textContent = preview ? "■" : "□";            // ■ vista previa · □ edición
  chip.classList.toggle("preview", preview);
  chip.setAttribute("aria-pressed", preview ? "true" : "false");
  const label = document.getElementById("repo-label");
  if (label) {
    const t = sp(), h = t && t.handle;
    const gh = !!(h && h.__gh && h.repo);
    label.textContent = gh ? h.repo : "";
    label.title = gh ? `${h.owner}/${h.repo} (${h.branch})` : "";
    label.style.display = gh ? "inline-block" : "none";
  }
}
document.getElementById("mode-chip")?.addEventListener("click", bpToggleMode);
bpUpdateModeChip();

/* --- Utilidades de edición que funcionan en Monaco y en texto plano ---- */

function bpNeedMonaco(fn) {
  if (lp !== "edit") nB("edit");
  requestAnimationFrame(() => { Nt.layout(); Nt.focus(); fn(); });
}

function bpDeleteLine() {
  if (lp === "preview" || !sp()) return;
  if (lp === "text") bpDeleteTextLine();
  else { Nt.getAction("editor.action.deleteLines")?.run(); Nt.focus(); }
}

function bpMoveLine(dir) {
  if (lp === "preview" || !sp()) return;
  if (lp === "text") bpMoveTextLine(dir);
  else { Nt.getAction(dir < 0 ? "editor.action.moveLinesUpAction" : "editor.action.moveLinesDownAction")?.run(); Nt.focus(); }
}

function bpDuplicateLine(dir) {
  if (lp === "preview" || !sp()) return;
  if (lp === "edit") {
    Nt.getAction(dir < 0 ? "editor.action.copyLinesUpAction" : "editor.action.copyLinesDownAction")?.run();
    Nt.focus();
    return;
  }
  const ta = Xtv, v = ta.value, s0 = ta.selectionStart, e0 = ta.selectionEnd;
  const ls0 = v.lastIndexOf("\n", s0 - 1) + 1;
  let le = v.indexOf("\n", e0); if (le === -1) le = v.length;
  const block = v.slice(ls0, le), len = block.length + 1;
  ta.value = v.slice(0, le) + "\n" + block + v.slice(le);
  const shift = dir > 0 ? len : 0;
  ta.selectionStart = s0 + shift; ta.selectionEnd = e0 + shift;
  ta.focus(); bpTextToModel();
}

function bpSelectLine() {
  if (lp === "text") {
    const ta = Xtv, v = ta.value, s = v.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    let e = v.indexOf("\n", ta.selectionEnd); e = e === -1 ? v.length : e + 1;
    ta.setSelectionRange(s, e); ta.focus();
    sy(v, v.slice(s, e));
  } else if (lp === "edit") {
    Nt.trigger("kb", "expandLineSelection", null); Nt.focus();
  }
}

function bpDocEdge(end) {                                      // Ctrl+↑ / Ctrl+↓ (como en la terminal)
  if (lp === "text") { const n = end ? Xtv.value.length : 0; Xtv.setSelectionRange(n, n); Xtv.focus(); }
  else if (lp === "edit") { Nt.trigger("kb", end ? "cursorBottom" : "cursorTop", null); Nt.focus(); }
}

function bpItalic() {
  bpWrap("*", "*", "texto en cursiva");
}

function bpEmojiPicker() {                                     // Alt+E: abre el selector escribiendo ":"
  bpNeedMonaco(() => {
    const pos = Nt.getPosition(), model = Nt.getModel();
    if (!pos || !model) return;
    const before = model.getLineContent(pos.lineNumber).slice(0, pos.column - 1);
    const needSpace = before.length > 0 && !/[\s([{]$/.test(before);
    Nt.trigger("kb", "type", { text: (needSpace ? " " : "") + ":" });
  });
}

function bpZoom(dir) {
  dir > 0 ? Lae() : xae();
  xo("Zoom " + Math.round(Cu * 100) + " %");
}

/* --- Mayúsculas / minúsculas / Título (Ctrl+U), igual que en la terminal --- */

const BP_MINOR = new Set(["a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "lo", "los", "o", "por",
  "para", "sin", "u", "un", "una", "y", "eta", "edo", "ere", "baina", "an", "and", "of", "or", "the", "to", "in", "on"]);

function bpTitleCase(text) {
  let first = true;
  return text.replace(/[\p{L}\p{M}]+(?:['’][\p{L}\p{M}]+)*/gu, m => {
    const w = m.toLowerCase();
    const out = (!first && BP_MINOR.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    first = false;
    return out;
  });
}

// minúsculas → MAYÚSCULAS → Título → minúsculas (lo mixto pasa a MAYÚSCULAS)
function bpCycleCase(text) {
  const cands = { upper: text.toUpperCase(), title: bpTitleCase(text), lower: text.toLowerCase() };
  const order = ["upper", "title", "lower"];
  const idx = order.findIndex(k => cands[k] === text);
  for (let step = 1; step <= 3; step++) {
    const k = order[(((idx === -1 ? -1 : idx) + step) % 3 + 3) % 3];
    if (cands[k] !== text) return cands[k];
  }
  return text;
}

function bpApplyCaseCycle(fn = bpCycleCase) {
  if (!sp()) return;
  if (lp === "preview") { xo("Pulsa Ctrl+E para editar"); return; }
  if (lp === "text") {
    const ta = Xtv, v = ta.value;
    let s = ta.selectionStart, e = ta.selectionEnd, keepSel = s !== e;
    const caret = s;
    if (!keepSel) {
      const isW = ch => /[\p{L}\p{M}]/u.test(ch);
      while (s > 0 && isW(v[s - 1])) s--;
      while (e < v.length && isW(v[e])) e++;
      if (s === e) { xo("No hay ninguna palabra bajo el cursor."); return; }
    }
    const next = fn(v.slice(s, e));
    ta.value = v.slice(0, s) + next + v.slice(e);
    if (keepSel) ta.setSelectionRange(s, s + next.length); else ta.setSelectionRange(caret, caret);
    ta.focus(); bpTextToModel();
    return;
  }
  const model = Nt.getModel();
  if (!model) return;
  const sel = Nt.getSelection();
  if (sel && !sel.isEmpty()) {
    const text = model.getValueInRange(sel), next = fn(text);
    if (next === text) return;
    const startOffset = model.getOffsetAt(sel.getStartPosition());
    Nt.executeEdits("case-cycle", [{ range: sel, text: next }]);
    const m2 = Nt.getModel(), a = m2.getPositionAt(startOffset), b = m2.getPositionAt(startOffset + next.length);
    Nt.setSelection(new DF(a.lineNumber, a.column, b.lineNumber, b.column));
  } else {
    const pos = Nt.getPosition(), w = pos && model.getWordAtPosition(pos);
    if (!w) { xo("No hay ninguna palabra bajo el cursor."); return; }
    const range = new lb.Range(pos.lineNumber, w.startColumn, pos.lineNumber, w.endColumn);
    const text = model.getValueInRange(range), next = fn(text);
    if (next !== text) { Nt.executeEdits("case-cycle", [{ range, text: next }]); Nt.setPosition(pos); }
  }
  Nt.focus();
}

/* --- Historial atrás / adelante entre pestañas (Alt+Mayús+←/→) ---------- */

function bpHistPush(prevId, newId) {
  if (bpNavBusy || !prevId || prevId === newId) return;
  (bpNavBack = bpNavBack || []).push(prevId);
  if (bpNavBack.length > 100) bpNavBack.shift();
  bpNavFwd = [];
}

function bpNavGo(dir) {
  bpNavBack = bpNavBack || []; bpNavFwd = bpNavFwd || [];
  const from = dir < 0 ? bpNavBack : bpNavFwd, to = dir < 0 ? bpNavFwd : bpNavBack;
  while (from.length) {
    const id = from.pop();
    if (ta.some(t => t.id === id)) {
      to.push(Jb);
      bpNavBusy = true;
      try { Yb(id); } finally { bpNavBusy = false; }
      return;
    }
  }
  xo(dir < 0 ? "No hay nada más atrás en el historial" : "No hay nada más adelante en el historial");
}

function bpGotoNthTab(n) {
  if (!ta.length) return;
  const t = n >= 9 ? ta[ta.length - 1] : ta[n - 1];
  if (t) Yb(t.id); else xo("No hay pestaña " + n);
}

/* --- Esquema en vista previa: salta al título sin cambiar de modo ------- */

function bpOutlineScrollPreview(line) {
  const lines = jb().replace(/\r\n?/g, "\n").split("\n");
  const counts = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (!m) continue;
    const slug = bpSlugify(m[2]), n = counts.get(slug) || 0;
    counts.set(slug, n + 1);
    if (i + 1 === line) { bpScrollToHeading(n === 0 ? slug : slug + "-" + n); return; }
  }
}

/* --- Lista emergente genérica (sugerencias, enlaces…) ---------------------- */

var bpListEl = null, bpListState = null;

function bpHideList() {
  if (bpListEl) bpListEl.style.display = "none";
  bpListState = null;
}

function bpListPick(i) {
  const st = bpListState;
  if (!st || !st.items[i]) return;
  bpHideList();
  try { st.items[i].run(); } catch (e) { xo("⚠ " + e.message); }
}

function bpListRender() {
  const st = bpListState;
  bpListEl.innerHTML = "";
  const head = document.createElement("div");
  head.className = "bp-list-title"; head.textContent = st.title;
  bpListEl.appendChild(head);
  st.items.forEach((it, i) => {
    const row = document.createElement("div");
    row.className = "bp-list-item" + (i === st.index ? " active" : "");
    const n = document.createElement("span");
    n.className = "bp-list-num"; n.textContent = i < 9 ? String(i + 1) : "";
    const label = document.createElement("span");
    label.className = "bp-list-label"; label.textContent = it.label;
    row.append(n, label);
    if (it.hint) {
      const h = document.createElement("span");
      h.className = "bp-list-hint"; h.textContent = it.hint;
      row.appendChild(h);
    }
    row.addEventListener("mousedown", ev => { ev.preventDefault(); bpListPick(i); });
    bpListEl.appendChild(row);
  });
}

function bpShowList(title, items, atCursor) {
  if (!items.length) { xo("Nada que mostrar"); return; }
  if (!bpListEl) {
    bpListEl = document.createElement("div");
    bpListEl.id = "bp-list-popup";
    document.body.appendChild(bpListEl);
  }
  bpListState = { title, items, index: 0 };
  bpListRender();
  bpListEl.style.display = "block";
  let top = 64, left = Math.max(8, (window.innerWidth - bpListEl.offsetWidth) / 2);
  if (atCursor && lp === "edit") {
    const pos = Nt.getPosition(), vis = pos && Nt.getScrolledVisiblePosition(pos);
    const box = Nt.getDomNode().getBoundingClientRect();
    if (vis) {
      top = box.top + vis.top + vis.height + 4;
      left = Math.min(box.left + vis.left, window.innerWidth - bpListEl.offsetWidth - 8);
      if (top + bpListEl.offsetHeight > window.innerHeight - 8) top = Math.max(8, box.top + vis.top - bpListEl.offsetHeight - 4);
    }
  }
  bpListEl.style.top = top + "px";
  bpListEl.style.left = Math.max(8, left) + "px";
}

document.addEventListener("mousedown", o => {
  if (bpListState && bpListEl && !bpListEl.contains(o.target)) bpHideList();
});

/* --- Corrector: F7 / Mayús+F7 error siguiente/anterior, F8 sugerencias -- */

bpUserWordSet = bpUserWordSet || new Set();
bpIgnoredWordSet = bpIgnoredWordSet || new Set();
chrome.storage.local.get(["bp_user_words"], r => {
  for (const w of (r && r.bp_user_words) || []) bpUserWordSet.add(String(w).toLowerCase());
  try { if (Ap) { ey.clear(); U0e(); } } catch (e) {}
});

function bpSpellRanges() {
  if (!u2 || !Nt.getModel()) return [];
  return u2.getRanges().slice().sort((a, b) => a.startLineNumber - b.startLineNumber || a.startColumn - b.startColumn);
}

function bpSpellAt(pos) {
  return bpSpellRanges().find(r => r.startLineNumber === pos.lineNumber && pos.column >= r.startColumn && pos.column <= r.endColumn) || null;
}

function bpSpellJump(dir) {
  if (!p2()) { xo("Activa el corrector (ES o EU) para buscar errores"); return; }
  bpNeedMonaco(() => {
    const rs = bpSpellRanges();
    if (!rs.length) { xo("Sin errores ortográficos"); return; }
    const pos = Nt.getPosition(), cur = bpSpellAt(pos);
    const ref = cur ? { l: cur.startLineNumber, c: cur.startColumn } : { l: pos.lineNumber, c: pos.column };
    const after = r => r.startLineNumber > ref.l || (r.startLineNumber === ref.l && r.startColumn > ref.c);
    const before = r => r.startLineNumber < ref.l || (r.startLineNumber === ref.l && r.startColumn < ref.c);
    const target = dir > 0 ? (rs.find(after) || rs[0]) : ([...rs].reverse().find(before) || rs[rs.length - 1]);
    Nt.setSelection(target);
    Nt.revealRangeInCenter(target);
    xo("Error ortográfico: «" + Nt.getModel().getValueInRange(target) + "» (F8: sugerencias)");
  });
}

function bpSpellSuggest() {
  if (!p2() || !Ap) { xo("Activa el corrector (ES o EU) para ver sugerencias"); return; }
  bpNeedMonaco(() => {
    const pos = Nt.getPosition(), range = pos && bpSpellAt(pos);
    if (!range) { xo("No hay error ortográfico bajo el cursor (F7: ir al siguiente)"); return; }
    const word = Nt.getModel().getValueInRange(range);
    let sugg = [];
    try { sugg = Ap.suggest(word).slice(0, 8); } catch (e) {}
    const items = sugg.map(s => ({
      label: s,
      run: () => { Nt.executeEdits("spell-fix", [{ range, text: s }]); Nt.focus(); }
    }));
    items.push({
      label: "Añadir «" + word + "» al diccionario", hint: "guarda",
      run: () => {
        const w = word.toLowerCase();
        bpUserWordSet.add(w);
        chrome.storage.local.set({ bp_user_words: [...bpUserWordSet] });
        ey.clear(); U0e(); Nt.focus();
        xo("«" + word + "» añadida al diccionario");
      }
    });
    items.push({
      label: "Ignorar «" + word + "»", hint: "esta sesión",
      run: () => { bpIgnoredWordSet.add(word.toLowerCase()); ey.clear(); U0e(); Nt.focus(); }
    });
    bpShowList(sugg.length ? "Sugerencias para «" + word + "»" : "Sin sugerencias para «" + word + "»", items, true);
  });
}

/* --- Enlaces: F4 abre el de la posición del cursor; Ctrl+., u lista los de la nota --- */

const BP_LINK_RE = /\[\[([^\]]+)\]\]|!?\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()\]]+)/g;

function bpParseLinks(line) {
  const out = [];
  BP_LINK_RE.lastIndex = 0;
  let m;
  while ((m = BP_LINK_RE.exec(line))) {
    if (m[0].startsWith("![")) continue;                       // las imágenes no son enlaces de navegación
    const r = { start: m.index, end: m.index + m[0].length };
    if (m[1] !== undefined) { const parts = m[1].split("|"); r.kind = "wiki"; r.target = parts[0].trim(); r.label = (parts[1] || parts[0]).trim(); }
    else if (m[3] !== undefined) { r.kind = /^https?:/i.test(m[3]) ? "web" : "internal"; r.target = m[3]; r.label = m[2] || m[3]; }
    else { r.kind = "web"; r.target = m[4] || m[5]; r.label = r.target; }
    out.push(r);
  }
  return out;
}

async function bpFollowLink(link) {
  if (link.kind === "web") { if (bpGhLinkInApp(link.target)) { await bpOpenGhLinkInApp(link.target); return; } window.open(link.target, "_blank", "noopener,noreferrer"); return; }
  const { path, anchor } = bpSplitAnchor(link.target);
  if (link.kind === "wiki") {
    if (path === "") bpScrollToHeading(anchor); else { await bpOpenWikilink(path); bpScrollToHeading(anchor); }
  } else {
    if (path === "") bpScrollToHeading(anchor); else { await bpOpenInternalPath(path); bpScrollToHeading(anchor); }
  }
}

function bpOpenLinkAtCursor() {
  if (lp !== "edit") { xo("Pulsa Ctrl+E para editar y colocar el cursor sobre un enlace"); return; }
  const pos = Nt.getPosition(), model = Nt.getModel();
  if (!pos || !model) return;
  const links = bpParseLinks(model.getLineContent(pos.lineNumber));
  const link = links.find(l => pos.column - 1 >= l.start && pos.column - 1 <= l.end);
  if (!link) { xo("No hay ningún enlace bajo el cursor"); return; }
  bpFollowLink(link).catch(e => xo("⚠ " + e.message));
}

function bpShowLinksList() {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  const links = [];
  jb().replace(/\r\n?/g, "\n").split("\n").forEach(line => links.push(...bpParseLinks(line)));
  if (!links.length) { xo("La nota no tiene enlaces"); return; }
  bpShowList("Enlaces de la nota", links.slice(0, 60).map(l => ({
    label: l.label, hint: l.kind === "web" ? l.target.replace(/^https?:\/\//, "") : l.target,
    run: () => bpFollowLink(l).catch(e => xo("⚠ " + e.message))
  })), false);
}

/* --- Pantalla de ayuda con todos los atajos ---------------------------- */

function bpHelpHTML() {
  const c = bpIsMac ? "Cmd" : "Ctrl";
  const sec = (title, rows) => `<h3>${title}</h3><table>` + rows.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join("") + "</table>";
  return `<div class="bp-help-head"><strong>Atajos de teclado</strong><button type="button" id="help-close-btn" aria-label="Cerrar">✕</button></div>
<p class="bp-help-note">${c} equivale a Cmd en macOS. Los mismos atajos que la versión de terminal, salvo los que reserva el navegador (ahí vale la tecla líder). Todo lo que hay aquí también está en los menús.</p>` +
    sec("Archivos y navegación", [
      [c + "+S", "Guardar"], [c + "+Shift+S", "Guardar como (el archivo pasa a guardarse en el destino elegido)"],
      ["Ctrl+R, y", "Exportar copia: guarda una copia en otro sitio sin cambiar el destino (un archivo de GitHub sigue en GitHub)"],
      [c + "+O", "Buscar archivo por nombre"], ["Alt+O / " + c + "+Shift+O", "Abrir archivo del ordenador"],
      [c + "+P / F9 / " + c + "+Shift+F", "Mostrar u ocultar el explorador"], ["Alt+H", "Abrir el archivo «home»"],
      [c + "+W / " + c + "+Shift+X", "Cerrar pestaña"], [c + "+T / " + c + "+Shift+M", "Esquema del documento"],
      ["Alt+R", "Panel de GitHub"], ["F4", "Abrir el enlace bajo el cursor"]]) +
    sec("Pestañas e historial", [
      ["Alt+PgUp / Alt+PgDn", "Pestaña anterior / siguiente"], ["Alt+← / Alt+→", "Lo mismo (no en macOS)"],
      ["Alt+1 … Alt+8 / Alt+9", "Ir a esa pestaña / a la última"], ["Alt+Mayús+← / →", "Atrás / adelante en el historial"],
      ["Backspace (vista previa)", "Atrás en el historial"]]) +
    sec("Vista", [
      [c + "+E", "Vista previa ↔ texto plano (también el chip ■/□ de la barra de estado)"],
      ["Ctrl+R, l", "Tema claro / oscuro"], ["Alt+= / Alt+−", "Zoom + / −"], ["e (vista previa)", "Editar"]]) +
    sec("Edición", [
      [c + "+B", "Negrita"], [c + "+I / Alt+I", "Cursiva"], [c + "+K", "Insertar enlace (usa el portapapeles)"],
      ["Alt+E o «:»", "Selector de emojis"], [c + "+U", "minúsculas → MAYÚSCULAS → Título"],
      [c + "+J", "Unir líneas"], [c + "+D / " + c + "+Shift+K", "Eliminar línea"],
      [c + "+L", "Seleccionar línea"], [c + "+↑ / " + c + "+↓", "Inicio / final del archivo"],
      ["Alt+↑/↓ o " + c + "+Shift+↑/↓", "Mover línea"], ["Alt+Mayús+↑/↓", "Duplicar línea"],
      ["Alt+X", "Unicode ↔ carácter"], [c + "+F / " + c + "+H", "Buscar / reemplazar"], ["F3 / Mayús+F3", "Resultado siguiente / anterior"],
      ["F1 o " + c + "+Shift+P", "Paleta de comandos"],
      [c + "+C / " + c + "+X / " + c + "+V", "Copiar / cortar / pegar (también en Editar)"]]) +
    sec("Corrector ortográfico", [
      ["Alt+L / F6 / botón ES·EU·--", "Idioma: español → euskera → ninguno"], ["Ctrl+R, z", "Activar / desactivar el corrector"], ["F7 / Mayús+F7", "Error siguiente / anterior"],
      ["F8 o Alt+Intro", "Sugerencias, añadir al diccionario o ignorar"]]) +
    sec("Tecla líder: Ctrl+R (o " + c + "+. o F2) y luego una letra", [
      ["s a y o b", "guardar · guardar como · exportar · carpeta · archivo del ordenador"],
      ["p h g x q", "buscar archivo · home · GitHub · cerrar carpeta · cerrar pestaña"],
      ["f r k u", "buscar · reemplazar · enlace · lista de enlaces"],
      ["m v t", "editor (Mónaco) · vista previa · texto plano"], ["e c", "corrector: euskera · español"],
      ["d j w", "borrar línea · unir · Mayús/minús/Título"],
      ["l i + −", "tema · idioma del corrector · zoom"], ["← → ↑ ↓", "historial · mover línea"],
      ["Tab / Mayús+Tab", "pestaña siguiente / anterior"], ["?", "esta ayuda"]]);
}

function bpToggleHelp() {
  let el = document.getElementById("help-popup");
  if (!el) {
    el = document.createElement("div");
    el.id = "help-popup";
    document.body.appendChild(el);
    el.addEventListener("click", ev => { if (ev.target === el || ev.target.id === "help-close-btn") el.style.display = "none"; });
  }
  if (el.style.display === "block") { el.style.display = "none"; return; }
  el.innerHTML = '<div class="bp-help-card">' + bpHelpHTML() + "</div>";
  el.style.display = "block";
}
document.getElementById("help-btn")?.addEventListener("click", bpToggleHelp);

/* --- Tecla líder: F2 y nuevas letras ---------------------------------- */

function bpLeaderBegin() {
  bpLeaderActive = true;
  xo(bpLeaderHint);
  clearTimeout(bpLeaderTimer);
  bpLeaderTimer = setTimeout(() => { bpLeaderActive = false; xo("Listo"); }, 4000);
}

bpLeaderActions.r = () => bpNeedMonaco(() => Nt.getAction("editor.action.startFindReplaceAction")?.run());
bpLeaderActions.u = () => bpShowLinksList();
bpLeaderActions["+"] = bpLeaderActions["="] = () => bpZoom(1);
bpLeaderActions["-"] = () => bpZoom(-1);
bpLeaderActions.arrowleft = () => bpNavGo(-1);
bpLeaderActions.arrowright = () => bpNavGo(1);
bpLeaderActions.arrowup = () => bpMoveLine(-1);
bpLeaderActions.arrowdown = () => bpMoveLine(1);
bpLeaderActions["?"] = () => bpToggleHelp();
bpLeaderActions.w = () => bpApplyCaseCycle();
bpLeaderActions.z = () => { const cur = p2(); return bpToggleDict(cur || "es_ES"); };

/* --- Manejador único de atajos (fase de captura) ----------------------- */

function bpInEditorTarget(t) {
  return !!(t && ((t.closest && t.closest("#editor")) || t.id === "text-view" || t === document.body || t === document.documentElement));
}

function bpIsEditableTarget(t) {
  return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
}

function bpCloseOpenPopups() {
  let closed = false;
  if (bpMenuIsOpen()) { bpMenuClose(); closed = true; }
  for (const id of ["outline-popup", "github-popup", "lang-popup", "help-popup"]) {
    const el = document.getElementById(id);
    if (el && el.style.display === "block") { el.style.display = "none"; closed = true; }
  }
  if (bpListState) { bpHideList(); closed = true; }
  return closed;
}

function bpKeyHandler(e) {
  if (e.defaultPrevented || e.isComposing) return;
  const key = e.key, code = e.code;
  const done = fn => { e.preventDefault(); e.stopPropagation(); fn(); };

  // Lista emergente abierta: teclas propias
  if (bpListState && bpListEl && bpListEl.style.display !== "none") {
    const st = bpListState, n = st.items.length;
    if (key === "ArrowDown") { done(() => { st.index = (st.index + 1) % n; bpListRender(); }); return; }
    if (key === "ArrowUp") { done(() => { st.index = (st.index - 1 + n) % n; bpListRender(); }); return; }
    if (key === "Enter" || key === "Tab") { done(() => bpListPick(st.index)); return; }
    if (key === "Escape") { done(bpHideList); return; }
    if (/^[1-9]$/.test(key) && !e.ctrlKey && !e.metaKey && !e.altKey && st.items[+key - 1]) { done(() => bpListPick(+key - 1)); return; }
    bpHideList();
  }

  if (key === "Escape") { if (bpCloseOpenPopups()) { e.preventDefault(); e.stopPropagation(); } return; }

  const mod = e.ctrlKey || e.metaKey, alt = e.altKey, shift = e.shiftKey;
  const k = key.length === 1 ? key.toLowerCase() : key;
  const editTarget = bpInEditorTarget(e.target);

  // Teclas de función
  if (!mod && !alt) {
    if (key === "F2" && !shift) { done(bpLeaderBegin); return; }
    if (key === "F4" && !shift) { done(bpOpenLinkAtCursor); return; }
    if (key === "F6" && !shift) { done(bpLeaderToggleLang); return; }
    if (key === "F7") { done(() => bpSpellJump(shift ? -1 : 1)); return; }
    if (key === "F8" && !shift) { done(bpSpellSuggest); return; }
    if (key === "F9" && !shift) { done(Rae); return; }
  }

  // Ctrl / Cmd (sin Alt)
  if (mod && !alt) {
    if (!shift) {
      if (k === "o") { done(bpToggleFileSearchPopup); return; }
      if (k === "w") { done(bpCloseCurrentTab); return; }
      if (k === "t") { done(bpToggleOutlinePopup); return; }
      if (k === "PageUp" || k === "PageDown") { done(() => bpCycleTab(k === "PageUp" ? -1 : 1)); return; }
      if (editTarget && lp !== "preview" && (k === "b" || k === "i")) {
        done(() => k === "b" ? bpWrap("**", "**", "texto en negrita") : bpWrap("*", "*", "texto en cursiva")); return;
      }
      if (editTarget) {
        if (k === "l") { done(bpSelectLine); return; }
        if (k === "u") { done(bpApplyCaseCycle); return; }
        if (k === "d") { done(bpDeleteLine); return; }
        if (!bpIsMac && (k === "ArrowUp" || k === "ArrowDown")) { done(() => bpDocEdge(k === "ArrowDown")); return; }
      }
    } else {
      if (k === "p") { done(() => bpNeedMonaco(() => Nt.getAction("editor.action.quickCommand")?.run())); return; }
      if (editTarget && k === "k") { done(bpDeleteLine); return; }
      if (editTarget && (k === "ArrowUp" || k === "ArrowDown")) { done(() => bpMoveLine(k === "ArrowUp" ? -1 : 1)); return; }
    }
  }

  // Alt (no AltGr): se usa e.code; en macOS solo las que no escriben caracteres
  if (alt && !e.ctrlKey && !e.metaKey) {
    if (code === "PageUp" || code === "PageDown") { done(() => bpCycleTab(code === "PageUp" ? -1 : 1)); return; }
    if (!bpIsMac) {
      if (shift) {
        if (code === "ArrowLeft") { done(() => bpNavGo(-1)); return; }
        if (code === "ArrowRight") { done(() => bpNavGo(1)); return; }
        if (editTarget && (code === "ArrowUp" || code === "ArrowDown")) {
          if (lp === "text") { done(() => bpDuplicateLine(code === "ArrowUp" ? -1 : 1)); return; }
        }
        return;
      }
      if (code === "ArrowLeft") { done(() => bpCycleTab(-1)); return; }
      if (code === "ArrowRight") { done(() => bpCycleTab(1)); return; }
      if (editTarget && lp === "text" && (code === "ArrowUp" || code === "ArrowDown")) { done(() => bpMoveLine(code === "ArrowUp" ? -1 : 1)); return; }
      if (code === "KeyO") { done(bpOpenFileFromComputer); return; }
      if (code === "KeyH" || code === "Home") { done(bpOpenHomeFile); return; }
      if (code === "KeyR") { done(bpGhTogglePopup); return; }
      if (code === "KeyE") { done(bpEmojiPicker); return; }
      if (code === "KeyI") { done(bpItalic); return; }
      if (code === "KeyL") { done(bpLeaderToggleLang); return; }
      if (code === "Enter") { done(bpSpellSuggest); return; }
      const dm = /^(?:Digit|Numpad)([1-9])$/.exec(code);
      if (dm) { done(() => bpGotoNthTab(+dm[1])); return; }
      if (code === "Equal" || code === "NumpadAdd" || key === "+" || key === "=") { done(() => bpZoom(1)); return; }
      if (code === "Minus" || code === "NumpadSubtract" || key === "-") { done(() => bpZoom(-1)); return; }
    }
  }

  // Teclas sueltas en la vista previa (solo si no se está escribiendo en un campo)
  if (lp === "preview" && !mod && !alt && !bpIsEditableTarget(e.target)) {
    if (key === "Backspace") { done(() => bpNavGo(-1)); return; }
    if (k === "e" && !shift) { done(() => nB(bpEditMode())); return; }
  }
}
document.addEventListener("keydown", bpKeyHandler, true);


/* ------------------------------------------------------------------ */
/* Archivo > Exportar copia                                            */
/* ------------------------------------------------------------------ */
// Guarda una copia del texto en otro sitio SIN cambiar el destino de la
// pestaña: un archivo de GitHub sigue guardándose en GitHub (a diferencia de
// «Guardar como», que reasigna la pestaña al archivo local elegido).
// Sin File System Access API (Safari/iPad) se descarga como archivo normal.
async function bpExport() {
  const t = sp();
  if (!t) { xo("Ningún archivo abierto"); return; }
  if (lp === "text") bpTextToModel();
  const text = t.model.getValue();
  const name = /\.(md|markdown|txt)$/i.test(t.title) ? t.title : t.title + ".md";
  try {
    if (window.showSaveFilePicker) {
      const fh = await window.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: "Texto / Markdown", accept: { "text/plain": [".txt", ".md", ".markdown"] } }]
      });
      const w = await fh.createWritable();
      try { await w.write(text); await w.close(); }
      catch (e) { try { await w.abort(); } catch (_) {} throw e; }
      xo("Copia exportada: «" + fh.name + "» (el archivo abierto no cambia)");
    } else {
      const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      xo("Copia descargada: «" + name + "»");
    }
  } catch (e) {
    if (e.name !== "AbortError") xo("⚠ " + e.message);
  }
}

/* ------------------------------------------------------------------ */
/* Edición que funciona también en modo texto plano (textarea)         */
/* ------------------------------------------------------------------ */
// Reemplaza [start, end) del textarea conservando el deshacer nativo.
function bpTextReplace(start, end, text) {
  const ta = Xtv;
  ta.focus();
  ta.setSelectionRange(start, end);
  let ok = false;
  try { ok = document.execCommand("insertText", false, text); } catch (e) {}
  if (!ok) { ta.setRangeText(text, start, end, "end"); bpTextToModel(); }
}

function bpEditMode() {                                    // modo al que se vuelve desde la vista previa
  return "text";                                           // siempre texto plano; Mónaco solo por el menú Ver o si una acción lo necesita
}

// Envuelve la selección (o un texto de ejemplo) con marcas: negrita, cursiva…
function bpWrap(before, after, placeholder) {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  if (lp === "preview") nB(bpEditMode());
  if (lp === "edit") { requestAnimationFrame(() => { Nt.layout(); Nt.focus(); C2(before, after, placeholder); }); return; }
  const ta = Xtv, s = ta.selectionStart, e = ta.selectionEnd, inner = ta.value.slice(s, e) || placeholder;
  bpTextReplace(s, e, before + inner + after);
  ta.setSelectionRange(s + before.length, s + before.length + inner.length);
  bpTextToModel();
}

// Insertar enlace [texto](url) usando el portapapeles como URL
async function bpInsertLink() {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  if (lp === "preview") nB(bpEditMode());
  if (lp === "edit") { requestAnimationFrame(() => { Nt.layout(); Nt.focus(); Nae(); }); return; }
  let clip = "";
  try { clip = (await navigator.clipboard.readText()).trim(); } catch (e) {}
  const ta = Xtv, s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e);
  const label = sel || "texto del enlace", url = clip || "https://";
  bpTextReplace(s, e, "[" + label + "](" + url + ")");
  if (sel) ta.setSelectionRange(s + label.length + 3, s + label.length + 3 + url.length);
  else ta.setSelectionRange(s + 1, s + 1 + label.length);
  bpTextToModel();
}

function bpJoinLines() {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  if (lp === "preview") { xo("Pulsa Ctrl+E para editar"); return; }
  if (lp === "edit") { Nt.getAction("editor.action.joinLines")?.run(); Nt.focus(); return; }
  const ta = Xtv, v = ta.value, s0 = ta.selectionStart, e0 = ta.selectionEnd;
  const ls = v.lastIndexOf("\n", s0 - 1) + 1;
  let le = v.indexOf("\n", e0); if (le === -1) le = v.length;
  if (!v.slice(s0, e0).includes("\n")) {                    // sin selección multilínea: une con la línea siguiente
    if (le === v.length) { xo("No hay línea siguiente que unir"); return; }
    const nx = v.indexOf("\n", le + 1);
    le = nx === -1 ? v.length : nx;
  }
  const parts = v.slice(ls, le).split("\n");
  let out = parts[0];
  for (const l of parts.slice(1)) {
    const t = l.replace(/^\s+/, "");
    if (t) out += (out === "" || /\s$/.test(out) ? "" : " ") + t;
  }
  bpTextReplace(ls, le, out);
  bpTextToModel();
}

function bpUndoRedo(redo) {
  if (!sp() || lp === "preview") return;
  if (lp === "text") { Xtv.focus(); document.execCommand(redo ? "redo" : "undo"); bpTextToModel(); return; }
  Nt.trigger("toolbar", redo ? "redo" : "undo", null); Nt.focus();
}

function bpSelectAll() {
  if (!sp()) return;
  if (lp === "text") { Xtv.focus(); Xtv.select(); sy(Xtv.value, Xtv.value); }
  else if (lp === "edit") { Nt.trigger("kb", "selectAll", null); Nt.focus(); }
  else { const r = document.createRange(); r.selectNodeContents(Iu); const g = window.getSelection(); g.removeAllRanges(); g.addRange(r); }
}

/* ------------------------------------------------------------------ */
/* Menús: Archivo · Editar · Ver · Ir · GIT · EU/ES · Ayuda             */
/* ------------------------------------------------------------------ */
// Cada entrada: [etiqueta (o función), atajo, acción, {chk: función}] o "-".
// Las acciones llaman a las mismas funciones que los botones y atajos.
const bpK = s => bpIsMac ? s.replace(/Ctrl\+/g, "Cmd+") : s;
const bpNeedTab = fn => () => { if (!sp()) { xo("Ningún archivo abierto"); return; } return fn(); };
const bpMonacoAction = id => bpNeedTab(() => bpNeedMonaco(() => Nt.getAction(id)?.run()));
const bpSetMode = m => bpNeedTab(() => nB(m));

const BP_MENUS = {
  archivo: [
    ["Abrir archivo del ordenador…", "Alt+O", () => bpOpenFileFromComputer()],
    ["Abrir carpeta…", "Ctrl+R o", () => document.getElementById("open-folder-btn").click()],
    ["Buscar archivo…", "Ctrl+O", () => bpToggleFileSearchPopup()],
    ["Archivo «home»", "Alt+H", () => bpOpenHomeFile()],
    "-",
    ["Guardar", "Ctrl+S", () => document.getElementById("save-btn").click()],
    ["Guardar como…", "Ctrl+Shift+S", () => bpSaveAs()],
    ["Exportar copia…", "Ctrl+R y", () => bpExport()],
    "-",
    ["Cerrar pestaña", "Ctrl+W", () => bpCloseCurrentTab()],
    [() => (wr && wr.handle && wr.handle.__gh) ? "Cerrar repositorio" : "Cerrar carpeta", "Ctrl+R x", () => bpCloseExplorerRoot()]
  ],
  editar: [
    ["Deshacer", "Ctrl+Z", () => bpUndoRedo(false)],
    ["Rehacer", "Ctrl+Y", () => bpUndoRedo(true)],
    "-",
    ["Copiar", "Ctrl+C", () => bpClipboard("copy")],
    ["Cortar", "Ctrl+X", () => bpClipboard("cut")],
    ["Pegar", "Ctrl+V", () => bpClipboard("paste")],
    "-",
    ["Buscar…", "Ctrl+F", bpMonacoAction("actions.find")],
    ["Reemplazar…", "Ctrl+R r", bpMonacoAction("editor.action.startFindReplaceAction")],
    "-",
    ["Negrita", "Ctrl+B", () => bpWrap("**", "**", "texto en negrita")],
    ["Cursiva", "Ctrl+I", () => bpWrap("*", "*", "texto en cursiva")],
    ["Insertar enlace", "Ctrl+K", () => bpInsertLink()],
    ["Emoji…", "Alt+E", bpNeedTab(() => bpEmojiPicker())],
    ["Abrir enlace (web)", "F4", () => bpOpenLinkAtCursor()],
    "-",
    ["Seleccionar todo", "Ctrl+A", () => bpSelectAll()],
    ["Seleccionar línea", "Ctrl+L", () => bpSelectLine()],
    ["Ir al inicio del archivo", "Ctrl+↑", () => bpDocEdge(false)],
    ["Ir al final del archivo", "Ctrl+↓", () => bpDocEdge(true)],
    ["Mayús. / minús. / Título", "Ctrl+U", () => bpApplyCaseCycle()],
    ["minúsculas", "", () => bpApplyCaseCycle(t => t.toLowerCase())],
    ["MAYÚSCULAS", "", () => bpApplyCaseCycle(t => t.toUpperCase())],
    ["Unicode ↔ carácter", "Alt+X", bpNeedTab(() => bpNeedMonaco(() => bpUnicodeToggle()))],
    "-",
    ["Cerrar todas las pestañas", "", () => bpCloseAllTabs()]
  ],
  ver: [
    ["Explorador", "Ctrl+P", () => Rae(), { chk: () => !document.getElementById("sidebar").classList.contains("hidden") }],
    ["Esquema del documento", "Ctrl+T", () => bpToggleOutlinePopup()],
    "-",
    ["Vista previa ↔ texto", "Ctrl+E", () => bpToggleMode()],
    ["Vista previa", "Ctrl+R v", bpSetMode("preview"), { chk: () => !!sp() && lp === "preview" }],
    ["Editor (Mónaco)", "Ctrl+R m", bpSetMode("edit"), { chk: () => !!sp() && lp === "edit" }],
    ["Texto plano", "Ctrl+R t", bpSetMode("text"), { chk: () => !!sp() && lp === "text" }],
    "-",
    ["Zoom +", "Alt++", () => bpZoom(1)],
    ["Zoom −", "Alt+−", () => bpZoom(-1)],
    [() => "Cambiar fuente (" + bpFontList[bpFontIdx] + ")", "", () => bpApplyFont(bpFontIdx + 1, true)],
    ["Tema claro/oscuro", "Ctrl+R l", () => document.getElementById("theme-btn").click()]
  ],
  ir: [
    ["Pestaña siguiente", "Alt+→", () => bpCycleTab(1)],
    ["Pestaña anterior", "Alt+←", () => bpCycleTab(-1)],
    ["Atrás en el historial", "Alt+Shift+←", () => bpNavGo(-1)],
    ["Adelante en el historial", "Alt+Shift+→", () => bpNavGo(1)],
    "-",
    ["Ir a la línea…", "", bpMonacoAction("editor.action.gotoLine")],
    ["Mover línea ↑", "Alt+↑", () => bpMoveLine(-1)],
    ["Mover línea ↓", "Alt+↓", () => bpMoveLine(1)],
    ["Duplicar línea ↑", "Alt+Shift+↑", () => bpDuplicateLine(-1)],
    ["Duplicar línea ↓", "Alt+Shift+↓", () => bpDuplicateLine(1)],
    ["Eliminar línea", "Ctrl+D", () => bpDeleteLine()],
    ["Unir líneas", "Ctrl+J", () => bpJoinLines()],
    ["Comandos…", "Ctrl+Shift+P", bpMonacoAction("editor.action.quickCommand")]
  ],
  git: [
    ["Abrir repositorio de GitHub…", "Alt+R", () => bpGhTogglePopup()],
    ["Actualizar repositorio / carpeta", "", () => bpRefreshExplorerRoot()],
    ["Olvidar credenciales", "", () => bpGhForgetBtn.click()]
  ],
  idioma: [
    ["Activar/desactivar corrector", "Ctrl+R z", () => bpLeaderActions.z()],
    ["Español (es_ES)", "Ctrl+R c", () => bpSetDict("es_ES"), { chk: () => p2() === "es_ES" }],
    ["Euskera (eu_ES)", "Ctrl+R e", () => bpSetDict("eu_ES"), { chk: () => p2() === "eu_ES" }],
    ["Idioma: ES → EU → ninguno", "Alt+L / F6", () => bpLeaderToggleLang()],
    ["Otro diccionario / carpeta…", "", () => document.getElementById("lang-btn").click()],
    "-",
    ["Siguiente error", "F7", () => bpSpellJump(1)],
    ["Error anterior", "Shift+F7", () => bpSpellJump(-1)],
    ["Sugerencias…", "F8", () => bpSpellSuggest()]
  ],
  ayuda: [
    ["Atajos de teclado", "", () => bpToggleHelp()]
  ]
};

var bpMenuEl = null, bpMenuOpenId = null;

function bpMenuIsOpen() { return !!bpMenuOpenId; }

function bpMenuClose() {
  bpMenuOpenId = null;
  if (bpMenuEl) bpMenuEl.style.display = "none";
  document.querySelectorAll("#menubar .menu-title.open").forEach(b => b.classList.remove("open"));
}

function bpMenuRun(fn) {
  try {
    const r = fn();
    if (r && typeof r.catch === "function") r.catch(err => { if (err && err.name !== "AbortError") xo("⚠ " + err.message); });
  } catch (err) { xo("⚠ " + err.message); }
}

function bpMenuOpen(id, btn) {
  const items = BP_MENUS[id];
  if (!items) return;
  if (!bpMenuEl) {
    bpMenuEl = document.createElement("div");
    bpMenuEl.id = "menu-dropdown";
    bpMenuEl.setAttribute("role", "menu");
    bpMenuEl.addEventListener("mousedown", ev => ev.preventDefault());     // no quitar el foco ni la selección al editor
    bpMenuEl.addEventListener("click", ev => {
      const row = ev.target.closest(".menu-item");
      if (!row) return;
      ev.stopPropagation();                                              // que no cierre ventanas que la acción abra
      const fn = bpMenuEl._actions[+row.dataset.i];
      bpMenuClose();
      if (fn) setTimeout(() => bpMenuRun(fn), 0);
    });
    document.body.appendChild(bpMenuEl);
  }
  bpMenuEl.innerHTML = "";
  bpMenuEl._actions = [];
  items.forEach(it => {
    if (it === "-") { const sep = document.createElement("div"); sep.className = "menu-sep"; bpMenuEl.appendChild(sep); return; }
    const [label, key, fn, opts] = it;
    const row = document.createElement("div");
    row.className = "menu-item"; row.setAttribute("role", "menuitem");
    row.dataset.i = String(bpMenuEl._actions.length);
    bpMenuEl._actions.push(fn);
    const chk = document.createElement("span");
    chk.className = "menu-check"; chk.textContent = opts && opts.chk && opts.chk() ? "✓" : "";
    const lab = document.createElement("span");
    lab.className = "menu-label"; lab.textContent = typeof label === "function" ? label() : label;
    row.append(chk, lab);
    if (key) { const k = document.createElement("span"); k.className = "menu-key"; k.textContent = bpK(key); row.appendChild(k); }
    bpMenuEl.appendChild(row);
  });
  document.querySelectorAll("#menubar .menu-title.open").forEach(b => b.classList.remove("open"));
  btn.classList.add("open");
  bpMenuOpenId = id;
  bpMenuEl.style.display = "block";
  const r = btn.getBoundingClientRect();
  bpMenuEl.style.maxHeight = Math.max(160, window.innerHeight - r.bottom - 12) + "px";
  bpMenuEl.style.top = r.bottom + "px";
  bpMenuEl.style.left = Math.max(6, Math.min(r.left, window.innerWidth - bpMenuEl.offsetWidth - 6)) + "px";
}

document.querySelectorAll("#menubar .menu-title").forEach(btn => {
  btn.addEventListener("mousedown", ev => ev.preventDefault());
  btn.addEventListener("click", () => {
    const id = btn.dataset.menu;
    if (bpMenuOpenId === id) bpMenuClose(); else bpMenuOpen(id, btn);
  });
  btn.addEventListener("pointerenter", ev => {                           // con un menú abierto, pasar el ratón cambia de menú
    if (ev.pointerType === "mouse" && bpMenuOpenId && bpMenuOpenId !== btn.dataset.menu) bpMenuOpen(btn.dataset.menu, btn);
  });
});
document.addEventListener("pointerdown", ev => {
  if (bpMenuOpenId && !(bpMenuEl && bpMenuEl.contains(ev.target)) && !ev.target.closest("#menubar")) bpMenuClose();
}, true);
window.addEventListener("resize", bpMenuClose);
window.addEventListener("blur", bpMenuClose);

/* --- Tecla líder: «y» exporta; «n» (nueva nota) ya no existe en la web --- */
bpLeaderActions.y = () => bpExport();
bpLeaderActions.e = () => bpSetDict("eu_ES");          // Ctrl+R e: euskera
bpLeaderActions.c = () => bpSetDict("es_ES");          // Ctrl+R c: español
bpLeaderActions.m = () => { if (sp()) nB("edit"); else xo("Ningún archivo abierto"); };   // Ctrl+R m: Mónaco
bpLeaderActions.k = () => bpInsertLink();
delete bpLeaderActions.n;

/* ------------------------------------------------------------------ */
/* Corrector: fijar idioma (Ctrl+R e / Ctrl+R c) y botón único          */
/* ------------------------------------------------------------------ */
// Si el idioma ya está activo no se desactiva (para eso están Alt+L, el botón
// ES/EU/-- y «Activar/desactivar corrector»).
async function bpSetDict(name) {
  try {
    await bpDictIndexReady;
    if (p2() === name) xo("Corrector: " + (name === "eu_ES" ? "euskera" : "español"));
    else await bpToggleDict(name);
  } catch (e) { xo("⚠ " + e.message); }
}

/* ------------------------------------------------------------------ */
/* Enlaces desde la vista previa: la pestaña de destino sigue en vista previa */
/* ------------------------------------------------------------------ */
// Se usa en los clics sobre enlaces de la vista previa. Si se venía de la vista
// previa, la nota que se abre se queda en vista previa (hasta pasar a edición
// con doble clic, el menú Ver o el chip ■/□).
async function bpKeepPreview(fn) {
  const wasPreview = lp === "preview";
  try { return await fn(); }
  finally { if (wasPreview && sp() && lp !== "preview") nB("preview"); }
}

/* ------------------------------------------------------------------ */
/* Editar > Copiar / Cortar / Pegar                                    */
/* ------------------------------------------------------------------ */
// Sin selección: Cortar corta la línea; Copiar avisa. En la vista previa solo se
// puede copiar lo seleccionado. Pegar lee el portapapeles (el navegador puede
// pedir permiso; si lo niega, vale Ctrl+V).
async function bpClipboard(op) {
  if (!sp()) { xo("Ningún archivo abierto"); return; }
  const done = () => xo(op === "cut" ? "Cortado" : op === "copy" ? "Copiado" : "Pegado");
  if (lp === "preview") {
    if (op !== "copy") { xo("Pulsa Ctrl+E para editar"); return; }
    const sel = String(window.getSelection() || "");
    if (!sel) { xo("No hay nada seleccionado"); return; }
    try { await navigator.clipboard.writeText(sel); done(); } catch (err) { xo("⚠ " + err.message); }
    return;
  }
  if (op === "paste") {
    let text = "";
    try { text = await navigator.clipboard.readText(); }
    catch (err) { xo("⚠ El navegador no deja pegar desde el menú: usa " + (bpIsMac ? "Cmd" : "Ctrl") + "+V"); return; }
    if (!text) { xo("El portapapeles está vacío"); return; }
    if (lp === "text") { const ta = Xtv; bpTextReplace(ta.selectionStart, ta.selectionEnd, text); bpTextToModel(); }
    else { const sel = Nt.getSelection(); Nt.executeEdits("paste", [{ range: sel, text, forceMoveMarkers: true }]); Nt.focus(); }
    done(); return;
  }
  let text = "";
  if (lp === "text") {
    const ta = Xtv, v = ta.value;
    let a = ta.selectionStart, b = ta.selectionEnd;
    if (a === b) {
      if (op === "copy") { xo("No hay nada seleccionado"); return; }
      a = v.lastIndexOf("\n", a - 1) + 1;
      const le = v.indexOf("\n", b); b = le === -1 ? v.length : le + 1;
    }
    text = v.slice(a, b);
    try { await navigator.clipboard.writeText(text); } catch (err) { xo("⚠ " + err.message); return; }
    if (op === "cut") { bpTextReplace(a, b, ""); bpTextToModel(); }
    ta.focus();
  } else {
    const model = Nt.getModel(); let sel = Nt.getSelection();
    if (sel.isEmpty()) {
      if (op === "copy") { xo("No hay nada seleccionado"); return; }
      const ln = sel.startLineNumber, last = model.getLineCount();
      if (ln < last) sel = new DF(ln, 1, ln + 1, 1);
      else if (ln > 1) sel = new DF(ln - 1, model.getLineMaxColumn(ln - 1), ln, model.getLineMaxColumn(ln));
      else sel = new DF(1, 1, 1, model.getLineMaxColumn(1));
    }
    text = model.getValueInRange(sel);
    try { await navigator.clipboard.writeText(text); } catch (err) { xo("⚠ " + err.message); return; }
    if (op === "cut") Nt.executeEdits("cut", [{ range: sel, text: "" }]);
    Nt.focus();
  }
  done();
}

/* ------------------------------------------------------------------ */
/* Pantalla de inicio (sin archivos abiertos): Archivo · Home · GitHub · Salir */
/* ------------------------------------------------------------------ */
function bpQuit() {
  if (ta.some(t => t.dirty) && !confirm("Hay cambios sin guardar. ¿Salir de todos modos?")) return;
  window.close();
  setTimeout(() => xo("El navegador no deja cerrar esta pestaña desde la página: ciérrala con " + (bpIsMac ? "Cmd" : "Ctrl") + "+W."), 300);
}
document.getElementById("welcome-search")?.addEventListener("click", () => bpToggleFileSearchPopup());
document.getElementById("welcome-home")?.addEventListener("click", () => bpOpenHomeFile());
document.getElementById("welcome-github")?.addEventListener("click", () => bpGhTogglePopup());
document.getElementById("welcome-quit")?.addEventListener("click", () => bpQuit());

/* --- Monaco sin resaltado de corchetes ------------------------------------ */
// La coloración de pares de corchetes es una opción del MODELO (la del editor
// no basta cuando el modelo se crea aparte), así que se desactiva en cada uno.
const bpNoBrackets = m => {
  try { m.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } }); } catch (e) {}
};
lb.editor.onDidCreateModel(bpNoBrackets);
lb.editor.getModels().forEach(bpNoBrackets);
