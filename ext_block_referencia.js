
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
  if (lp === "preview") nB(bpLastEditMode && bpLastEditMode !== "preview" ? bpLastEditMode : "edit");
  else nB("preview");
}

function bpUpdateModeChip() {
  const chip = document.getElementById("mode-chip");
  if (!chip) return;
  const preview = lp === "preview";
  chip.style.display = sp() ? "inline-flex" : "none";
  chip.textContent = preview ? "\u25A0" : "\u25A1";            // ■ vista previa · □ edición
  chip.classList.toggle("preview", preview);
  chip.setAttribute("aria-pressed", preview ? "true" : "false");
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

function bpDocEdge(end) {                                      // Ctrl+\u2191 / Ctrl+\u2193 (como en la terminal)
  if (lp === "text") { const n = end ? Xtv.value.length : 0; Xtv.setSelectionRange(n, n); Xtv.focus(); }
  else if (lp === "edit") { Nt.trigger("kb", end ? "cursorBottom" : "cursorTop", null); Nt.focus(); }
}

function bpItalic() {
  bpNeedMonaco(() => C2("*", "*", "texto en cursiva"));
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

/* --- Mayúsculas / minúsculas / T\u00edtulo (Ctrl+U), igual que en la terminal --- */

const BP_MINOR = new Set(["a", "al", "con", "de", "del", "e", "el", "en", "la", "las", "lo", "los", "o", "por",
  "para", "sin", "u", "un", "una", "y", "eta", "edo", "ere", "baina", "an", "and", "of", "or", "the", "to", "in", "on"]);

function bpTitleCase(text) {
  let first = true;
  return text.replace(/[\p{L}\p{M}]+(?:['\u2019][\p{L}\p{M}]+)*/gu, m => {
    const w = m.toLowerCase();
    const out = (!first && BP_MINOR.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1);
    first = false;
    return out;
  });
}

// min\u00fasculas \u2192 MAY\u00daSCULAS \u2192 T\u00edtulo \u2192 min\u00fasculas (lo mixto pasa a MAY\u00daSCULAS)
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

function bpApplyCaseCycle() {
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
    const next = bpCycleCase(v.slice(s, e));
    ta.value = v.slice(0, s) + next + v.slice(e);
    if (keepSel) ta.setSelectionRange(s, s + next.length); else ta.setSelectionRange(caret, caret);
    ta.focus(); bpTextToModel();
    return;
  }
  const model = Nt.getModel();
  if (!model) return;
  const sel = Nt.getSelection();
  if (sel && !sel.isEmpty()) {
    const text = model.getValueInRange(sel), next = bpCycleCase(text);
    if (next === text) return;
    const startOffset = model.getOffsetAt(sel.getStartPosition());
    Nt.executeEdits("case-cycle", [{ range: sel, text: next }]);
    const m2 = Nt.getModel(), a = m2.getPositionAt(startOffset), b = m2.getPositionAt(startOffset + next.length);
    Nt.setSelection(new DF(a.lineNumber, a.column, b.lineNumber, b.column));
  } else {
    const pos = Nt.getPosition(), w = pos && model.getWordAtPosition(pos);
    if (!w) { xo("No hay ninguna palabra bajo el cursor."); return; }
    const range = new lb.Range(pos.lineNumber, w.startColumn, pos.lineNumber, w.endColumn);
    const text = model.getValueInRange(range), next = bpCycleCase(text);
    if (next !== text) { Nt.executeEdits("case-cycle", [{ range, text: next }]); Nt.setPosition(pos); }
  }
  Nt.focus();
}

/* --- Historial atr\u00e1s / adelante entre pesta\u00f1as (Alt+May\u00fas+\u2190/\u2192) ---------- */

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
  xo(dir < 0 ? "No hay nada m\u00e1s atr\u00e1s en el historial" : "No hay nada m\u00e1s adelante en el historial");
}

function bpGotoNthTab(n) {
  if (!ta.length) return;
  const t = n >= 9 ? ta[ta.length - 1] : ta[n - 1];
  if (t) Yb(t.id); else xo("No hay pesta\u00f1a " + n);
}

/* --- Esquema en vista previa: salta al t\u00edtulo sin cambiar de modo ------- */

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

/* --- Lista emergente gen\u00e9rica (sugerencias, enlaces\u2026) ---------------------- */

var bpListEl = null, bpListState = null;

function bpHideList() {
  if (bpListEl) bpListEl.style.display = "none";
  bpListState = null;
}

function bpListPick(i) {
  const st = bpListState;
  if (!st || !st.items[i]) return;
  bpHideList();
  try { st.items[i].run(); } catch (e) { xo("\u26A0 " + e.message); }
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
    if (!rs.length) { xo("Sin errores ortogr\u00e1ficos"); return; }
    const pos = Nt.getPosition(), cur = bpSpellAt(pos);
    const ref = cur ? { l: cur.startLineNumber, c: cur.startColumn } : { l: pos.lineNumber, c: pos.column };
    const after = r => r.startLineNumber > ref.l || (r.startLineNumber === ref.l && r.startColumn > ref.c);
    const before = r => r.startLineNumber < ref.l || (r.startLineNumber === ref.l && r.startColumn < ref.c);
    const target = dir > 0 ? (rs.find(after) || rs[0]) : ([...rs].reverse().find(before) || rs[rs.length - 1]);
    Nt.setSelection(target);
    Nt.revealRangeInCenter(target);
    xo("Error ortogr\u00e1fico: \u00ab" + Nt.getModel().getValueInRange(target) + "\u00bb (F8: sugerencias)");
  });
}

