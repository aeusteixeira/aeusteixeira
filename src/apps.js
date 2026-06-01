/* ══════════════════════════════════════════════════════════════════════
   APPS EXTRAS DO WINDOWS XP — Matheus Teixeira
   Módulo autônomo: injeta novas janelas, registra no winMeta, adiciona
   atalhos no Menu Iniciar e na Área de Trabalho, e cuida do papel de
   parede (Propriedades de Vídeo) com persistência em localStorage.
   Carregado DEPOIS de app.js, então usa openWindow, winMeta, showNotif,
   sndClick, sndOpen, escHtml, startDrag, etc. já definidos.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const esc = (s) => (typeof escHtml === 'function' ? escHtml(String(s)) : String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const click = () => { try { sndClick(); } catch (e) {} };

  /* ---------- estilos próprios (não tocam app.css) ---------- */
  const css = `
  .ax-body{position:absolute;inset:28px 0 0 0;display:flex;flex-direction:column;background:#ece9d8;font-family:Tahoma,sans-serif;font-size:11px;overflow:hidden}
  .ax-tabs{display:flex;gap:2px;padding:6px 6px 0;background:#ece9d8;border-bottom:1px solid #aca899;flex:none}
  .ax-tab{padding:4px 12px;border:1px solid #aca899;border-bottom:none;border-radius:4px 4px 0 0;background:#dcd8c8;cursor:pointer;font-size:11px}
  .ax-tab.active{background:#fff;font-weight:bold;margin-bottom:-1px;padding-bottom:5px}
  .ax-pane{flex:1;padding:12px;overflow:auto;background:#fff;display:none}
  .ax-pane.active{display:block}
  .ax-btnrow{flex:none;display:flex;justify-content:flex-end;gap:8px;padding:8px;border-top:1px solid #aca899;background:#ece9d8}
  .ax-btn{font-family:Tahoma;font-size:11px;padding:3px 16px;cursor:pointer;border:1px solid #707070;border-radius:3px;background:#f5f4ea}
  .ax-btn:hover{background:#e8f0fc}
  .ax-btn.primary{background:#cfe3ff}
  /* monitor preview */
  .disp-monitor{width:200px;height:160px;margin:0 auto 10px;background:#222;border-radius:8px;padding:10px 10px 22px;box-shadow:0 4px 10px rgba(0,0,0,.3);position:relative}
  .disp-screen{width:100%;height:100%;background-size:cover;background-position:center;border:1px solid #000;border-radius:2px;overflow:hidden}
  .disp-stand{width:60px;height:10px;background:#aaa;margin:4px auto 0;border-radius:0 0 6px 6px}
  .wp-grid{display:grid;grid-template-columns:repeat(auto-fill,72px);gap:8px;margin-top:8px}
  .wp-thumb{width:72px;height:54px;background-size:cover;background-position:center;border:2px solid #ccc;cursor:pointer;border-radius:2px}
  .wp-thumb.sel{border-color:#0a58e0;box-shadow:0 0 0 2px #b6d2ff}
  /* explorer */
  .exp-wrap{flex:1;display:flex;overflow:hidden}
  .exp-side{width:180px;background:linear-gradient(180deg,#7aa1e8,#4a78c8);color:#fff;padding:8px;overflow:auto;flex:none}
  .exp-side h4{font-size:11px;background:rgba(255,255,255,.25);padding:3px 6px;border-radius:3px;margin-bottom:6px}
  .exp-side .exp-link{font-size:11px;padding:2px 6px;cursor:pointer;border-radius:3px}
  .exp-side .exp-link:hover{background:rgba(255,255,255,.25)}
  .exp-main{flex:1;background:#fff;padding:12px;overflow:auto;display:flex;flex-wrap:wrap;align-content:flex-start;gap:14px}
  .exp-item{width:84px;text-align:center;cursor:pointer;font-size:11px}
  .exp-item:hover{background:#e8f0fc}
  .exp-item .ico{font-size:34px;line-height:1}
  /* charmap */
  .cm-grid{display:grid;grid-template-columns:repeat(20,1fr);border:1px solid #999;background:#fff}
  .cm-cell{aspect-ratio:1;display:flex;align-items:center;justify-content:center;border:1px solid #eee;cursor:pointer;font-size:14px}
  .cm-cell:hover{background:#316ac5;color:#fff}
  /* sound recorder */
  .sr-wrap{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#ece9d8}
  .sr-vu{display:flex;gap:3px;align-items:flex-end;height:60px}
  .sr-bar{width:8px;background:#3a9c00;transition:height .08s}
  .sr-btns{display:flex;gap:8px}
  .sr-rbtn{width:40px;height:40px;border-radius:50%;border:2px outset #ccc;background:#d4d0c8;cursor:pointer;font-size:16px}
  /* freecell / card games reuse .sol-card */
  .fc-top{display:flex;gap:8px;padding:8px}
  .fc-cell,.fc-found{width:52px;height:74px;border:2px solid rgba(255,255,255,.4);border-radius:5px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);font-size:22px;position:relative}
  .fc-cols{display:flex;gap:10px;padding:0 8px;flex:1}
  .fc-col{flex:1;position:relative;min-height:120px}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- helper: cria janela XP genérica ---------- */
  function makeWin(id, title, ico, w, h, opts) {
    opts = opts || {};
    let win = document.getElementById(id);
    if (win) return win;
    win = document.createElement('div');
    win.className = 'xp-win';
    win.id = id;
    const top = opts.top != null ? opts.top : 56;
    const left = opts.left != null ? opts.left : 150;
    win.style.cssText = `width:${w}px;height:${h}px;top:${top}px;left:${left}px;display:none`;
    win.innerHTML =
      `<div class="xp-titlebar" onmousedown="startDrag(event,'${id}')">` +
      `<span class="xp-titlebar-ico">${ico}</span>` +
      `<span class="xp-titlebar-txt">${esc(title)}</span>` +
      `<div class="xp-wbtns">` +
      `<div class="xp-wbtn wmin" onclick="minimizeWin('${id}')">_</div>` +
      `<div class="xp-wbtn wmax" onclick="maximizeWin('${id}')">□</div>` +
      `<div class="xp-wbtn wcls" onclick="closeWin('${id}')">✕</div>` +
      `</div></div>` + opts.body;
    const host = document.getElementById('desktop') || document.body;
    host.appendChild(win);
    if (typeof winMeta !== 'undefined') winMeta[id] = { ico: ico, lbl: title };
    return win;
  }

  /* ════════════════ PAPEL DE PAREDE / PROPRIEDADES DE VÍDEO ════════════════ */
  const WP_DIR = 'src/img/wallpapers/';
  const WP_DEFAULT = 'src/img/wallpapper.jpg';
  const WALLPAPERS = [
    { f: 'windows-xp-desktop-background-wallpaper-ascent-800x600.jpg', n: 'Colina (Bliss)' },
    { f: 'windows-xp-desktop-background-wallpaper-azul-800x600.jpg', n: 'Azul' },
    { f: 'windows-xp-desktop-background-wallpaper-crystal-800x600.jpg', n: 'Cristal' },
    { f: 'windows-xp-desktop-background-wallpaper-radiance-800x600.jpg', n: 'Radiância' },
    { f: 'windows-xp-desktop-background-wallpaper-follow-800x600.jpg', n: 'Follow' },
    { f: 'windows-xp-desktop-background-wallpaper-friend-800x600.jpg', n: 'Amizade' },
    { f: 'windows-xp-desktop-background-wallpaper-home-800x600.jpg', n: 'Lar' },
    { f: 'windows-xp-desktop-background-wallpaper-autumn-800x600.jpg', n: 'Outono' },
    { f: 'windows-xp-desktop-background-wallpaper-tulips-800x600.jpg', n: 'Tulipas' },
    { f: 'windows-xp-desktop-background-wallpaper-stonehenge-800x600.jpg', n: 'Stonehenge' },
    { f: 'windows-xp-desktop-background-wallpaper-wind-800x600.jpg', n: 'Vento' },
    { f: 'windows-xp-desktop-background-wallpaper-red-moon-desert-800x600.jpg', n: 'Lua Vermelha' },
    { f: 'windows-xp-desktop-background-wallpaper-windows-xp-800x600.jpg', n: 'Windows XP' }
  ];
  let dispSel = localStorage.getItem('mt_wallpaper') || WP_DEFAULT;

  function applyWallpaper(url) {
    const d = document.getElementById('desktop');
    if (!d) return;
    if (url === '__none__') { d.style.backgroundImage = 'none'; d.style.backgroundColor = '#3a6ea5'; }
    else { d.style.backgroundImage = `url('${url}')`; d.style.backgroundSize = 'cover'; d.style.backgroundPosition = 'center'; d.style.backgroundRepeat = 'no-repeat'; }
  }
  function applySavedWallpaper() {
    const saved = localStorage.getItem('mt_wallpaper');
    if (saved) applyWallpaper(saved);
    const sc = localStorage.getItem('mt_scheme'); if (sc) applyScheme(sc, true);
  }
  window.setWallpaper = function (url) {
    dispSel = url;
    document.querySelectorAll('#win-display .wp-thumb').forEach(t => t.classList.toggle('sel', t.dataset.url === url));
    const prev = document.getElementById('disp-preview'); if (prev) prev.style.backgroundImage = url === '__none__' ? 'none' : `url('${url}')`;
  };
  window.dispApply = function () {
    localStorage.setItem('mt_wallpaper', dispSel);
    applyWallpaper(dispSel);
    const scheme = document.getElementById('disp-scheme'); if (scheme) { localStorage.setItem('mt_scheme', scheme.value); applyScheme(scheme.value); }
    click(); showNotif('🖼️ Vídeo', 'Configurações de exibição aplicadas.');
  };
  window.dispOkClose = function () { window.dispApply(); closeWin('win-display'); };
  window.dispTab = function (n) {
    click();
    document.querySelectorAll('#win-display .ax-tab').forEach((t, i) => t.classList.toggle('active', i === n));
    document.querySelectorAll('#win-display .ax-pane').forEach((p, i) => p.classList.toggle('active', i === n));
  };
  window.dispPreviewSaver = function () { click(); try { triggerScreensaver(); } catch (e) { showNotif('💤 Protetor', 'Pré-visualização não disponível.'); } };

  /* esquema de cores Luna: azul / oliva / prata */
  function applyScheme(scheme, silent) {
    let s = document.getElementById('mt-scheme-style');
    if (!s) { s = document.createElement('style'); s.id = 'mt-scheme-style'; document.head.appendChild(s); }
    if (scheme === 'oliva') {
      s.textContent = `#taskbar{background:linear-gradient(180deg,#b6c456 0%,#9aad3e 45%,#73852a 100%)!important}
        #start-btn{background:linear-gradient(180deg,#9bd246 0%,#7fbf1e 50%,#4e7e0a 100%)!important}
        .xp-titlebar{background:linear-gradient(180deg,#e9efc8 0,#e9efc8 1px,#8a9a3a 1px,#6f8128 50%,#5c6e1f 100%)!important}
        .sm-header{background:linear-gradient(180deg,#8a9a3a 0%,#6f8128 55%,#90a040 100%)!important}
        .sm-footer{background:linear-gradient(180deg,#9aad3e,#73852a)!important}
        #tray{background:linear-gradient(180deg,#86973a,#6c7e26 50%,#56661c)!important}
        .mt-allprog-fly{border-color:#6f8128!important}`;
    } else if (scheme === 'prata') {
      s.textContent = `#taskbar{background:linear-gradient(180deg,#d8d8e0 0%,#b8b8c4 45%,#8e8e9c 100%)!important}
        #start-btn{background:linear-gradient(180deg,#cfcfd8 0%,#a8a8b4 50%,#76767f 100%)!important;color:#222!important;text-shadow:none!important}
        .xp-titlebar{background:linear-gradient(180deg,#fbfbff 0,#fbfbff 1px,#a7a7b6 1px,#8c8c9d 50%,#76768a 100%)!important;color:#000!important}
        .sm-header{background:linear-gradient(180deg,#b6b6c2 0%,#8c8c9d 55%,#a4a4b2 100%)!important}
        .sm-footer{background:linear-gradient(180deg,#b8b8c4,#8e8e9c)!important}
        #tray{background:linear-gradient(180deg,#a8a8b4,#8e8e9c 50%,#76767f)!important}
        .mt-allprog-fly{border-color:#8c8c9d!important}`;
    } else { s.textContent = ''; }
  }

  function buildDisplay() {
    const thumbs = WALLPAPERS.map(w => {
      const url = WP_DIR + w.f;
      return `<div class="wp-thumb${url === dispSel ? ' sel' : ''}" data-url="${url}" title="${esc(w.n)}" style="background-image:url('${url}')" onclick="setWallpaper('${url}')"></div>`;
    }).join('');
    const body =
      `<div class="ax-body">` +
      `<div class="ax-tabs">` +
      `<div class="ax-tab active" onclick="dispTab(0)">Área de Trabalho</div>` +
      `<div class="ax-tab" onclick="dispTab(1)">Protetor de Tela</div>` +
      `<div class="ax-tab" onclick="dispTab(2)">Aparência</div>` +
      `</div>` +
      /* tab 0 */
      `<div class="ax-pane active">` +
      `<div class="disp-monitor"><div class="disp-screen" id="disp-preview" style="background-image:url('${dispSel}')"></div></div><div class="disp-stand"></div>` +
      `<div style="margin-top:10px">Plano de fundo:</div>` +
      `<div class="wp-grid">` +
      `<div class="wp-thumb${dispSel === WP_DEFAULT ? ' sel' : ''}" data-url="${WP_DEFAULT}" title="Padrão do Windows XP" style="background-image:url('${WP_DEFAULT}')" onclick="setWallpaper('${WP_DEFAULT}')"></div>` +
      `<div class="wp-thumb${dispSel === '__none__' ? ' sel' : ''}" data-url="__none__" title="Nenhum (cor sólida)" style="background:#3a6ea5;display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px" onclick="setWallpaper('__none__')">Nenhum</div>` +
      thumbs + `</div></div>` +
      /* tab 1 */
      `<div class="ax-pane"><div class="disp-monitor"><div class="disp-screen" style="background:#000"></div></div><div class="disp-stand"></div>` +
      `<div style="margin-top:12px">Protetor de tela:</div>` +
      `<select id="disp-saver" style="margin-top:6px;font-size:11px;padding:2px"><option>Campo de Estrelas</option><option>Tubos 3D</option><option>Matrix</option><option>(Nenhum)</option></select> ` +
      `<button class="ax-btn" style="margin-left:8px" onclick="dispPreviewSaver()">Visualizar</button>` +
      `<p style="margin-top:14px;color:#555">Aguardar: 1 minuto de inatividade. O protetor também pode ser ativado pelo menu.</p></div>` +
      /* tab 2 */
      `<div class="ax-pane"><div style="margin-bottom:10px">Esquema de cores (janelas e botões):</div>` +
      `<select id="disp-scheme" style="font-size:11px;padding:2px"><option value="azul">Padrão (Azul)</option><option value="oliva">Verde Oliva</option><option value="prata">Prata</option></select>` +
      `<p style="margin-top:14px;color:#555">O esquema muda a cor da barra de tarefas, do botão Iniciar e das barras de título, igual ao XP de verdade.</p></div>` +
      `<div class="ax-btnrow"><button class="ax-btn primary" onclick="dispOkClose()">OK</button>` +
      `<button class="ax-btn" onclick="closeWin('win-display')">Cancelar</button>` +
      `<button class="ax-btn" onclick="dispApply()">Aplicar</button></div>` +
      `</div>`;
    const w = makeWin('win-display', 'Propriedades de Vídeo', _ico('display-properties.png'), 420, 460, { body: body, top: 50, left: 200 });
    const sc = localStorage.getItem('mt_scheme'); if (sc) { const sel = document.getElementById('disp-scheme'); if (sel) sel.value = sc; }
    return w;
  }

  /* ════════════════ WORDPAD ════════════════ */
  function buildWordpad() {
    const fonts = ['Tahoma', 'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'].map(f => `<option>${f}</option>`).join('');
    const sizes = [1, 2, 3, 4, 5, 6, 7].map(s => `<option value="${s}">${[8, 10, 12, 14, 18, 24, 36][s - 1]}</option>`).join('');
    const body =
      `<div class="ax-body">` +
      `<div style="flex:none;display:flex;gap:4px;padding:4px 6px;background:#ece9d8;border-bottom:1px solid #aca899;align-items:center;flex-wrap:wrap">` +
      `<select onchange="document.execCommand('fontName',false,this.value);wpFocus()" style="font-size:11px">${fonts}</select>` +
      `<select onchange="document.execCommand('fontSize',false,this.value);wpFocus()" style="font-size:11px">${sizes}</select>` +
      `<button class="ax-btn" style="font-weight:bold;padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('bold')">N</button>` +
      `<button class="ax-btn" style="font-style:italic;padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('italic')">I</button>` +
      `<button class="ax-btn" style="text-decoration:underline;padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('underline')">S</button>` +
      `<input type="color" onchange="document.execCommand('foreColor',false,this.value)" title="Cor" style="width:26px;height:22px;padding:0;border:1px solid #999;cursor:pointer">` +
      `<button class="ax-btn" style="padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('justifyLeft')">⯇</button>` +
      `<button class="ax-btn" style="padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('justifyCenter')">≡</button>` +
      `<button class="ax-btn" style="padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('justifyRight')">⯈</button>` +
      `<button class="ax-btn" style="padding:2px 8px" onmousedown="event.preventDefault()" onclick="document.execCommand('insertUnorderedList')">•</button>` +
      `<button class="ax-btn" style="padding:2px 10px" onclick="wpSave()">💾 Salvar</button>` +
      `</div>` +
      `<div id="wp-editor" contenteditable="true" spellcheck="false" style="flex:1;background:#fff;padding:18px 24px;overflow:auto;font-family:Tahoma;font-size:13px;line-height:1.5;outline:none"></div>` +
      `<div style="flex:none;background:#ece9d8;border-top:1px solid #aca899;padding:2px 8px;color:#555">Pronto</div>` +
      `</div>`;
    makeWin('win-wordpad', 'Documento - WordPad', _ico('wordpad.webp'), 560, 440, { body: body, top: 50, left: 180 });
    const ed = document.getElementById('wp-editor');
    const saved = localStorage.getItem('mt_wordpad');
    ed.innerHTML = saved || '<h2 style="margin:0 0 8px">Bem-vindo ao WordPad</h2><p>Este é um editor de texto formatado de verdade. Experimente <b>negrito</b>, <i>itálico</i>, cores e fontes na barra acima. O que você escrever fica salvo no navegador.</p>';
  }
  window.wpFocus = function () { const e = document.getElementById('wp-editor'); if (e) e.focus(); };
  window.wpSave = function () { const e = document.getElementById('wp-editor'); if (e) { localStorage.setItem('mt_wordpad', e.innerHTML); click(); showNotif('📝 WordPad', 'Documento salvo.'); } };

  /* ════════════════ MAPA DE CARACTERES ════════════════ */
  function buildCharmap() {
    let cells = '';
    for (let c = 33; c < 33 + 220; c++) { const ch = String.fromCharCode(c); cells += `<div class="cm-cell" onclick="cmPick('${ch === "'" ? "\\'" : (ch === '\\' ? '\\\\' : ch)}')">${esc(ch)}</div>`; }
    const body =
      `<div class="ax-body" style="padding:10px">` +
      `<div style="margin-bottom:6px">Clique em um caractere para copiar:</div>` +
      `<div class="cm-grid" style="flex:1;overflow:auto">${cells}</div>` +
      `<div style="flex:none;display:flex;align-items:center;gap:8px;margin-top:8px">Selecionados: ` +
      `<input id="cm-out" style="flex:1;font-size:16px;padding:4px;border:1px solid #999" readonly>` +
      `<button class="ax-btn" onclick="cmCopy()">Copiar</button>` +
      `<button class="ax-btn" onclick="document.getElementById('cm-out').value=''">Limpar</button></div>` +
      `</div>`;
    makeWin('win-charmap', 'Mapa de Caracteres', _ico('charmap.png'), 440, 420, { body: body, top: 70, left: 240 });
  }
  window.cmPick = function (ch) { const o = document.getElementById('cm-out'); if (o) o.value += ch; click(); };
  window.cmCopy = function () {
    const o = document.getElementById('cm-out'); if (!o) return;
    try { navigator.clipboard.writeText(o.value); } catch (e) { o.select(); document.execCommand('copy'); }
    showNotif('🔤 Mapa de Caracteres', 'Copiado para a área de transferência.');
  };

  /* ════════════════ GRAVADOR DE SOM ════════════════ */
  let srTimer = null, srSec = 0, srState = 'idle';
  function buildSoundRec() {
    const bars = Array.from({ length: 14 }, () => '<div class="sr-bar" style="height:4px"></div>').join('');
    const body =
      `<div class="ax-body">` +
      `<div class="sr-wrap">` +
      `<div class="sr-vu" id="sr-vu">${bars}</div>` +
      `<div id="sr-time" style="font-family:monospace;font-size:22px;background:#000;color:#0f0;padding:4px 14px;border:2px inset #999">00:00</div>` +
      `<div class="sr-btns">` +
      `<button class="sr-rbtn" title="Gravar" onclick="srRec()" style="color:#c00">●</button>` +
      `<button class="sr-rbtn" title="Parar" onclick="srStop()">■</button>` +
      `<button class="sr-rbtn" title="Reproduzir" onclick="srPlay()" style="color:#080">▶</button>` +
      `</div>` +
      `<div id="sr-status" style="color:#555">Pronto para gravar</div>` +
      `</div></div>`;
    makeWin('win-soundrec', 'Gravador de Som', _ico('sound-recorder.png'), 320, 280, { body: body, top: 90, left: 280 });
  }
  function srTick() {
    const vu = document.getElementById('sr-vu'); if (!vu) return;
    vu.querySelectorAll('.sr-bar').forEach(b => { b.style.height = (srState === 'rec' ? 6 + Math.random() * 50 : 4) + 'px'; b.style.background = srState === 'rec' ? '#3a9c00' : '#9a9a9a'; });
  }
  function srFmt() { const m = String(Math.floor(srSec / 60)).padStart(2, '0'), s = String(srSec % 60).padStart(2, '0'); const t = document.getElementById('sr-time'); if (t) t.textContent = m + ':' + s; }
  window.srRec = function () { click(); srState = 'rec'; clearInterval(srTimer); const stx = document.getElementById('sr-status'); if (stx) stx.textContent = '🔴 Gravando...'; srTimer = setInterval(() => { srSec++; srFmt(); srTick(); }, 1000); srTick(); };
  window.srStop = function () { click(); srState = 'idle'; clearInterval(srTimer); srTick(); const stx = document.getElementById('sr-status'); if (stx) stx.textContent = 'Parado (' + srSec + 's gravados)'; };
  window.srPlay = function () { click(); if (srSec === 0) { showNotif('🎙️ Gravador', 'Nada gravado ainda.'); return; } srState = 'play'; const stx = document.getElementById('sr-status'); if (stx) stx.textContent = '▶ Reproduzindo...'; let p = 0; clearInterval(srTimer); srTimer = setInterval(() => { p++; srTick(); if (p >= srSec) { clearInterval(srTimer); srState = 'idle'; srTick(); if (stx) stx.textContent = 'Pronto'; } }, 1000); };

  /* ════════════════ MEU COMPUTADOR (Explorer) ════════════════ */
  const EXP_PLACES = {
    root: { title: 'Meu Computador', items: [
      { ico: '💽', n: 'Disco Local (C:)', go: 'c' },
      { ico: '💿', n: 'Unidade de CD (D:)', act: () => openWindow('win-cdrom') },
      { ico: '📁', n: 'Meus Documentos', act: () => openWindow('win-mydocs') },
      { ico: '🗑️', n: 'Lixeira', act: () => openWindow('win-recycle') },
      { ico: '⚙️', n: 'Painel de Controle', act: () => openWindow('win-ctrlpanel') }
    ]},
    c: { title: 'Disco Local (C:)', items: [
      { ico: '📁', n: 'Arquivos de Programas', go: 'prog' },
      { ico: '📁', n: 'WINDOWS', go: 'win' },
      { ico: '📁', n: 'Documents and Settings', act: () => openWindow('win-mydocs') },
      { ico: '📄', n: 'AUTOEXEC.BAT', act: () => showNotif('📄 AUTOEXEC.BAT', '@echo off  rem nada pra ver aqui') },
      { ico: '📄', n: 'boot.ini', act: () => showNotif('📄 boot.ini', 'multi(0)disk(0)rdisk(0)partition(1)\\WINDOWS') }
    ]},
    prog: { title: 'Arquivos de Programas', items: [
      { ico: '🌐', n: 'Google Chrome', act: () => openWindow('win-about') },
      { ico: '📝', n: 'Notepad++', act: () => openWindow('win-npp') },
      { ico: '🎵', n: 'Windows Media Player', act: () => { try { toggleWMP(); } catch (e) {} } },
      { ico: '🎮', n: 'Jogos', go: 'games' }
    ]},
    win: { title: 'WINDOWS', items: [
      { ico: '🎨', n: 'Paint', act: () => openWindow('win-paint') },
      { ico: '🧮', n: 'Calculadora', act: () => openWindow('win-calc') },
      { ico: '⌨️', n: 'Prompt de Comando', act: () => openWindow('win-cmd') },
      { ico: '🖼️', n: 'system32', act: () => showNotif('📁 system32', 'Acesso negado. (brincadeira, não tem nada aqui)') }
    ]},
    games: { title: 'Jogos', items: [
      { ico: '💣', n: 'Campo Minado', act: () => openWindow('win-mine') },
      { ico: '🃏', n: 'Paciência', act: () => openWindow('win-solitaire') },
      { ico: '🎴', n: 'FreeCell', act: () => openWindow('win-freecell') },
      { ico: '🌌', n: 'Pinball', act: () => openWindow('win-pinball') },
      { ico: '⛏️', n: 'Minecraft', act: () => openWindow('win-minecraft') }
    ]}
  };
  function buildExplorer() {
    const body =
      `<div class="ax-body">` +
      `<div style="flex:none;display:flex;gap:6px;padding:4px 8px;background:#ece9d8;border-bottom:1px solid #aca899;align-items:center">` +
      `<button class="ax-btn" onclick="expGo('root')">⬆ Acima</button>` +
      `<span id="exp-path" style="margin-left:6px;color:#333">Meu Computador</span></div>` +
      `<div class="exp-wrap"><div class="exp-side">` +
      `<h4>Tarefas do sistema</h4>` +
      `<div class="exp-link" onclick="openWindow('win-ctrlpanel')">Painel de Controle</div>` +
      `<div class="exp-link" onclick="openWindow('win-sysprop')">Ver informações do sistema</div>` +
      `<h4 style="margin-top:10px">Outros locais</h4>` +
      `<div class="exp-link" onclick="openWindow('win-mydocs')">Meus Documentos</div>` +
      `<div class="exp-link" onclick="openWindow('win-recycle')">Lixeira</div>` +
      `</div><div class="exp-main" id="exp-main"></div></div></div>`;
    makeWin('win-meucomp', 'Meu Computador', _ico('meu-computador.webp'), 560, 400, { body: body, top: 50, left: 150 });
    window.expGo('root');
  }
  window.expGo = function (key) {
    const place = EXP_PLACES[key]; if (!place) return; click();
    const main = document.getElementById('exp-main'); const path = document.getElementById('exp-path');
    if (path) path.textContent = place.title;
    if (!main) return;
    main.innerHTML = place.items.map((it, i) =>
      `<div class="exp-item" data-i="${i}"><div class="ico">${it.ico}</div><div>${esc(it.n)}</div></div>`).join('');
    main.querySelectorAll('.exp-item').forEach(el => {
      el.addEventListener('dblclick', () => { const it = place.items[+el.dataset.i]; if (it.go) window.expGo(it.go); else if (it.act) it.act(); });
      el.addEventListener('click', () => { main.querySelectorAll('.exp-item').forEach(x => x.style.background = ''); el.style.background = '#cde0fc'; });
    });
  };

  /* ════════════════ INTERNET EXPLORER 6 ════════════════ */
  function buildIE6() {
    const body =
      `<div class="ax-body" style="background:#fff">` +
      `<div style="flex:none;background:#ece9d8;border-bottom:1px solid #aca899;font-size:11px;padding:2px 6px">Arquivo&nbsp;&nbsp;Editar&nbsp;&nbsp;Exibir&nbsp;&nbsp;Favoritos&nbsp;&nbsp;Ferramentas&nbsp;&nbsp;Ajuda</div>` +
      `<div style="flex:none;display:flex;gap:6px;align-items:center;padding:5px 8px;background:linear-gradient(180deg,#f4f3ee,#e3e0d3);border-bottom:1px solid #aca899">` +
      `<button class="ax-btn" onclick="ie6Back()" style="padding:2px 8px">⬅ Voltar</button>` +
      `<button class="ax-btn" onclick="ie6Reload()" style="padding:2px 8px">↻</button>` +
      `<button class="ax-btn" onclick="ie6Go('http://www.msn.com.br')" style="padding:2px 8px">🏠</button>` +
      `<span style="margin-left:6px">Endereço:</span>` +
      `<input id="ie6-addr" value="http://www.msn.com.br" spellcheck="false" style="flex:1;font-size:12px;padding:3px 6px;border:1px solid #7f9db9" onkeydown="if(event.key==='Enter')ie6Go(this.value)">` +
      `<button class="ax-btn" onclick="ie6Go(document.getElementById('ie6-addr').value)" style="padding:2px 10px">Ir</button>` +
      `</div>` +
      `<div id="ie6-view" style="flex:1;position:relative;overflow:hidden;background:#fff"></div>` +
      `<div style="flex:none;background:#ece9d8;border-top:1px solid #aca899;font-size:11px;padding:2px 8px" id="ie6-status">Concluído</div>` +
      `</div>`;
    makeWin('win-ie6', 'MSN Brasil - Microsoft Internet Explorer', '🌐', 640, 480, { body: body, top: 40, left: 110 });
    ie6Home();
  }
  function ie6Home() {
    const v = document.getElementById('ie6-view'); if (!v) return;
    v.innerHTML =
      `<div style="height:100%;overflow:auto;font-family:Arial,sans-serif">` +
      `<div style="background:linear-gradient(180deg,#0a4abf,#1e63d6);color:#fff;padding:10px 16px;font-size:22px;font-weight:bold">msn<sup style="font-size:11px">br</sup> <span style="font-size:12px;font-weight:normal;float:right;margin-top:8px">${new Date().toLocaleDateString('pt-BR')}</span></div>` +
      `<div style="display:flex">` +
      `<div style="width:150px;background:#eef3fb;padding:10px;font-size:12px;line-height:2">` +
      `<b>Canais</b><br><a href="javascript:void(0)" onclick="ie6Go('http://www.uol.com.br')" style="color:#0033cc">Notícias</a><br>` +
      `<a href="javascript:void(0)" onclick="ie6Go('http://www.terra.com.br')" style="color:#0033cc">Esportes</a><br>` +
      `<a href="javascript:void(0)" onclick="ie6Go('http://www.orkut.com')" style="color:#0033cc">Orkut</a><br>` +
      `<a href="javascript:void(0)" onclick="chromeOpenExternalIE('https://pt.wikipedia.org/wiki/MSN')" style="color:#0033cc">Enciclopédia</a></div>` +
      `<div style="flex:1;padding:14px">` +
      `<h2 style="color:#1e63d6;margin-bottom:8px">Bem-vindo ao MSN Brasil</h2>` +
      `<p style="font-size:13px;line-height:1.6">Este é o Internet Explorer 6, o navegador que vinha com o Windows XP. Digite um endereço na barra acima. Sites que permitem incorporação carregam aqui; os demais mostram a clássica tela de erro do IE.</p>` +
      `<ul style="font-size:13px;line-height:1.8;margin-top:10px;color:#0033cc">` +
      `<li><a href="javascript:void(0)" onclick="ie6Go('pt.wikipedia.org/wiki/Windows_XP')" style="color:#0033cc">Windows XP completa 25 anos de saudade</a></li>` +
      `<li><a href="javascript:void(0)" onclick="ie6Go('www.google.com')" style="color:#0033cc">Novo buscador Google ganha popularidade</a></li>` +
      `<li><a href="javascript:void(0)" onclick="ie6Go('www.orkut.com')" style="color:#0033cc">Orkut é a febre do momento</a></li>` +
      `</ul></div></div></div>`;
    const a = document.getElementById('ie6-addr'); if (a) a.value = 'http://www.msn.com.br';
    ie6Push('http://www.msn.com.br');
  }
  let ie6Hist = [], ie6Pos = -1;
  function ie6Push(u) { ie6Hist = ie6Hist.slice(0, ie6Pos + 1); ie6Hist.push(u); ie6Pos = ie6Hist.length - 1; }
  window.chromeOpenExternalIE = function (u) { window.open(u, '_blank', 'noopener'); };
  window.ie6Back = function () { click(); if (ie6Pos > 0) { ie6Pos--; const u = ie6Hist[ie6Pos]; if (u === 'http://www.msn.com.br') ie6Home(); else ie6Load(u, false); } };
  window.ie6Reload = function () { click(); if (ie6Pos >= 0) { const u = ie6Hist[ie6Pos]; if (u === 'http://www.msn.com.br') ie6Home(); else ie6Load(u, false); } };
  window.ie6Go = function (raw) {
    raw = (raw || '').trim(); if (!raw) return; click();
    if (/msn\.com\.br$/.test(raw.replace(/^https?:\/\//, '').replace(/\/$/, ''))) { ie6Home(); return; }
    ie6Load(raw, true);
  };
  function ie6Load(raw, push) {
    const url = /^https?:\/\//i.test(raw) ? raw : 'http://' + raw;
    const host = url.replace(/^https?:\/\//, '').split('/')[0];
    const v = document.getElementById('ie6-view'); if (!v) return;
    const a = document.getElementById('ie6-addr'); if (a) a.value = url;
    const stx = document.getElementById('ie6-status'); if (stx) stx.textContent = 'Abrindo ' + host + '...';
    if (push) ie6Push(url);
    v.innerHTML = `<iframe referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" style="width:100%;height:100%;border:0;background:#fff"></iframe>`;
    const fr = v.querySelector('iframe');
    let done = false;
    const fail = () => { if (done) return; done = true; ie6Err(host, url); };
    const ok = () => { if (done) return; done = true; if (stx) stx.textContent = 'Concluído'; };
    fr.addEventListener('load', () => { try { const h = fr.contentWindow.location.href; if (!h || h === 'about:blank') { fail(); return; } ok(); } catch (e) { ok(); } });
    fr.addEventListener('error', fail);
    setTimeout(() => { if (!done) fail(); }, 5000);
    fr.src = url;
  }
  function ie6Err(host, url) {
    const v = document.getElementById('ie6-view'); if (!v) return;
    const stx = document.getElementById('ie6-status'); if (stx) stx.textContent = 'Concluído';
    v.innerHTML =
      `<div style="height:100%;overflow:auto;padding:26px 34px;font-family:'Times New Roman',serif;background:#fff">` +
      `<div style="font-size:40px;float:left;margin:0 16px 8px 0">🦕</div>` +
      `<h2 style="font-size:20px;margin-bottom:10px">A página não pode ser exibida</h2>` +
      `<p style="font-size:13px">Não foi possível abrir <b>${esc(host)}</b> dentro do Internet Explorer. O site recusou a conexão incorporada (X-Frame-Options / CSP), comum em sites grandes.</p>` +
      `<hr style="margin:14px 0;border:0;border-top:1px solid #aaa">` +
      `<p style="font-size:13px">Tente: clicar em <b>↻</b>, conferir o endereço, ou <a href="${esc(url)}" target="_blank" rel="noopener">abrir em uma janela real</a>.</p>` +
      `</div>`;
  }

  /* ════════════════ FREECELL ════════════════ */
  const FC_S = ['♠', '♥', '♦', '♣'], FC_RED = ['♥', '♦'];
  let fcFree = [null, null, null, null], fcFound = [[], [], [], []], fcCols = [], fcSel = null;
  function fcNew() {
    let deck = [];
    FC_S.forEach(s => { for (let v = 0; v < 13; v++) deck.push({ s: s, v: v }); });
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[deck[i], deck[j]] = [deck[j], deck[i]]; }
    fcFree = [null, null, null, null]; fcFound = [[], [], [], []]; fcCols = [[], [], [], [], [], [], [], []]; fcSel = null;
    deck.forEach((c, i) => fcCols[i % 8].push(c));
    fcRender();
  }
  const fcLabel = v => ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][v];
  function fcCardEl(c, onclick) {
    const el = document.createElement('div'); el.className = 'sol-card' + (FC_RED.includes(c.s) ? ' sol-red' : '');
    el.innerHTML = `<div class="sol-card-tl">${fcLabel(c.v)}<br>${c.s}</div><div class="sol-card-ctr">${c.s}</div><div class="sol-card-br">${fcLabel(c.v)}<br>${c.s}</div>`;
    if (onclick) el.addEventListener('click', onclick);
    return el;
  }
  function fcRender() {
    for (let i = 0; i < 4; i++) {
      const cell = document.getElementById('fc-free' + i); if (cell) { cell.innerHTML = ''; if (fcFree[i]) { const e = fcCardEl(fcFree[i], () => fcClickSrc({ t: 'free', i: i })); if (fcSel && fcSel.t === 'free' && fcSel.i === i) e.classList.add('sol-sel'); cell.appendChild(e); } }
      const fnd = document.getElementById('fc-found' + i); if (fnd) { fnd.innerHTML = fcFound[i].length ? '' : `<span style="opacity:.5">${FC_S[i]}</span>`; if (fcFound[i].length) fnd.appendChild(fcCardEl(fcFound[i][fcFound[i].length - 1], () => {})); }
    }
    for (let c = 0; c < 8; c++) {
      const col = document.getElementById('fc-col' + c); if (!col) continue; col.innerHTML = '';
      fcCols[c].forEach((card, r) => {
        const last = r === fcCols[c].length - 1;
        const e = fcCardEl(card, () => fcClickSrc({ t: 'col', i: c }));
        e.style.position = 'absolute'; e.style.top = (r * 22) + 'px'; e.style.left = '0'; e.style.right = '0';
        if (!last) e.style.pointerEvents = 'none';
        if (fcSel && fcSel.t === 'col' && fcSel.i === c && last) e.classList.add('sol-sel');
        col.appendChild(e);
      });
      col.onclick = (ev) => { if (ev.target === col) fcClickDest({ t: 'col', i: c }); };
    }
  }
  function fcTopCard(src) { if (src.t === 'free') return fcFree[src.i]; if (src.t === 'col') { const p = fcCols[src.i]; return p[p.length - 1]; } return null; }
  function fcClickSrc(src) {
    click();
    if (!fcSel) { fcSel = src; fcRender(); return; }
    if (fcSel.t === src.t && fcSel.i === src.i) { fcSel = null; fcRender(); return; }
    fcClickDest(src);
  }
  function fcClickDest(dest) {
    if (!fcSel) { if (dest.t === 'col') { fcSel = dest; fcRender(); } return; }
    const card = fcTopCard(fcSel); if (!card) { fcSel = null; fcRender(); return; }
    let moved = false;
    if (dest.t === 'col') { if (fcCanCol(card, dest.i)) { fcRemoveTop(fcSel); fcCols[dest.i].push(card); moved = true; } }
    fcSel = null; if (moved) { fcAutoFound(); fcRender(); fcCheckWin(); } else fcRender();
  }
  window.fcToFree = function (i) {
    click(); if (!fcSel) { return; }
    if (fcFree[i]) { fcSel = null; fcRender(); return; }
    const card = fcTopCard(fcSel); if (!card) return;
    fcRemoveTop(fcSel); fcFree[i] = card; fcSel = null; fcRender();
  };
  window.fcToFound = function (i) {
    click(); if (!fcSel) return;
    const card = fcTopCard(fcSel); if (!card) return;
    if (fcCanFound(card, i)) { fcRemoveTop(fcSel); fcFound[i].push(card); fcSel = null; fcRender(); fcCheckWin(); }
    else { fcSel = null; fcRender(); }
  };
  function fcRemoveTop(src) { if (src.t === 'free') fcFree[src.i] = null; else if (src.t === 'col') fcCols[src.i].pop(); }
  function fcCanCol(card, c) { const p = fcCols[c]; if (!p.length) return true; const t = p[p.length - 1]; return t.v === card.v + 1 && FC_RED.includes(t.s) !== FC_RED.includes(card.s); }
  function fcCanFound(card, i) { const p = fcFound[i]; if (!p.length) return card.v === 0 && FC_S[i] === card.s; const t = p[p.length - 1]; return t.s === card.s && card.v === t.v + 1; }
  function fcAutoFound() { let any = true; while (any) { any = false; for (let c = 0; c < 8; c++) { const p = fcCols[c]; if (!p.length) continue; const card = p[p.length - 1]; const minF = Math.min(...fcFound.map(f => f.length ? f[f.length - 1].v : -1)); for (let i = 0; i < 4; i++) { if (FC_S[i] === card.s && fcCanFound(card, i) && card.v <= minF + 2) { p.pop(); fcFound[i].push(card); any = true; break; } } } } }
  function fcCheckWin() { if (fcFound.every(f => f.length === 13)) { try { playTone('sine', 784, 0.3, 0.13); } catch (e) {} showNotif('🎴 FreeCell', 'Você venceu! Parabéns!'); } }
  function buildFreeCell() {
    const free = [0, 1, 2, 3].map(i => `<div class="fc-cell" id="fc-free${i}" onclick="fcToFree(${i})"></div>`).join('');
    const found = [0, 1, 2, 3].map(i => `<div class="fc-found" id="fc-found${i}" onclick="fcToFound(${i})">${FC_S[i]}</div>`).join('');
    const cols = Array.from({ length: 8 }, (_, c) => `<div class="fc-col" id="fc-col${c}"></div>`).join('');
    const body =
      `<div class="ax-body" style="background:#1a6b1a">` +
      `<div class="mine-menu" style="position:relative"><span onclick="fcNewMenu()">Novo jogo</span><span onclick="fcHelp()">Ajuda</span></div>` +
      `<div class="fc-top">${free}<div style="flex:1"></div>${found}</div>` +
      `<div class="fc-cols">${cols}</div>` +
      `<div style="flex:none;padding:6px 10px;color:#bff5bf;font-size:11px">Clique numa carta e depois no destino. As bases preenchem sozinhas.</div>` +
      `</div>`;
    makeWin('win-freecell', 'FreeCell', _ico('freecell.png'), 620, 500, { body: body, top: 40, left: 120 });
    fcNew();
  }
  window.fcNewMenu = function () { fcNew(); click(); };
  window.fcHelp = function () { showNotif('🎴 FreeCell', 'Monte sequências decrescentes de cores alternadas. Use as 4 células livres como apoio. Leve A->K para as bases.'); };

  /* ════════════════ AVAST! ANTIVÍRUS ════════════════ */
  /* ícone real do avast! (logo laranja de 2010, baixado do Wikimedia Commons) */
  const AV_ICON = 'src/img/system/avast-icon.svg';
  function avico(px) { return '<img src="' + AV_ICON + '" style="width:' + px + 'px;height:' + px + 'px;vertical-align:middle">'; }
  /* Bloqueios de URL (Módulo de rede) — igual à notificação vermelha real */
  const AV_URLBLOCKS = [
    { obj: 'http://escolafrancisco.com/new/js.pac', inf: 'URL:Mal', proc: 'C:\\Windows\\system32\\svchost.exe' },
    { obj: 'http://baixaki-gratis-premiado.biz/setup.exe', inf: 'URL:Mal', proc: 'C:\\Arquivos de Programas\\Internet Explorer\\iexplore.exe' },
    { obj: 'http://orkut-voce-ganhou.com/premio.php', inf: 'URL:Phishing', proc: 'C:\\Arquivos de Programas\\Mozilla Firefox\\firefox.exe' },
    { obj: 'http://msn-emoticons-gratis.net/install.cab', inf: 'URL:Mal', proc: 'C:\\Arquivos de Programas\\MSN Messenger\\msnmsgr.exe' }
  ];
  /* Ameaças de arquivo (encontradas na verificação) */
  const AV_FILEBLOCKS = [
    { title: 'AMEAÇA DETECTADA', sub: 'Um vírus foi encontrado e movido para o Baú de Vírus.', obj: 'C:\\LimeWire\\Shared\\Avril_Lavigne-Girlfriend.mp3.exe', inf: 'Win32:Trojan-gen [Trj]', proc: 'C:\\Arquivos de Programas\\LimeWire\\LimeWire.exe' },
    { title: 'AMEAÇA DETECTADA', sub: 'Um vírus foi encontrado e movido para o Baú de Vírus.', obj: 'C:\\Downloads\\foto_da_festa.jpg.scr', inf: 'Win32:MSN-Worm [Wrm]', proc: 'C:\\Arquivos de Programas\\MSN Messenger\\msnmsgr.exe' },
    { title: 'AMEAÇA DETECTADA', sub: 'Um vírus foi encontrado e movido para o Baú de Vírus.', obj: 'C:\\Downloads\\crack_windows_xp.exe', inf: 'Win32:Keylog-gen', proc: 'C:\\Arquivos de Programas\\Internet Explorer\\iexplore.exe' }
  ];

  function avInjectCss() {
    if (document.getElementById('mt-avast-css')) return;
    const s = document.createElement('style'); s.id = 'mt-avast-css';
    s.textContent = `
    /* ---- notificação vermelha (toast) ---- */
    .av-toast{position:fixed;right:10px;bottom:44px;width:332px;z-index:99996;
      background:linear-gradient(150deg,#ec3f31 0%,#c61f1f 38%,#8c1010 74%,#690808 100%);
      border:1px solid #5a0606;border-radius:3px;color:#fff;font-family:Tahoma,Arial,sans-serif;
      padding:11px 13px 13px;overflow:hidden;
      box-shadow:0 7px 24px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.28);
      transform:translateX(370px);transition:transform .38s cubic-bezier(.18,.84,.26,1)}
    .av-toast.on{transform:translateX(0)}
    .av-toast::before{content:'';position:absolute;top:0;left:0;right:0;height:46%;
      background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0));pointer-events:none}
    .av-toast-ctrls{position:absolute;top:4px;right:5px;display:flex;gap:4px;z-index:3}
    .av-tc{width:14px;height:14px;line-height:12px;text-align:center;font-size:10px;cursor:pointer;color:#fff;
      background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.32);border-radius:2px}
    .av-tc:hover{background:rgba(0,0,0,.42)}
    .av-toast-title{position:relative;z-index:1;font-size:16px;font-weight:bold;letter-spacing:.3px;
      text-shadow:0 1px 2px rgba(0,0,0,.45);margin:2px 0 4px;padding-right:18px}
    .av-toast-sub{position:relative;z-index:1;font-size:11px;margin-bottom:11px;max-width:238px;
      text-shadow:0 1px 1px rgba(0,0,0,.3)}
    .av-toast-fields{position:relative;z-index:1;font-size:10px;line-height:1.75;max-width:252px}
    .av-tf-row{display:flex;gap:6px}
    .av-tf-l{color:#ffd9d6;width:56px;flex:none}
    .av-tf-v{color:#fff;word-break:break-all;text-shadow:0 1px 1px rgba(0,0,0,.3)}
    .av-toast-foot{position:relative;z-index:1;margin-top:12px}
    .av-toast-btn{font-family:Tahoma;font-size:11px;color:#fff;cursor:pointer;padding:5px 13px;border-radius:4px;
      background:linear-gradient(180deg,rgba(70,2,2,.55),rgba(20,0,0,.6));
      border:1px solid rgba(255,255,255,.38);box-shadow:inset 0 1px 0 rgba(255,255,255,.2)}
    .av-toast-btn:hover{background:linear-gradient(180deg,rgba(100,4,4,.62),rgba(40,0,0,.66))}
    .av-toast-logo{position:absolute;right:9px;bottom:9px;z-index:1;text-align:center;opacity:.96}
    .av-ball{display:block;width:42px;height:42px;margin:0 auto;border-radius:50%;color:#fff;
      background:radial-gradient(circle at 34% 28%,#ffd680 0%,#ff8d1f 46%,#e96a00 76%,#b35000 100%);
      box-shadow:0 2px 5px rgba(0,0,0,.45),inset 0 1px 2px rgba(255,255,255,.6);
      font:italic bold 26px/42px Arial,sans-serif;text-shadow:0 1px 2px rgba(150,70,0,.7)}
    .av-toast-brand{display:block;margin-top:2px;font:italic bold 11px Tahoma;color:#ffb059;text-shadow:0 1px 1px rgba(0,0,0,.4)}
    /* ---- janela do antivírus ---- */
    .avx-wrap{position:absolute;inset:28px 0 0 0;display:flex;background:#e9eef3;font-family:Tahoma,sans-serif;font-size:11px;overflow:hidden}
    .avx-side{width:152px;flex:none;display:flex;flex-direction:column;color:#cdd3da;padding-top:8px;
      background:linear-gradient(180deg,#2c3037,#1b1e23)}
    .avx-logo{display:flex;align-items:center;gap:7px;padding:6px 10px 12px;font:italic bold 16px Tahoma;color:#fff}
    .avx-logo .av-ball{width:24px;height:24px;font-size:15px;line-height:24px;margin:0}
    .avx-nav{display:flex;flex-direction:column;gap:1px}
    .avx-nav div{padding:8px 12px;cursor:pointer;border-left:3px solid transparent}
    .avx-nav div:hover{background:#33373f}
    .avx-nav div.act{background:#3a3f48;border-left-color:#ff7a00;color:#fff}
    .avx-ver{margin-top:auto;padding:10px;font-size:9px;color:#7d838b}
    .avx-main{flex:1;display:flex;flex-direction:column;background:#eef2f6;overflow:hidden}
    .avx-head{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #c3ccd6;
      background:linear-gradient(180deg,#fff,#e3e9ef)}
    .avx-shield{font-size:38px;line-height:1}
    .avx-head h3{margin:0;font-size:15px;color:#2a7d12}
    .avx-head p{margin:2px 0 0;color:#555}
    .avx-body{flex:1;padding:16px;overflow:auto}
    .avx-card{background:#fff;border:1px solid #d2dae3;border-radius:4px;padding:12px 14px;margin-bottom:12px}
    .avx-card h4{margin:0 0 8px;font-size:12px;color:#333}
    .avx-row{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #e4e4e4}
    .avx-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}
    .avx-btn{font:bold 12px Tahoma;color:#fff;border:none;border-radius:4px;cursor:pointer;padding:8px 16px;
      background:linear-gradient(180deg,#ff9a33,#ff7a00 60%,#e56a00);box-shadow:0 1px 2px rgba(0,0,0,.25)}
    .avx-btn:hover{filter:brightness(1.06)} .avx-btn:active{filter:brightness(.94)}
    .avx-btn.sec{background:linear-gradient(180deg,#e0e6ec,#c6cfd9);color:#333}
    .avx-prog{display:none;margin-top:12px}
    .avx-prog.on{display:block}
    .avx-bar{height:16px;background:#d8dee6;border:1px solid #aeb8c3;border-radius:3px;overflow:hidden}
    .avx-bar > i{display:block;height:100%;width:0;background:linear-gradient(180deg,#86d653,#46a800);transition:width .14s}
    .avx-file{margin-top:6px;height:13px;font-size:10px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    `;
    document.head.appendChild(s);
  }

  /* toca o som real do avast! adicionado em src/sounds */
  window.avastPlaySound = function () {
    try { const a = new Audio('src/sounds/avast-ameaca-detectada.mp3'); a.volume = 0.85; a.play().catch(() => {}); } catch (e) {}
  };

  /* mostra a notificação vermelha (toast) e toca o som */
  let avToastTimer = null;
  window.avastNotify = function (data) {
    avInjectCss();
    data = data || AV_URLBLOCKS[Math.floor(Math.random() * AV_URLBLOCKS.length)];
    let t = document.getElementById('av-toast');
    if (!t) {
      t = document.createElement('div'); t.className = 'av-toast'; t.id = 'av-toast';
      t.innerHTML =
        `<div class="av-toast-ctrls"><span class="av-tc" onclick="avastToastClose()" title="Fechar">✕</span></div>` +
        `<div class="av-toast-title" id="av-toast-title"></div>` +
        `<div class="av-toast-sub" id="av-toast-sub"></div>` +
        `<div class="av-toast-fields">` +
        `<div class="av-tf-row"><span class="av-tf-l">Objeto:</span><span class="av-tf-v" id="av-tf-obj"></span></div>` +
        `<div class="av-tf-row"><span class="av-tf-l">Infecção:</span><span class="av-tf-v" id="av-tf-inf"></span></div>` +
        `<div class="av-tf-row"><span class="av-tf-l">Processo:</span><span class="av-tf-v" id="av-tf-proc"></span></div>` +
        `</div>` +
        `<div class="av-toast-foot"><button class="av-toast-btn" onclick="avastMoreDetails()">Mais detalhes... &gt;&gt;</button></div>` +
        `<div class="av-toast-logo"><img src="${AV_ICON}" style="width:40px;height:40px;display:block;margin:0 auto;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))"><span class="av-toast-brand">avast!</span></div>`;
      document.body.appendChild(t);
    }
    document.getElementById('av-toast-title').textContent = data.title || 'URL MALICIOSA BLOQUEADO';
    document.getElementById('av-toast-sub').textContent = data.sub || 'O Módulo de rede do avast! bloqueou um site nocivo.';
    document.getElementById('av-tf-obj').textContent = data.obj;
    document.getElementById('av-tf-inf').textContent = data.inf;
    document.getElementById('av-tf-proc').textContent = data.proc;
    /* reinicia a animação de entrada */
    t.classList.remove('on'); void t.offsetWidth; t.classList.add('on');
    window.avastPlaySound();
    if (avToastTimer) clearTimeout(avToastTimer);
    avToastTimer = setTimeout(() => { const el = document.getElementById('av-toast'); if (el) el.classList.remove('on'); }, 9000);
  };
  window.avastToastClose = function () { const t = document.getElementById('av-toast'); if (t) t.classList.remove('on'); if (avToastTimer) clearTimeout(avToastTimer); click(); };
  window.avastMoreDetails = function () { click(); window.openApp('win-avast'); };

  /* janela principal do antivírus */
  function buildAvast() {
    avInjectCss();
    const body =
      `<div class="avx-wrap">` +
      `<div class="avx-side">` +
      `<div class="avx-logo"><img src="${AV_ICON}" style="width:26px;height:26px;vertical-align:middle">avast!</div>` +
      `<div class="avx-nav">` +
      `<div class="act">Resumo</div>` +
      `<div onclick="avastScan()">Verificar computador</div>` +
      `<div onclick="avastShowVault()">Baú de vírus</div>` +
      `<div>Proteção em tempo real</div>` +
      `</div>` +
      `<div class="avx-ver">avast! Antivírus<br>Home Edition 5.0</div>` +
      `</div>` +
      `<div class="avx-main">` +
      `<div class="avx-head"><div class="avx-shield" id="avx-shield">🛡️</div>` +
      `<div><h3 id="avx-stat-t">Você está protegido</h3><p id="avx-stat-p">Todos os escudos estão ativos e funcionando.</p></div></div>` +
      `<div class="avx-body">` +
      `<div class="avx-card"><h4>Resumo da proteção</h4>` +
      `<div class="avx-row"><span>Última verificação</span><b>Hoje</b></div>` +
      `<div class="avx-row"><span>Versão do programa</span><b>5.0.594</b></div>` +
      `<div class="avx-row"><span>Versão das definições</span><b>100601-0</b></div>` +
      `<div class="avx-row" style="border:none"><span>Arquivos verificados</span><b>34.812</b></div>` +
      `<div class="avx-actions">` +
      `<button class="avx-btn" onclick="avastScan()">🔍 Verificação rápida</button>` +
      `<button class="avx-btn sec" onclick="avastNotify()">🌐 Testar bloqueio de URL</button>` +
      `</div>` +
      `<div class="avx-prog" id="avx-prog"><div class="avx-bar"><i id="avx-bar-i"></i></div><div class="avx-file" id="avx-file"></div></div>` +
      `</div>` +
      `<div class="avx-card" id="avx-vault" style="display:none"><h4>🔒 Baú de Vírus (Quarentena)</h4>` +
      `<div id="avx-vault-list" style="color:#555;line-height:1.9"></div></div>` +
      `</div></div></div>`;
    makeWin('win-avast', 'avast! Antivírus', avico(16), 580, 430, { body: body, top: 46, left: 150 });
  }

  let avScanning = false; const avVault = [];
  window.avastScan = function () {
    if (avScanning) return;
    avInjectCss(); avScanning = true; click();
    const prog = document.getElementById('avx-prog'), bar = document.getElementById('avx-bar-i'), file = document.getElementById('avx-file');
    if (!prog) { avScanning = false; return; }
    prog.classList.add('on'); bar.style.width = '0%';
    const files = ['C:\\Windows\\System32\\kernel32.dll', 'C:\\Windows\\explorer.exe', 'C:\\Arquivos de Programas\\MSN Messenger\\msnmsgr.exe', 'C:\\Meus Documentos\\trabalho.doc', 'C:\\Windows\\system32\\drivers\\etc\\hosts', 'C:\\LimeWire\\Shared\\musica.mp3'];
    let pct = 0;
    const iv = setInterval(() => {
      pct += 3 + Math.random() * 6; if (pct > 100) pct = 100;
      bar.style.width = pct.toFixed(0) + '%';
      file.textContent = 'Verificando: ' + files[Math.floor(Math.random() * files.length)];
      if (pct >= 100) {
        clearInterval(iv); avScanning = false;
        const threat = AV_FILEBLOCKS[Math.floor(Math.random() * AV_FILEBLOCKS.length)];
        file.textContent = 'Verificação concluída. 1 ameaça encontrada e isolada.';
        const st = document.getElementById('avx-stat-t'), sp = document.getElementById('avx-stat-p'), sh = document.getElementById('avx-shield');
        if (st) { st.textContent = 'Ameaça bloqueada!'; st.style.color = '#c00'; }
        if (sp) sp.textContent = '1 ameaça foi detectada e movida para o Baú de Vírus.';
        if (sh) sh.textContent = '⚠️';
        avVault.push(threat); avRenderVault();
        window.avastNotify(threat);
      }
    }, 130);
  };
  function avRenderVault() {
    const list = document.getElementById('avx-vault-list'), card = document.getElementById('avx-vault');
    if (!list || !card) return;
    if (avVault.length) { card.style.display = 'block'; list.innerHTML = avVault.map(v => `🦠 ${esc(v.obj)} <span style="color:#a00">(${esc(v.inf)})</span>`).join('<br>'); }
  }
  window.avastShowVault = function () {
    click(); const card = document.getElementById('avx-vault'), list = document.getElementById('avx-vault-list');
    if (card) { card.style.display = 'block'; if (!avVault.length && list) list.innerHTML = '<span style="color:#888">O Baú de Vírus está vazio. Nenhuma ameaça isolada.</span>'; }
  };

  /* ════════════════ REGISTRO: ícones, menu iniciar, atalhos ════════════════ */
  function lazy(id, builder) { return function () { builder(); openWindow(id); }; }
  const APPS = [
    { id: 'win-display', ico: _ico('display-properties.png'), lbl: 'Propriedades de Vídeo', build: buildDisplay, desktop: false },
    { id: 'win-wordpad', ico: _ico('wordpad.webp'), lbl: 'WordPad', build: buildWordpad, desktop: true },
    { id: 'win-meucomp', ico: _ico('meu-computador.webp'), lbl: 'Meu Computador', build: buildExplorer, desktop: true },
    { id: 'win-freecell', ico: _ico('freecell.png'), lbl: 'FreeCell', build: buildFreeCell, desktop: false },
    { id: 'win-charmap', ico: _ico('charmap.png'), lbl: 'Mapa de Caracteres', build: buildCharmap, desktop: false },
    { id: 'win-soundrec', ico: _ico('sound-recorder.png'), lbl: 'Gravador de Som', build: buildSoundRec, desktop: false },
    { id: 'win-avast', ico: avico(16), lbl: 'avast! Antivírus', build: buildAvast, desktop: true }
  ];
  /* registra openers globais */
  APPS.forEach(a => { window['open_' + a.id.replace(/-/g, '_')] = lazy(a.id, a.build); });

  /* abre via opener lazy (constrói se ainda não existe) */
  window.openApp = function (id) {
    const a = APPS.find(x => x.id === id); if (!a) { openWindow(id); return; }
    a.build(); openWindow(id);
  };

  /* ---------- ícones na área de trabalho ---------- */
  function addDesktopIcons() {
    const cont = document.querySelector('.desktop-icons'); if (!cont) return;
    APPS.filter(a => a.desktop).forEach(a => {
      if (document.getElementById('dsk-' + a.id)) return;
      const ic = document.createElement('div');
      ic.className = 'd-icon'; ic.id = 'dsk-' + a.id; ic.setAttribute('data-tip', a.lbl);
      ic.setAttribute('ondblclick', `openApp('${a.id}')`);
      /* ícones em <img> (ex.: avast) viram 30px na área de trabalho; emojis usam font-size:32px */
      const dico = (typeof a.ico === 'string' && a.ico.indexOf('<img') === 0)
        ? a.ico.replace(/width:16px;height:16px/, 'width:30px;height:30px')
        : a.ico;
      ic.innerHTML = `<div class="d-icon-img" style="font-size:32px;line-height:1;width:32px;height:32px;display:flex;align-items:center;justify-content:center">${dico}</div><div class="d-icon-lbl">${esc(a.lbl)}</div>`;
      cont.appendChild(ic);
    });
  }

  /* ---------- "Todos os Programas" vira um submenu (flyout) de verdade ---------- */
  /* Lista completa do menu: aponta para janelas existentes + apps novos */
  const ALL_PROGRAMS = [
    { lbl: 'Acessórios', header: true },
    { lbl: 'Bloco de Notas', ico: _ico('bloco-de-notas-icon.png'), open: () => openWindow('win-notepad') },
    { lbl: 'WordPad', ico: _ico('wordpad.webp'), open: () => openApp('win-wordpad') },
    { lbl: 'Paint', ico: _ico('paint.webp'), open: () => openWindow('win-paint') },
    { lbl: 'Calculadora', ico: _ico('calc.png'), open: () => openWindow('win-calc') },
    { lbl: 'Mapa de Caracteres', ico: _ico('charmap.png'), open: () => openApp('win-charmap') },
    { lbl: 'Gravador de Som', ico: _ico('sound-recorder.png'), open: () => openApp('win-soundrec') },
    { lbl: 'Prompt de Comando', ico: _ico('file-bat.ico'), open: () => openWindow('win-cmd') },
    { lbl: 'Notepad++', ico: _ico('bloco-de-notas-icon.png'), open: () => openWindow('win-npp') },
    { lbl: 'Jogos', header: true },
    { lbl: 'Campo Minado', ico: _ico('minesweeper.png'), open: () => openWindow('win-mine') },
    { lbl: 'Paciência', ico: _ico('solitaire.png'), open: () => openWindow('win-solitaire') },
    { lbl: 'FreeCell', ico: _ico('freecell.png'), open: () => openApp('win-freecell') },
    { lbl: 'Pinball', ico: _ico('pinball.png'), open: () => openWindow('win-pinball') },
    { lbl: 'Minecraft', ico: '<img src="src/img/minecfrat.webp" style="width:16px;height:16px;vertical-align:middle">', open: () => openWindow('win-minecraft') },
    { lbl: 'Segurança', header: true },
    { lbl: 'avast! Antivírus', ico: avico(16), open: () => openApp('win-avast') },
    { lbl: 'Sistema', header: true },
    { lbl: 'Meu Computador', ico: _ico('meu-computador.webp'), open: () => openApp('win-meucomp') },
    { lbl: 'Propriedades de Vídeo', ico: _ico('display-properties.png'), open: () => openApp('win-display') },
    { lbl: 'Painel de Controle', ico: _ico('control-panel.png'), open: () => openWindow('win-ctrlpanel') },
    { lbl: 'Gerenciador de Tarefas', ico: _ico('task-manager.png'), open: () => openWindow('win-taskmgr') },
    { lbl: 'Desfragmentador', ico: _ico('desfragmentador.ico'), open: () => openWindow('win-defrag') }
  ];

  function setupAllPrograms() {
    const all = document.querySelector('.sm-item-all');
    if (!all || document.getElementById('mt-allprog-fly')) return;

    /* CSS do flyout — fixo no body para NÃO ser cortado pelo overflow:hidden do menu */
    if (!document.getElementById('mt-allprog-css')) {
      const s = document.createElement('style'); s.id = 'mt-allprog-css';
      s.textContent = `
      .mt-allprog-fly{position:fixed;min-width:220px;max-height:80vh;overflow-y:auto;
        background:#fff;border:2px solid #1a43a0;border-radius:3px;
        box-shadow:4px 2px 14px rgba(0,0,0,.4);padding:4px;display:none;z-index:9999;
        font-family:Tahoma,Arial,sans-serif}
      .mt-allprog-fly.open{display:block}
      .mt-ap-item{display:flex;align-items:center;gap:9px;padding:6px 12px;font-size:11px;color:#00146e;cursor:pointer;border-radius:2px;white-space:nowrap}
      .mt-ap-item:hover{background:#2f6bd8;color:#fff}
      .mt-ap-ico{width:18px;text-align:center;font-size:15px;flex:none}
      .mt-ap-head{font-size:10px;font-weight:bold;color:#6a6a6a;padding:6px 12px 2px;text-transform:uppercase;letter-spacing:.3px}
      .mt-ap-sep{border-top:1px solid #d4d0c8;margin:3px 6px}`;
      document.head.appendChild(s);
    }

    /* monta o flyout no body */
    const fly = document.createElement('div');
    fly.className = 'mt-allprog-fly'; fly.id = 'mt-allprog-fly';
    let html = '';
    ALL_PROGRAMS.forEach((p, i) => {
      if (p.header) { html += (i ? '<div class="mt-ap-sep"></div>' : '') + `<div class="mt-ap-head">${esc(p.lbl)}</div>`; }
      else { html += `<div class="mt-ap-item" data-i="${i}"><span class="mt-ap-ico">${p.ico}</span>${esc(p.lbl)}</div>`; }
    });
    fly.innerHTML = html;
    document.body.appendChild(fly);
    fly.querySelectorAll('.mt-ap-item').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const p = ALL_PROGRAMS[+el.dataset.i];
        fly.classList.remove('open');
        if (typeof closeStartMenu === 'function') closeStartMenu();
        if (p && p.open) p.open();
      });
    });

    function positionFly() {
      const r = all.getBoundingClientRect();
      fly.style.visibility = 'hidden';
      fly.classList.add('open');
      const fw = fly.offsetWidth, fh = fly.offsetHeight;
      let left = r.right + 2;
      if (left + fw > window.innerWidth) left = Math.max(2, r.left - fw - 2);
      let top = r.bottom - fh;
      if (top < 2) top = 2;
      if (top + fh > window.innerHeight - 4) top = window.innerHeight - fh - 4;
      fly.style.left = left + 'px';
      fly.style.top = top + 'px';
      fly.style.visibility = '';
    }

    /* remove o onclick inline antigo (que só mostrava notificação) e usa o flyout */
    all.removeAttribute('onclick');
    all.onclick = null;
    all.addEventListener('click', function (e) {
      e.stopPropagation();
      try { sndClick(); } catch (err) {}
      if (fly.classList.contains('open')) { fly.classList.remove('open'); }
      else { positionFly(); }
    });
    /* hover tipo XP: passar o mouse sobre "Todos os Programas" também abre */
    all.addEventListener('mouseenter', () => { if (!fly.classList.contains('open')) positionFly(); });

    /* fecha o flyout: ao fechar o menu, ou ao clicar fora dele e fora do botão */
    const sm = document.getElementById('start-menu');
    if (sm) {
      const mo = new MutationObserver(() => { if (sm.style.display === 'none') fly.classList.remove('open'); });
      mo.observe(sm, { attributes: true, attributeFilter: ['style'] });
    }
    document.addEventListener('click', e => {
      if (!fly.classList.contains('open')) return;
      if (!e.target.closest('#mt-allprog-fly') && !e.target.closest('.sm-item-all')) fly.classList.remove('open');
    });
  }

  /* ---------- "Propriedades" no menu de contexto da área de trabalho ---------- */
  function addCtxProps() {
    const ctx = document.getElementById('ctxmenu'); if (!ctx) return;
    if (document.getElementById('ctx-props')) return;
    const item = document.createElement('div');
    item.className = ctx.querySelector('div') ? ctx.querySelector('div').className : 'ctx-item';
    item.id = 'ctx-props';
    item.textContent = 'Propriedades';
    item.addEventListener('click', () => { if (typeof hideCtxMenu === 'function') hideCtxMenu(); window.openApp('win-display'); });
    ctx.appendChild(item);
  }

  /* ---------- notificação automática do avast! (estilo "antivírus chato") ---------- */
  let avAutoStarted = false;
  function avStartAuto() {
    if (avAutoStarted) return; avAutoStarted = true;
    (function tick(first) {
      const delay = first ? (30000 + Math.random() * 12000) : (120000 + Math.random() * 60000);
      setTimeout(() => { try { window.avastNotify(); } catch (e) {} tick(false); }, delay);
    })(true);
  }

  /* ---------- inicialização ---------- */
  function init() {
    applySavedWallpaper();
    addDesktopIcons();
    setupAllPrograms();
    addCtxProps();
    avStartAuto();
  }
  /* aplica papel de parede assim que a área de trabalho aparece */
  if (typeof window.enterDesktop === 'function') {
    const _origEnter = window.enterDesktop;
    window.enterDesktop = function () { _origEnter.apply(this, arguments); setTimeout(init, 60); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  else setTimeout(init, 300);

})();

/* ══════════════════════════════════════════════════════════════
   INTERAÇÃO ESTILO XP — Alt+Tab, tecla Windows, menus de contexto
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---- estilos ---- */
  const st = document.createElement('style');
  st.textContent = `
  #alttab-ov{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:99997;
    background:#ece9d8;border:2px solid #0a246a;border-radius:6px;box-shadow:4px 6px 20px rgba(0,0,0,.5);
    padding:14px 18px;display:none;max-width:80vw}
  #alttab-ov .att-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;max-width:520px}
  #alttab-ov .att-item{width:64px;text-align:center;font-family:Tahoma,sans-serif;font-size:10px;padding:8px 4px;border:2px solid transparent;border-radius:4px;cursor:default}
  #alttab-ov .att-item.sel{border-color:#0a58e0;background:#cfe0ff}
  #alttab-ov .att-ico{font-size:30px;line-height:1;height:32px;display:flex;align-items:center;justify-content:center}
  #alttab-ov .att-cap{margin-top:4px;color:#fff;background:#1c50b8;border-radius:3px;padding:2px 4px;font-weight:bold;display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .win-ctx{position:fixed;z-index:99999;background:#ece9d8;border:1px solid #888;box-shadow:2px 2px 8px rgba(0,0,0,.4);
    font-family:Tahoma,sans-serif;font-size:11px;padding:2px;min-width:130px}
  .win-ctx div{padding:4px 22px;cursor:pointer}
  .win-ctx div:hover{background:#316ac5;color:#fff}
  .win-ctx .sep{height:0;border-top:1px solid #aca899;margin:3px 2px;padding:0}
  .win-ctx .sep:hover{background:transparent}
  `;
  document.head.appendChild(st);

  function visWins() {
    return [...document.querySelectorAll('.xp-win')]
      .filter(w => w.style.display !== 'none' && !w.classList.contains('minimized'))
      .sort((a, b) => (parseInt(b.style.zIndex) || 0) - (parseInt(a.style.zIndex) || 0));
  }
  function metaFor(id) { try { return (winMeta && winMeta[id]) || { ico: '🪟', lbl: id }; } catch (e) { return { ico: '🪟', lbl: id }; } }

  /* ---- Alt+Tab ---- */
  let attList = [], attIdx = 0, attActive = false;
  function attShow() {
    let ov = document.getElementById('alttab-ov');
    if (!ov) { ov = document.createElement('div'); ov.id = 'alttab-ov'; ov.innerHTML = '<div class="att-row"></div>'; document.body.appendChild(ov); }
    const row = ov.querySelector('.att-row');
    row.innerHTML = attList.map((w, i) => {
      const m = metaFor(w.id);
      return `<div class="att-item${i === attIdx ? ' sel' : ''}"><div class="att-ico">${m.ico}</div><div class="att-cap">${(m.lbl || '').slice(0, 14)}</div></div>`;
    }).join('');
    ov.style.display = 'block';
  }
  function attHide() {
    const ov = document.getElementById('alttab-ov'); if (ov) ov.style.display = 'none';
    if (attActive && attList[attIdx]) { try { focusWin(attList[attIdx].id); } catch (e) {} }
    attActive = false;
  }
  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      if (!attActive) { attList = visWins(); if (attList.length < 2) return; attActive = true; attIdx = 1; }
      else { attIdx = (attIdx + (e.shiftKey ? -1 : 1) + attList.length) % attList.length; }
      attShow();
    }
  });
  document.addEventListener('keyup', e => { if (attActive && (e.key === 'Alt')) attHide(); });
  window.addEventListener('blur', () => { if (attActive) attHide(); });

  /* ---- Tecla Windows / Ctrl+Esc abre o Menu Iniciar ---- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Meta' || e.key === 'OS' || (e.ctrlKey && e.key === 'Escape')) {
      e.preventDefault();
      try { toggleStartMenu(); } catch (err) {}
    }
  });

  /* ---- Menu de contexto na barra de título e na barra de tarefas ---- */
  function closeWinCtx() { const m = document.getElementById('win-ctx-menu'); if (m) m.remove(); }
  function openWinCtx(x, y, id) {
    closeWinCtx();
    const w = document.getElementById(id); if (!w) return;
    const maxed = !!w._max;
    const m = document.createElement('div');
    m.className = 'win-ctx'; m.id = 'win-ctx-menu';
    m.style.left = Math.min(x, window.innerWidth - 150) + 'px';
    m.style.top = Math.min(y, window.innerHeight - 160) + 'px';
    m.innerHTML =
      `<div data-a="restore">Restaurar</div>` +
      `<div data-a="min">Minimizar</div>` +
      `<div data-a="max">${maxed ? 'Restaurar tamanho' : 'Maximizar'}</div>` +
      `<div class="sep"></div>` +
      `<div data-a="close">Fechar</div>`;
    document.body.appendChild(m);
    m.querySelectorAll('div[data-a]').forEach(d => d.addEventListener('click', () => {
      const a = d.dataset.a; closeWinCtx();
      try {
        if (a === 'min') minimizeWin(id);
        else if (a === 'max') maximizeWin(id);
        else if (a === 'close') closeWin(id);
        else if (a === 'restore') { if (w._max) maximizeWin(id); else { w.style.display = 'flex'; w.classList.remove('minimized'); focusWin(id); } }
      } catch (e) {}
    }));
  }
  document.addEventListener('contextmenu', e => {
    const tb = e.target.closest('.xp-titlebar');
    if (tb) { const win = tb.closest('.xp-win'); if (win && win.id) { e.preventDefault(); openWinCtx(e.clientX, e.clientY, win.id); return; } }
    const tbi = e.target.closest('.tb-item');
    if (tbi && tbi.id) { e.preventDefault(); openWinCtx(e.clientX, e.clientY, tbi.id.replace(/^tbi-/, '')); return; }
  });
  document.addEventListener('mousedown', e => { if (!e.target.closest('#win-ctx-menu')) closeWinCtx(); });

})();