function bpSpellSuggest() {
  if (!p2() || !Ap) { xo("Activa el corrector (ES o EU) para ver sugerencias"); return; }
  bpNeedMonaco(() => {
    const pos = Nt.getPosition(), range = pos && bpSpellAt(pos);
    if (!range) { xo("No hay error ortogr\u00e1fico bajo el cursor (F7: ir al siguiente)"); return; }
    const word = Nt.getModel().getValueInRange(range);
    let sugg = [];
    try { sugg = Ap.suggest(word).slice(0, 8); } catch (e) {}
    const items = sugg.map(s => ({
      label: s,
      run: () => { Nt.executeEdits("spell-fix", [{ range, text: s }]); Nt.focus(); }
    }));
    items.push({
      label: "A\u00f1adir \u00ab" + word + "\u00bb al diccionario", hint: "guarda",
      run: () => {
        const w = word.toLowerCase();
        bpUserWordSet.add(w);
        chrome.storage.local.set({ bp_user_words: [...bpUserWordSet] });
        ey.clear(); U0e(); Nt.focus();
        xo("\u00ab" + word + "\u00bb a\u00f1adida al diccionario");
      }
    });
    items.push({
      label: "Ignorar \u00ab" + word + "\u00bb", hint: "esta sesi\u00f3n",
      run: () => { bpIgnoredWordSet.add(word.toLowerCase()); ey.clear(); U0e(); Nt.focus(); }
    });
    bpShowList(sugg.length ? "Sugerencias para \u00ab" + word + "\u00bb" : "Sin sugerencias para \u00ab" + word + "\u00bb", items, true);
  });
}

/* --- Enlaces: F4 abre el de la posici\u00f3n del cursor; Ctrl+., u lista los de la nota --- */

const BP_LINK_RE = /\[\[([^\]]+)\]\]|!?\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()\]]+)/g;

function bpParseLinks(line) {
  const out = [];
  BP_LINK_RE.lastIndex = 0;
  let m;
  while ((m = BP_LINK_RE.exec(line))) {
    if (m[0].startsWith("![")) continue;                       // las im\u00e1genes no son enlaces de navegaci\u00f3n
    const r = { start: m.index, end: m.index + m[0].length };
    if (m[1] !== undefined) { const parts = m[1].split("|"); r.kind = "wiki"; r.target = parts[0].trim(); r.label = (parts[1] || parts[0]).trim(); }
    else if (m[3] !== undefined) { r.kind = /^https?:/i.test(m[3]) ? "web" : "internal"; r.target = m[3]; r.label = m[2] || m[3]; }
    else { r.kind = "web"; r.target = m[4] || m[5]; r.label = r.target; }
    out.push(r);
  }
  return out;
}