/* ══════════════════════════════════════════════════════════════
   LOGOFF — diálogo estilo XP (a janela de desligar já existe no app.js)
   ══════════════════════════════════════════════════════════════ */
window.doLogoff = function () {
  try { closeStartMenu(); } catch (e) {}
  try { sndClick(); } catch (e) {}
  let ov = document.getElementById('xp-logoff'); if (ov) ov.remove();
  ov = document.createElement('div');
  ov.id = 'xp-logoff';
  ov.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,30,90,0.55);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(2px);font-family:Tahoma,sans-serif';
  ov.innerHTML =
    '<div style="width:360px;border:1px solid #002a8c;border-radius:8px;overflow:hidden;box-shadow:4px 6px 24px rgba(0,0,0,.5)">' +
    '<div style="background:linear-gradient(180deg,#3f8cf3,#1a58c8);color:#fff;font-weight:bold;font-size:13px;padding:8px 12px">Fazer logoff do Windows</div>' +
    '<div style="background:linear-gradient(180deg,#5a8fd6,#3f6fb8);padding:26px 18px;display:flex;justify-content:space-around;text-align:center;color:#fff;font-size:11px">' +
    '<div class="lo-opt" style="cursor:pointer"><div style="font-size:34px">👤</div>Fazer logoff</div>' +
    '</div>' +
    '<div style="background:#ece9d8;padding:8px 12px;text-align:right">' +
    '<button id="lo-cancel" style="font-family:Tahoma;font-size:11px;padding:3px 16px;cursor:pointer;border:1px solid #707070;border-radius:3px;background:#f5f4ea">Cancelar</button>' +
    '</div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#lo-cancel').onclick = () => { try { sndClick(); } catch (e) {} ov.remove(); };
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
  ov.querySelector('.lo-opt').addEventListener('click', () => {
    ov.remove();
    document.querySelectorAll('.xp-win').forEach(w => { w.style.display = 'none'; });
    const tb = document.getElementById('tb-items'); if (tb) tb.innerHTML = '';
    const dk = document.getElementById('desktop'); if (dk) dk.style.display = 'none';
    const tk = document.getElementById('taskbar'); if (tk) tk.style.display = 'none';
    const wel = document.getElementById('welcome'); if (wel) wel.style.display = 'flex';
    try { sndShutdown(); } catch (e) {}
  });
};