async function bpFollowLink(link) {
  if (link.kind === "web") { window.open(link.target, "_blank", "noopener,noreferrer"); return; }
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
  if (!link) { xo("No hay ning\u00fan enlace bajo el cursor"); return; }
  bpFollowLink(link).catch(e => xo("\u26A0 " + e.message));
}

function bpShowLinksList() {
  if (!sp()) { xo("Ning\u00fan archivo abierto"); return; }
  const links = [];
  jb().replace(/\r\n?/g, "\n").split("\n").forEach(line => links.push(...bpParseLinks(line)));
  if (!links.length) { xo("La nota no tiene enlaces"); return; }
  bpShowList("Enlaces de la nota", links.slice(0, 60).map(l => ({
    label: l.label, hint: l.kind === "web" ? l.target.replace(/^https?:\/\//, "") : l.target,
    run: () => bpFollowLink(l).catch(e => xo("\u26A0 " + e.message))
  })), false);
}

/* --- Pantalla de ayuda con todos los atajos ---------------------------- */

function bpHelpHTML() {
  const c = bpIsMac ? "Cmd" : "Ctrl";
  const sec = (title, rows) => `<h3>${title}</h3><table>` + rows.map(([k, d]) => `<tr><td><kbd>${k}</kbd></td><td>${d}</td></tr>`).join("") + "</table>";
  return `<div class="bp-help-head"><strong>Atajos de teclado</strong><button type="button" id="help-close-btn" aria-label="Cerrar">\u2715</button></div>
<p class="bp-help-note">${c} equivale a Cmd en macOS. Los mismos atajos que la versi\u00f3n de terminal, salvo los que reserva el navegador (ah\u00ed vale la tecla l\u00edder).</p>` +
    sec("Archivos y navegaci\u00f3n", [
      [c + "+N / " + c + "+Shift+A", "Nueva nota"], [c + "+S", "Guardar"], [c + "+Shift+S", "Guardar como"],
      [c + "+O", "Buscar archivo por nombre"], ["Alt+O / " + c + "+Shift+O", "Abrir archivo del ordenador"],
      [c + "+P / F9 / " + c + "+Shift+F", "Mostrar u ocultar el explorador"], ["Alt+H", "Abrir el archivo \u00abhome\u00bb"],
      [c + "+W / " + c + "+Shift+X", "Cerrar pesta\u00f1a"], [c + "+T / " + c + "+Shift+M", "Esquema del documento"],
      ["Alt+R", "Panel de GitHub"], ["F4", "Abrir el enlace bajo el cursor"]]) +
    sec("Pesta\u00f1as e historial", [
      ["Alt+PgUp / Alt+PgDn", "Pesta\u00f1a anterior / siguiente"], ["Alt+\u2190 / Alt+\u2192", "Lo mismo (no en macOS)"],
      ["Alt+1 \u2026 Alt+8 / Alt+9", "Ir a esa pesta\u00f1a / a la \u00faltima"], ["Alt+May\u00fas+\u2190 / \u2192", "Atr\u00e1s / adelante en el historial"],
      ["Backspace (vista previa)", "Atr\u00e1s en el historial"]]) +
    sec("Vista", [
      [c + "+E", "Vista previa \u2194 edici\u00f3n (tambi\u00e9n el chip \u25A0/\u25A1 de la barra de estado)"],
      [c + "+L", "Tema claro / oscuro"], ["Alt+= / Alt+\u2212", "Zoom + / \u2212"], ["e (vista previa)", "Editar"]]) +
    sec("Edici\u00f3n", [
      [c + "+B", "Negrita"], [c + "+I / Alt+I", "Cursiva"], [c + "+K", "Insertar enlace (usa el portapapeles)"],
      ["Alt+E o \u00ab:\u00bb", "Selector de emojis"], [c + "+U", "min\u00fasculas \u2192 MAY\u00daSCULAS \u2192 T\u00edtulo"],
      [c + "+J", "Unir l\u00edneas"], [c + "+D / " + c + "+Shift+K", "Eliminar l\u00ednea"],
      ["Alt+L", "Seleccionar l\u00ednea"], [c + "+\u2191 / " + c + "+\u2193", "Inicio / final del archivo"],
      ["Alt+\u2191/\u2193 o " + c + "+Shift+\u2191/\u2193", "Mover l\u00ednea"], ["Alt+May\u00fas+\u2191/\u2193", "Duplicar l\u00ednea"],
      ["Alt+X", "Unicode \u2194 car\u00e1cter"], [c + "+F / " + c + "+H", "Buscar / reemplazar"], ["F3 / May\u00fas+F3", "Resultado siguiente / anterior"],
      ["F1 o " + c + "+Shift+P", "Paleta de comandos"]]) +
    sec("Corrector ortogr\u00e1fico", [
      ["F6", "Alternar espa\u00f1ol \u2194 euskera"], ["F7 / May\u00fas+F7", "Error siguiente / anterior"],
      ["F8 o Alt+Intro", "Sugerencias, a\u00f1adir al diccionario o ignorar"]]) +
    sec("Tecla l\u00edder: " + c + "+. (o F2) y luego una letra", [
      ["s a n o b", "guardar \u00b7 guardar como \u00b7 nueva \u00b7 carpeta \u00b7 archivo del ordenador"],
      ["p h g x q", "buscar archivo \u00b7 home \u00b7 GitHub \u00b7 cerrar carpeta \u00b7 cerrar pesta\u00f1a"],
      ["f r k m u", "buscar \u00b7 reemplazar \u00b7 enlace \u00b7 esquema \u00b7 lista de enlaces"],
      ["e v t", "editor \u00b7 vista previa \u00b7 texto plano"], ["d j w c", "borrar l\u00ednea \u00b7 unir \u00b7 May\u00fas/min\u00fas/T\u00edtulo \u00b7 paleta"],
      ["l i + \u2212", "tema \u00b7 idioma del corrector \u00b7 zoom"], ["\u2190 \u2192 \u2191 \u2193", "historial \u00b7 mover l\u00ednea"],
      ["Tab / May\u00fas+Tab", "pesta\u00f1a siguiente / anterior"], ["?", "esta ayuda"]]);
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

/* --- Tecla l\u00edder: F2 y nuevas letras ---------------------------------- */

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

/* --- Manejador \u00fanico de atajos (fase de captura) ----------------------- */

function bpInEditorTarget(t) {
  return !!(t && ((t.closest && t.closest("#editor")) || t.id === "text-view" || t === document.body || t === document.documentElement));
}

function bpIsEditableTarget(t) {
  return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
}

function bpCloseOpenPopups() {
  let closed = false;
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

  // Teclas de funci\u00f3n
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
      if (k === "n") { done(() => { zb("", "Sin t\u00edtulo"); nB("edit"); }); return; }
      if (k === "o") { done(bpToggleFileSearchPopup); return; }
      if (k === "w") { done(bpCloseCurrentTab); return; }
      if (k === "t") { done(bpToggleOutlinePopup); return; }
      if (k === "PageUp" || k === "PageDown") { done(() => bpCycleTab(k === "PageUp" ? -1 : 1)); return; }
      if (editTarget) {
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
      if (code === "KeyL" && editTarget) { done(bpSelectLine); return; }
      if (code === "Enter") { done(bpSpellSuggest); return; }
      const dm = /^(?:Digit|Numpad)([1-9])$/.exec(code);
      if (dm) { done(() => bpGotoNthTab(+dm[1])); return; }
      if (code === "Equal" || code === "NumpadAdd" || key === "+" || key === "=") { done(() => bpZoom(1)); return; }
      if (code === "Minus" || code === "NumpadSubtract" || key === "-") { done(() => bpZoom(-1)); return; }
    }
  }

  // Teclas sueltas en la vista previa (solo si no se est\u00e1 escribiendo en un campo)
  if (lp === "preview" && !mod && !alt && !bpIsEditableTarget(e.target)) {
    if (key === "Backspace") { done(() => bpNavGo(-1)); return; }
    if (k === "e" && !shift) { done(() => nB(bpLastEditMode && bpLastEditMode !== "preview" ? bpLastEditMode : "edit")); return; }
  }
}
document.addEventListener("keydown", bpKeyHandler, true);
