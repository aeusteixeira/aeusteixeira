
/* ══════════════════════════════════════
    AUDIO
══════════════════════════════════════ */
const AC = new (window.AudioContext || window.webkitAudioContext)();
function playTone(t, f, dur, v = 0.12, a = 0.01, r = 0.1) {
    try {
    const o = AC.createOscillator(), g = AC.createGain();
    o.connect(g); g.connect(AC.destination);
    o.type = t; o.frequency.value = f;
    const ct = AC.currentTime;
    g.gain.setValueAtTime(0, ct);
    g.gain.linearRampToValueAtTime(v, ct + a);
    g.gain.exponentialRampToValueAtTime(0.001, ct + dur - r);
    o.start(ct); o.stop(ct + dur);
    } catch (e) { }
}
function sndBoot() {
    [0, 120, 240, 400, 700, 900].forEach((d, i) => setTimeout(() => {
    if (i < 3) playTone('sine', [523, 659, 784][i], 0.5, 0.12);
    else if (i === 3) playTone('sine', 1047, 0.8, 0.15, 0.05, 0.3);
    else if (i === 4) playTone('sine', 880, 0.6, 0.10);
    else { playTone('sine', 523, 1.0, 0.12); playTone('sine', 659, 1.0, 0.12); playTone('sine', 784, 1.0, 0.12); playTone('sine', 1047, 1.0, 0.18, 0.05, 0.5); }
    }, d));
}
function sndClick() { playTone('square', 800, 0.06, 0.06, 0.001, 0.02); }
function sndOpen() { playTone('sine', 440, 0.12, 0.08, 0.005, 0.05); setTimeout(() => playTone('sine', 550, 0.1, 0.08), 60); setTimeout(() => playTone('sine', 660, 0.1, 0.1), 120); }
function sndClose() { playTone('sine', 660, 0.1, 0.08, 0.005, 0.05); setTimeout(() => playTone('sine', 550, 0.1, 0.08), 60); setTimeout(() => playTone('sine', 440, 0.08, 0.1), 120); }
function sndMinimize() { playTone('sine', 660, 0.15, 0.08, 0.005, 0.06); setTimeout(() => playTone('sine', 440, 0.1, 0.12), 80); }
function sndNotif() { playTone('sine', 880, 0.2, 0.09, 0.005, 0.06); setTimeout(() => playTone('sine', 1100, 0.15, 0.15, 0.005, 0.08), 100); }
function sndShutdown() { playTone('sine', 523, 0.5, 0.12); setTimeout(() => playTone('sine', 440, 0.6, 0.12), 200); setTimeout(() => playTone('sine', 349, 0.8, 0.18), 450); setTimeout(() => playTone('sine', 294, 1.0, 0.2), 750); }
function sndMsg() { playTone('sine', 1046, 0.15, 0.08); setTimeout(() => playTone('sine', 1318, 0.12, 0.1), 80); }
document.addEventListener('click', () => { if (AC.state === 'suspended') AC.resume(); }, { once: true });

/* ══════════════════════════════════════
    BOOT
══════════════════════════════════════ */
(function boot() {
    if (localStorage.getItem('xp_dirty') === '1') {
        localStorage.removeItem('xp_dirty');
        document.getElementById('boot').style.display = 'none';
        runChkdsk();
    } else {
        setTimeout(showWelcome, 3500);
    }
})();

function showWelcome() {
    document.getElementById('boot').style.display = 'none';
    document.getElementById('welcome').style.display = 'flex';
    sndBoot();
}
function enterDesktop() {
    document.getElementById('desktop').style.display = 'block';
    document.getElementById('taskbar').style.display = 'flex';
    updateClock(); setInterval(updateClock, 10000);
    loadNotepad();
    const startSnd = new Audio('src/sounds/windows-xp-startup.mp3');
    startSnd.volume = 0.65;
    startSnd.play().catch(() => { });
    setTimeout(() => {
    openWindow('win-about');
    setTimeout(() => showNotif('🖥️ Bem-vindo!', 'Desktop carregado. Dê duplo clique nos ícones para explorar.'), 1600);
    setTimeout(() => showNotif('📝 Novo post!', 'Laravel Queues na prática — publicado hoje.'), 5000);
    setTimeout(() => showNotif('💬 MSN', 'Visitante entrou na sala — diga olá!'), 9000);
    setTimeout(() => showNotif('🔧 Sistema', 'PHP 8.3 disponível — considere atualizar.'), 14000);
    }, 300);
    resetIdleTimer();
    setTimeout(() => { paintInit(); }, 100);
    setTimeout(() => { showTrayBalloon(); setInterval(showTrayBalloon, 40000); }, 20000);
    startAutoConversations();
    /* Clippy aparece depois de um tempo */
    setTimeout(showClippy, 15000 + Math.random() * 10000);
    /* WinRAR popup clássico */
    setTimeout(showWinRAR, 25000 + Math.random() * 15000);
}

/* ══════════════════════════════════════
    CLOCK
══════════════════════════════════════ */
function updateClock() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    const el = document.getElementById('tray-clock');
    el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}`;
    el.title = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/* ══════════════════════════════════════
    WINDOW MANAGEMENT
══════════════════════════════════════ */
let zTop = 10;
const recyclebin = [];
function _ico(file) { return '<img src="src/img/system/' + file + '" style="width:16px;height:16px;vertical-align:middle">'; }
const winMeta = {
    'win-about': { ico: _ico('chrome-icon.png'), lbl: 'Google Chrome' },
    'win-sysprop': { ico: _ico('meu-computador.webp'), lbl: 'Meu Computador' },
    'win-notepad': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'Bloco de Notas' },
    'win-cv': { ico: _ico('wordpad.webp'), lbl: 'Curriculo.rtf — WordPad' },
    'win-recycle': { ico: _ico('lixeira-icon.webp'), lbl: 'Lixeira' },
    'msn': { ico: _ico('msn-icon.ico'), lbl: 'MSN Messenger' },
    'msn-chat': { ico: _ico('msn-icon.ico'), lbl: 'MSN — Conversa' },
    'wmp': { ico: _ico('media-player-icon.png'), lbl: 'Windows Media Player' },
    'win-blog': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'Blog' },
    'win-projects': { ico: _ico('pasta-vazia.ico'), lbl: 'Projetos' },
    'win-stack': { ico: '⚙️', lbl: 'Painel de Controle' },
    'win-contact': { ico: '✉️', lbl: 'Contato' },
    'win-calc': { ico: '🧮', lbl: 'Calculadora' },
    'win-paint': { ico: _ico('paint.webp'), lbl: 'Paint' },
    'win-mine': { ico: '💣', lbl: 'Campo Minado' },
    'win-npp': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'Notepad++' },
    'win-mydocs': { ico: _ico('meus-documentos-icon.ico'), lbl: 'Meus Documentos' },
    'win-carta-edmundo': { ico: _ico('wordpad.webp'), lbl: 'Carta_Apresentacao.rtf — WordPad' },
    'win-downloads': { ico: _ico('meus-documentos-icon.ico'), lbl: 'Downloads' },
    'win-dev-projects': { ico: _ico('pasta-vazia.ico'), lbl: 'Projetos de Desenvolvimento' },
    'win-todo-doc': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'TODO_vida_2025.txt' },
    'win-saas-plan': { ico: _ico('wordpad.webp'), lbl: 'PlanoNegociosMilhao — WordPad' },
    'win-readme': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'README.md — Notepad++' },
    'win-compose': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'docker-compose.yml — Notepad++' },
    'win-doc': { ico: _ico('wordpad.webp'), lbl: 'WordPad' },
    'win-taskmgr': { ico: '⚙️', lbl: 'Gerenciador de Tarefas' },
    'win-cmd': { ico: _ico('file-bat.ico'), lbl: 'Prompt de Comando' },
    'win-solitaire': { ico: '🃏', lbl: 'Paciência' },
    'win-about-xp': { ico: _ico('win-xp-logo.png'), lbl: 'Sobre o Windows' },
    'win-ctrlpanel': { ico: '⚙️', lbl: 'Painel de Controle' },
    'win-printer-queue': { ico: _ico('impressora.ico'), lbl: 'Impressoras' },
    'win-cdrom': { ico: _ico('cd-dvd.ico'), lbl: 'CD-ROM (D:)' },
    'win-sobre-matheus': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'sobre_o_matheus.txt' },
    'win-virus-src': { ico: _ico('file-bat.ico'), lbl: 'virus.bat' },
    'win-cp-addremove': { ico: '📦', lbl: 'Adicionar/Remover Programas' },
    'win-cp-datetime': { ico: '📅', lbl: 'Data e Hora' },
    'win-cp-usuarios': { ico: '👤', lbl: 'Contas de Usuário' },
    'win-receita': { ico: _ico('bloco-de-notas-icon.png'), lbl: 'receitas_bacalhau_mae.txt' },
    'win-limewire': { ico: '🍋', lbl: 'LimeWire 4.18.8' },
    'win-defrag': { ico: _ico('desfragmentador.ico'), lbl: 'Desfragmentador de Disco' },
};

const gtaPageUrls = {
    inicio: 'http://www.matheusteixeira.com.br/index.html',
    sobre: 'http://www.matheusteixeira.com.br/sobre.html',
    projetos: 'http://www.matheusteixeira.com.br/projetos.html',
    habilidades: 'http://www.matheusteixeira.com.br/habilidades.html',
    blog: 'http://www.matheusteixeira.com.br/blog.html',
    cv: 'http://www.matheusteixeira.com.br/curriculo.html',
    contato: 'http://www.matheusteixeira.com.br/contato.html',
};
function gtaNav(page) {
    document.querySelectorAll('.gta-page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById('gp-' + page);
    if (el) el.classList.add('active');
    document.querySelectorAll('#gta-nav-bar .gta-nav-item').forEach(n => n.classList.remove('active'));
    const navItems = document.querySelectorAll('#gta-nav-bar .gta-nav-item');
    const pages = ['inicio', 'sobre', 'projetos', 'habilidades', 'blog', 'cv', 'contato'];
    const idx = pages.indexOf(page);
    if (navItems[idx]) navItems[idx].classList.add('active');
    const addr = document.getElementById('ie-addr');
    if (addr) addr.value = gtaPageUrls[page] || gtaPageUrls.inicio;
}
function ieAddrKey(e) {
    if (e.key !== 'Enter') return;
    const val = (e.target.value || '').trim().toLowerCase();
    // reverse lookup
    const urlToPage = Object.fromEntries(Object.entries(gtaPageUrls).map(([k, v]) => [v.toLowerCase(), k]));
    let page = urlToPage[val];
    if (!page) {
    // try partial match on path
    for (const [k, v] of Object.entries(gtaPageUrls)) {
        if (val.includes(k) || v.toLowerCase().includes(val)) { page = k; break; }
    }
    }
    if (page) { gtaNav(page); }
    else {
    // show 404
    document.querySelectorAll('.gta-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.gta-nav-item').forEach(n => n.classList.remove('active'));
    let p404 = document.getElementById('gp-404');
    if (!p404) {
        p404 = document.createElement('div');
        p404.id = 'gp-404'; p404.className = 'gta-page active';
        p404.style.cssText = 'padding:40px;text-align:center;font-family:Times New Roman,serif;';
        p404.innerHTML = '<h2 style="color:#c00">O Internet Explorer não pode exibir a página da Web</h2><p style="margin-top:12px;font-size:13px">O endereço <b>' + e.target.value + '</b> não pôde ser encontrado.</p><p style="font-size:12px;color:#555;margin-top:8px">Verifique o endereço digitado e tente novamente.</p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Windows_XP_Internet_Explorer_Error.svg/200px-Windows_XP_Internet_Explorer_Error.svg.png" style="margin-top:16px;opacity:0.4" onerror="this.style.display=\'none\'">';
        document.querySelector('#win-about .xp-body').appendChild(p404);
    } else { p404.classList.add('active'); }
    }
}

/* Chrome tab switching */
const chromeTabUrls = [
    'matheusteixeira.com.br',
    'www.baixaki.com.br',
    'mail.google.com/mail/u/0/#inbox',
    'pudim.com.br',
    'www.clubedohardware.com.br/forums/topic/1098432-como-desinstalar-o-baidu-pc-faster-completamente',
    'www.orkut.com.br/Main#Profile?uid=5841029374',
    'chrome://history',
];
const chromeTitles = [
    'Matheus Teixeira — Google Chrome',
    'Baixaki - Download de Programas Gratuitos — Google Chrome',
    'Caixa de Entrada (47) — Gmail — Google Chrome',
    'Pudim — Google Chrome',
    'Como desinstalar o Baidu PC Faster completamente - Clube do Hardware',
    'Orkut - Matheus Teixeira — Google Chrome',
    'Histórico — Google Chrome',
];
/* ══════════════════════════════════════
    CHROME MENU (⋮)
══════════════════════════════════════ */
function toggleChromeMenu() {
    sndClick();
    const m = document.getElementById('chrome-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', e => {
    const m = document.getElementById('chrome-menu');
    if (m && m.style.display === 'block' && !e.target.closest('.chrome-menu-wrap')) {
        m.style.display = 'none';
    }
});
function chromeMenuAction(action) {
    document.getElementById('chrome-menu').style.display = 'none';
    sndClick();
    switch (action) {
        case 'history':
            document.getElementById('ctab-6').style.display = '';
            chromeTab(6);
            break;
        case 'downloads':
            openWindow('win-downloads');
            break;
        case 'bookmarks':
            showNotif('⭐ Favoritos', 'Barra de favoritos já está visível!');
            break;
        case 'newtab':
            showNotif('🌐 Nova aba', 'Calma, já tem aba demais aberta.');
            break;
        case 'newwin':
            showNotif('🌐 Nova janela', 'Uma janela já é suficiente pra esse PC.');
            break;
        case 'zoom':
            showNotif('🔍 Zoom', 'Zoom: 100%. Seus óculos estão aí do lado.');
            break;
        case 'print':
            showNotif('🖨️ Imprimir', 'A impressora tá sem tinta. Como sempre.');
            break;
        case 'config':
            showNotif('⚙️ Configurações', 'Não mexa nas configurações! Já tá funcionando.');
            break;
        case 'help':
            showNotif('❓ Ajuda', 'Google: "como usar o Google Chrome". Recursão infinita.');
            break;
        case 'exit':
            closeWin('win-about');
            break;
    }
}

function gm_toggleSpam() {
    const sl = document.getElementById('gm-spam-list');
    if (sl) sl.style.display = sl.style.display === 'none' ? 'block' : 'none';
}

function openWindow(id) {
    sndOpen();
    const w = document.getElementById(id);
    w.style.display = 'flex';
    w.classList.remove('minimized', 'inactive', 'win-minimizing');
    w.classList.add('win-opening');
    setTimeout(() => w.classList.remove('win-opening'), 220);
    focusWin(id); addTbItem(id); resetIdleTimer();
    if (id === 'win-mine') mineNewGame();
    if (id === 'win-npp') nppInit();
    if (id === 'win-mydocs') mydocsInit();
    if (id === 'win-taskmgr') taskmgrInit();
    if (id === 'win-cmd') cmdInit();
}
function printCV() {
    const page = document.getElementById('cv-page');
    if (!page) return;
    const w = window.open('', '_blank', 'width=750,height=850,scrollbars=yes');
    w.document.write('<!DOCTYPE html><html><head><title>Currículo — Matheus Teixeira</title><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:11px;margin:40px 56px;color:#1a1a1a;line-height:1.5;}.cv-name{font-size:17px;font-weight:bold;text-align:center;margin:0 0 5px;font-family:"Times New Roman",serif;}.cv-contact{text-align:center;font-size:11px;color:#444;line-height:1.9;margin-bottom:14px;}a{color:#0a246a;}.cv-section{font-size:11.5px;font-weight:bold;border-bottom:1.5px solid #1a1a1a;padding-bottom:2px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.4px;}.cv-entry{margin-bottom:9px;}.cv-entry-hd{display:flex;justify-content:space-between;font-weight:bold;font-size:11.5px;margin-bottom:1px;}.cv-entry-date{font-size:10.5px;color:#555;font-weight:normal;}.cv-entry-role{font-style:italic;font-size:11px;color:#333;margin-bottom:3px;}.cv-list{margin:2px 0 4px 18px;list-style:disc;}.cv-list li{font-size:11px;line-height:1.45;margin-bottom:1px;}.cv-skill-row{display:grid;grid-template-columns:150px 1fr;font-size:11px;line-height:1.55;}.cv-cert-item{font-size:11px;line-height:1.65;}.cv-ref-block{font-size:11px;line-height:1.7;}.cv-para{font-size:11px;margin:0 0 6px;}@media print{body{margin:20px 40px;}}</style></head><body>' + page.innerHTML + '</body></html>');
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 400);
}

function closeWin(id) {
    sndClose();
    const w = document.getElementById(id);
    const meta = winMeta[id] || { ico: '🪟', lbl: id };
    // add to recycle bin
    recyclebin.push({ id, ico: meta.ico, lbl: meta.lbl, time: new Date().toLocaleTimeString() });
    updateRecycleBin();
    w.style.display = 'none';
    removeTbItem(id);
}
function minimizeWin(id) {
    sndMinimize();
    const w = document.getElementById(id);
    if (!w) return;
    let _done = false;
    const done = () => { if (_done) return; _done = true; w.style.pointerEvents = ''; w.style.transform = ''; w.style.opacity = ''; w.style.display = 'none'; w.classList.add('minimized'); updateTbItem(id, false); };
    try {
        const wRect = w.getBoundingClientRect();
        const tbi = document.getElementById('tbi-' + id);
        let tx = window.innerWidth / 2, ty = window.innerHeight - 17;
        if (tbi) { const r = tbi.getBoundingClientRect(); tx = r.left + r.width / 2; ty = r.top + r.height / 2; }
        const cx = wRect.left + wRect.width / 2, cy = wRect.top + wRect.height / 2;
        const sc = Math.min(40 / wRect.width, 24 / wRect.height);
        w.style.pointerEvents = 'none';
        const anim = w.animate([
            { transform: 'translate(0,0) scale(1)', opacity: 1 },
            { transform: `translate(${tx - cx}px,${ty - cy}px) scale(${sc})`, opacity: 0 }
        ], { duration: 250, easing: 'ease-in' });
        anim.onfinish = done;
        setTimeout(done, 300); /* fallback caso a animação não dispare onfinish */
    } catch(e) { done(); }
}
function maximizeWin(id) {
    sndClick();
    const w = document.getElementById(id);
    if (w._max) { w.style.width = w._pw; w.style.height = w._ph; w.style.top = w._pt; w.style.left = w._pl; w._max = false; }
    else {
    w._pw = w.style.width; w._ph = w.style.height; w._pt = w.style.top; w._pl = w.style.left;
    w.style.width = '100vw'; w.style.height = 'calc(100vh - 34px)'; w.style.top = '0'; w.style.left = '0'; w._max = true;
    }
    focusWin(id);
}
function focusWin(id) {
    zTop++;
    document.getElementById(id).style.zIndex = zTop;
    document.querySelectorAll('.xp-win').forEach(w => w.classList.add('inactive'));
    document.getElementById(id).classList.remove('inactive');
    document.querySelectorAll('.tb-item').forEach(i => i.classList.remove('tb-active'));
    const tbi = document.getElementById('tbi-' + id); if (tbi) tbi.classList.add('tb-active');
}
function addTbItem(id) {
    if (document.getElementById('tbi-' + id)) { updateTbItem(id, true); return; }
    const m = winMeta[id] || { ico: '🪟', lbl: id };
    const el = document.createElement('div'); el.className = 'tb-item tb-active'; el.id = 'tbi-' + id;
    el.innerHTML = m.ico + ' ' + m.lbl;
    el.addEventListener('click', () => {
    const w = document.getElementById(id);
    if (w.classList.contains('minimized')) {
        w.style.display = 'flex';
        w.classList.remove('minimized');
        w.classList.add('win-opening');
        setTimeout(() => w.classList.remove('win-opening'), 220);
        focusWin(id); sndOpen();
    }
    else if (parseInt(w.style.zIndex) === zTop) { minimizeWin(id); }
    else { focusWin(id); sndClick(); }
    });
    document.getElementById('tb-items').appendChild(el);
}
function removeTbItem(id) { const el = document.getElementById('tbi-' + id); if (el) el.remove(); }
function updateTbItem(id, active) { const el = document.getElementById('tbi-' + id); if (!el) return; active ? el.classList.add('tb-active') : el.classList.remove('tb-active'); }
function openFromMenu(id) { closeStartMenu(); openWindow(id); }

/* click anywhere in a window to bring it to front */
document.addEventListener('mousedown', e => {
    if (e.target.closest('.xp-wbtns')) return; /* não interfere com botões min/max/close */
    const win = e.target.closest('.xp-win');
    if (win && win.id) focusWin(win.id);
}, true);

/* double-click titlebar to maximize */
document.addEventListener('dblclick', e => {
    const tb = e.target.closest('.xp-titlebar');
    if (tb && !e.target.closest('.xp-wbtns')) {
    const win = tb.closest('.xp-win');
    if (win && win.id) maximizeWin(win.id);
    }
});

/* ══════════════════════════════════════
    DRAG & RESIZE
══════════════════════════════════════ */
let drag = null, resize = null;
function startDrag(e, id) {
    if (e.target.classList.contains('xp-wbtn')) return;
    focusWin(id); sndClick();
    const w = document.getElementById(id), r = w.getBoundingClientRect();
    drag = { id, ox: e.clientX - r.left, oy: e.clientY - r.top }; e.preventDefault();
}
function startDragEl(e, id) {
    const el = document.getElementById(id), r = el.getBoundingClientRect();
    drag = { id, ox: e.clientX - r.left, oy: e.clientY - r.top, isEl: true }; e.preventDefault();
}
function startResize(e, id, dir) {
    focusWin(id);
    const w = document.getElementById(id), r = w.getBoundingClientRect();
    resize = { id, dir: dir || 'se', ox: e.clientX, oy: e.clientY, ow: r.width, oh: r.height, ot: r.top, ol: r.left };
    e.preventDefault();
}
document.addEventListener('mousemove', e => {
    if (drag) {
    const el = document.getElementById(drag.id);
    const tbH = 34;
    el.style.left = Math.max(0, e.clientX - drag.ox) + 'px';
    el.style.top = Math.max(0, Math.min(e.clientY - drag.oy, window.innerHeight - tbH - 28)) + 'px';
    }
    if (resize) {
    const w = document.getElementById(resize.id);
    const dx = e.clientX - resize.ox, dy = e.clientY - resize.oy;
    const minW = 280, minH = 180;
    if (resize.dir.includes('e')) w.style.width = Math.max(minW, resize.ow + dx) + 'px';
    if (resize.dir.includes('s')) w.style.height = Math.max(minH, resize.oh + dy) + 'px';
    if (resize.dir.includes('w')) { const nw = Math.max(minW, resize.ow - dx); w.style.width = nw + 'px'; w.style.left = (resize.ol + resize.ow - nw) + 'px'; }
    if (resize.dir.includes('n')) { const nh = Math.max(minH, resize.oh - dy); w.style.height = nh + 'px'; w.style.top = Math.max(0, resize.ot + resize.oh - nh) + 'px'; }
    }
});
document.addEventListener('mouseup', () => { drag = null; resize = null; iconDrag = null; });

/* ══════════════════════════════════════
    DESKTOP ICON DRAG & DROP
══════════════════════════════════════ */
let iconDrag = null;
function initDesktopIconDrag() {
    const icons = document.querySelectorAll('.desktop-icons .d-icon');
    icons.forEach(ico => {
        ico.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            const r = ico.getBoundingClientRect();
            iconDrag = {
                el: ico,
                ox: e.clientX - r.left,
                oy: e.clientY - r.top,
                startX: e.clientX,
                startY: e.clientY,
                moved: false
            };
        });
    });
}
document.addEventListener('mousemove', e => {
    if (!iconDrag) return;
    const dx = e.clientX - iconDrag.startX;
    const dy = e.clientY - iconDrag.startY;
    if (!iconDrag.moved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (!iconDrag.moved) {
        iconDrag.moved = true;
        iconDrag.el.style.position = 'absolute';
        iconDrag.el.style.zIndex = '50';
        iconDrag.el.style.opacity = '0.8';
    }
    const desk = document.getElementById('desktop').getBoundingClientRect();
    let x = e.clientX - iconDrag.ox - desk.left;
    let y = e.clientY - iconDrag.oy - desk.top;
    x = Math.max(0, Math.min(x, desk.width - 75));
    y = Math.max(0, Math.min(y, desk.height - 80));
    iconDrag.el.style.left = x + 'px';
    iconDrag.el.style.top = y + 'px';
});
document.addEventListener('mouseup', e => {
    if (!iconDrag) return;
    iconDrag.el.style.zIndex = '';
    iconDrag.el.style.opacity = '';
    if (!iconDrag.moved) {
        iconDrag = null;
        return;
    }
    /* snap to grid 75x80 */
    const desk = document.getElementById('desktop').getBoundingClientRect();
    let x = parseInt(iconDrag.el.style.left) || 0;
    let y = parseInt(iconDrag.el.style.top) || 0;
    x = Math.round(x / 75) * 75;
    y = Math.round(y / 80) * 80;
    x = Math.max(0, Math.min(x, desk.width - 75));
    y = Math.max(0, Math.min(y, desk.height - 80));
    iconDrag.el.style.left = x + 'px';
    iconDrag.el.style.top = y + 'px';
    iconDrag = null;
});
document.addEventListener('DOMContentLoaded', () => setTimeout(initDesktopIconDrag, 100));

/* ══════════════════════════════════════
    START MENU
══════════════════════════════════════ */
let startOpen = false;
function toggleStartMenu() { sndClick(); startOpen = !startOpen; document.getElementById('start-menu').style.display = startOpen ? 'block' : 'none'; }
function closeStartMenu() { startOpen = false; document.getElementById('start-menu').style.display = 'none'; }
document.addEventListener('click', e => {
    if (startOpen && !e.target.closest('#start-menu') && !e.target.closest('#start-btn')) closeStartMenu();
});

/* ══════════════════════════════════════
    CONTEXT MENU
══════════════════════════════════════ */
const ctxEl = document.getElementById('ctxmenu');
document.getElementById('desktop').addEventListener('contextmenu', e => {
    e.preventDefault(); sndClick();
    ctxEl.style.display = 'block';
    ctxEl.style.left = Math.min(e.clientX, window.innerWidth - 170) + 'px';
    ctxEl.style.top = Math.min(e.clientY, window.innerHeight - 200) + 'px';
});
document.addEventListener('click', e => { if (!e.target.closest('#ctxmenu')) hideCtxMenu(); });
function hideCtxMenu() { ctxEl.style.display = 'none'; }
function ctxRefresh() { hideCtxMenu(); sndOpen(); showNotif('🔄 Atualizado', 'Desktop atualizado com sucesso.'); }
function ctxNewNote() { hideCtxMenu(); openWindow('win-notepad'); }
function ctxArrange() {
    hideCtxMenu(); sndClick();
    const icons = document.querySelectorAll('.desktop-icons .d-icon');
    icons.forEach(ic => {
        ic.style.position = '';
        ic.style.left = '';
        ic.style.top = '';
    });
    showNotif('🔲 Ícones', 'Ícones organizados automaticamente.');
}
function ctxAlignToGrid() {
    hideCtxMenu(); sndClick();
    const icons = document.querySelectorAll('.desktop-icons .d-icon');
    icons.forEach(ic => {
        if (ic.style.position === 'absolute') {
            let x = parseInt(ic.style.left) || 0;
            let y = parseInt(ic.style.top) || 0;
            ic.style.left = Math.round(x / 75) * 75 + 'px';
            ic.style.top = Math.round(y / 80) * 80 + 'px';
        }
    });
    showNotif('▦ Grade', 'Ícones alinhados à grade.');
}
function ctxNewFolder() {
    hideCtxMenu(); sndClick();
    const container = document.querySelector('.desktop-icons');
    const folder = document.createElement('div');
    folder.className = 'd-icon';
    folder.setAttribute('data-tip', 'Nova Pasta');
    folder.ondblclick = () => showNotif('📂 Nova Pasta', 'Essa pasta está vazia. Igual a sua geladeira.');
    folder.innerHTML = '<div class="d-icon-img"><img src="src/img/system/pasta-vazia.ico" alt="Pasta" style="width:32px;height:32px;"></div><div class="d-icon-lbl">Nova Pasta</div>';
    container.appendChild(folder);
    initDesktopIconDrag();
    showNotif('📁 Nova Pasta', 'Pasta criada na área de trabalho.');
}
function ctxNewWordpad() {
    hideCtxMenu();
    openWindow('win-notepad');
}
function ctxPaste() {
    hideCtxMenu(); sndClick();
    showNotif('📋 Colar', 'Não tem nada na área de transferência. Tenta Ctrl+C antes.');
}
function openFromCtx(id) { hideCtxMenu(); openWindow(id); }

/* ══════════════════════════════════════
    NOTIFICATIONS
══════════════════════════════════════ */
let notifQ = [], notifShowing = false;
function showNotif(title, txt) {
    notifQ.push({ title, txt });
    if (!notifShowing) nextNotif();
}
function nextNotif() {
    if (!notifQ.length) { notifShowing = false; return; }
    notifShowing = true;
    const { title, txt } = notifQ.shift();
    sndNotif();
    document.getElementById('notif-title').textContent = title;
    document.getElementById('notif-txt').textContent = txt;
    const el = document.getElementById('notif'); el.style.display = 'block';
    clearTimeout(el._t); el._t = setTimeout(() => { closeNotif(); setTimeout(nextNotif, 400); }, 5000);
}
function closeNotif() { document.getElementById('notif').style.display = 'none'; notifShowing = false; }

/* ══════════════════════════════════════
    RECYCLE BIN
══════════════════════════════════════ */
function updateRecycleBin() {
    const list = document.getElementById('recycle-list');
    list.innerHTML = '';
    if (recyclebin.length === 0) {
    list.innerHTML = '<div class="recyclebin-empty">🗑️<br>Lixeira vazia</div>';
    document.getElementById('recycle-ico').innerHTML = '<img src="src/img/system/lixeira-icon.webp" alt="Lixeira" style="width:32px;height:32px;">';
    return;
    }
    document.getElementById('recycle-ico').innerHTML = '<img src="src/img/system/lixeira-icon.webp" alt="Lixeira" style="width:32px;height:32px;">';
    recyclebin.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'recyclebin-item';
    row.style.gridTemplateColumns = '1fr 100px 80px';
    row.innerHTML = `<div class="recycle-name"><span>${item.ico}</span> ${item.lbl}</div><div style="font-size:11px;color:#556">Janela fechada</div><div style="font-size:10px;color:#556">${item.time}</div>`;
    list.appendChild(row);
    });
}
function emptyRecycle() {
    sndClose(); recyclebin.length = 0; updateRecycleBin();
    showNotif('🗑️ Lixeira', 'Lixeira esvaziada com sucesso.');
}
function restoreAll() {
    sndOpen();
    recyclebin.forEach(item => openWindow(item.id));
    recyclebin.length = 0; updateRecycleBin();
}
updateRecycleBin();

/* ══════════════════════════════════════
    NOTEPAD
══════════════════════════════════════ */
let notepadDirty = false;
function loadNotepad() {
    const saved = localStorage.getItem('mt_notepad');
    if (saved) { document.getElementById('notepad-text').value = saved; document.getElementById('notepad-status').textContent = 'Carregado do armazenamento local'; }
}
function notepadSave() {
    const txt = document.getElementById('notepad-text').value;
    localStorage.setItem('mt_notepad', txt);
    notepadDirty = false;
    document.getElementById('notepad-title').textContent = 'Bloco de Notas — Salvo';
    document.getElementById('notepad-status').textContent = 'Salvo em ' + new Date().toLocaleTimeString();
    sndClick(); showNotif('📄 Bloco de Notas', 'Nota salva no navegador!');
}
function notepadNew() {
    if (notepadDirty && !confirm('Descartar alterações não salvas?')) return;
    document.getElementById('notepad-text').value = ''; notepadDirty = false;
    document.getElementById('notepad-title').textContent = 'Sem título — Bloco de Notas';
    document.getElementById('notepad-status').textContent = 'Pronto';
    sndClick();
}
function notepadLoad() {
    const saved = localStorage.getItem('mt_notepad');
    if (saved) { document.getElementById('notepad-text').value = saved; showNotif('📄 Bloco de Notas', 'Nota carregada!'); }
    else showNotif('📄 Bloco de Notas', 'Nenhuma nota salva encontrada.');
}
function notepadClear() { localStorage.removeItem('mt_notepad'); document.getElementById('notepad-text').value = ''; showNotif('📄 Bloco de Notas', 'Nota apagada.'); }
function notepadChanged() {
    notepadDirty = true;
    document.getElementById('notepad-title').textContent = '*Sem título — Bloco de Notas';
}
function notepadKeydown(e) {
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); notepadSave(); }
    const ta = e.target, pos = ta.selectionStart, val = ta.value;
    const lines = val.substr(0, pos).split('\n');
    document.getElementById('notepad-pos').textContent = `Linha ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
}

/* ══════════════════════════════════════
    MSN MESSENGER
══════════════════════════════════════ */
let msnOpen = false;
function toggleMSN() {
    const el = document.getElementById('msn');
    if (el.style.display === 'none' || el.classList.contains('minimized')) {
    openWindow('msn'); msnOpen = true;
    } else {
    minimizeWin('msn'); msnOpen = false;
    }
}
function msnToggleGroup(id) {
    document.getElementById(id).classList.toggle('collapsed');
}

let msnChatContact = { name: 'Pablo', ico: '😎', firstMsg: 'brabo! boa tarde mano' };
const msnContactReplies = {
    'Pablo': ['cara isso foi sinistro mesmo', 'bora resolver isso? manda o código', 'hahaha exato 🔥', 'to pensando aqui... acho que é um bug no state', 'amor é complicado 😔', 'bora tomar um açaí depois?', '🔥🔥🔥', 'que foi kkkk'],
    'Edmundo': ['ai você tá fofo hj 🥰', 'te extraño mucho 🥺', 'se te quieres, criança', 'ven acá gordito 🥰', 'oye para com isso jaja', 'linda 😘', 'se te quieres 🥺'],
    'Carla': ['oi', 'quando vc vem aqui em casa?', 'mãe perguntou de vc', 'ok, te falo depois', 'kkkkk que isso', '🙄', 'tá sumido hein'],
    'Kris': ['estagiário!!! saudade de vc', 'bota um try/catch nisso aí pelo amor 😤', 'vc tá usando Python pra isso? pq não tá?', 'manda o traceback que eu olho', 'lembra quando vc derrubou o banco no segundo dia? KKKK', 'orgulho de vc garoto 🥹', 'para de usar PHP pra tudo desgraça 🐍', 'eu te ensinei melhor que isso', 'quer que eu faça um code review?', 'bora um pair programming qualquer dia'],
};
let msnReplyIdxMap = {};
const chatLogs = {}; // {name:[{from,text,time}]}
function msnOpenChat(name, ico, firstMsg, dotClass) {
    msnChatContact = { name, ico, firstMsg };
    document.getElementById('msn-chat-title-txt').textContent = name + ' - Conversa';
    document.getElementById('msn-chat-to-name').textContent = name;
    document.getElementById('msn-chat-av-ico').textContent = ico;
    document.getElementById('msn-chat-av-name').textContent = name;
    ['msn-chat-contact-name-lbl', 'msn-chat-contact-name-lbl2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = name; });
    const msgs = document.getElementById('msn-chat-msgs');
    const log = chatLogs[name] || [];
    msgs.innerHTML = `<div class="msn-chat-warn">⚠ Nunca compartilhe sua senha ou número de cartão de crédito em conversas.</div>`;
    if (log.length > 0) {
    log.forEach(e => {
        const b = document.createElement('div'); b.className = 'msn-msg-block';
        b.innerHTML = e.from === 'me'
        ? `<span class="msn-msg-name me-c">Matheus</span> diz:<br>${e.text}`
        : `<span class="msn-msg-name them-c">${name}</span> diz:<br>${e.text}`;
        msgs.appendChild(b);
    });
    } else {
    const b = document.createElement('div'); b.className = 'msn-msg-block';
    b.innerHTML = `<span class="msn-msg-name them-c">${name}</span> diz:<br>${firstMsg}`;
    msgs.appendChild(b);
    if (!chatLogs[name]) chatLogs[name] = [];
    chatLogs[name].push({ from: 'them', text: firstMsg, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) });
    }
    msgs.scrollTop = msgs.scrollHeight;
    const now = new Date(); document.getElementById('msn-chat-time').textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const ch = document.getElementById('msn-chat');
    ch.style.display = 'flex';
    ch.classList.remove('minimized');
    focusWin('msn-chat'); addTbItem('msn-chat');
    document.getElementById('msn-chat-input').focus();
    sndOpen();
}
function msnCloseChat() { document.getElementById('msn-chat').style.display = 'none'; removeTbItem('msn-chat'); sndClose(); msnHideTyping(); }
function msnChatKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); msnChatSend(); } }
let _typingTimer = null;
function msnShowTyping(name) {
    const el = document.getElementById('msn-typing'); if (!el) return;
    el.innerHTML = `${name} está digitando<span class="msn-typing-dot">.</span><span class="msn-typing-dot">.</span><span class="msn-typing-dot">.</span>`;
}
function msnHideTyping() {
    const el = document.getElementById('msn-typing'); if (el) el.innerHTML = '';
    clearTimeout(_typingTimer);
}
function msnChatSend() {
    const inp = document.getElementById('msn-chat-input');
    const txt = inp.value.trim(); if (!txt) return;
    const msgs = document.getElementById('msn-chat-msgs');
    const b = document.createElement('div'); b.className = 'msn-msg-block';
    b.innerHTML = `<span class="msn-msg-name me-c">Matheus</span> diz:<br>${txt}`;
    msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight;
    inp.value = ''; sndMsg();
    const name = msnChatContact.name;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (!chatLogs[name]) chatLogs[name] = [];
    chatLogs[name].push({ from: 'me', text: txt, time });
    const replies = msnContactReplies[name] || ['ok', 'hm', '👍', 'entendi', 'blz'];
    const idx = (msnReplyIdxMap[name] || 0) % replies.length;
    msnReplyIdxMap[name] = (idx + 1);
    const replyDelay = 700 + Math.random() * 1200;
    msnShowTyping(name);
    _typingTimer = setTimeout(() => {
    msnHideTyping();
    const r = document.createElement('div'); r.className = 'msn-msg-block';
    r.innerHTML = `<span class="msn-msg-name them-c">${name}</span> diz:<br>${replies[idx]}`;
    msgs.appendChild(r); msgs.scrollTop = msgs.scrollHeight;
    const now = new Date();
    const t = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('msn-chat-time').textContent = t;
    chatLogs[name].push({ from: 'them', text: replies[idx], time: t });
    // só mostra notif se o chat NÃO está visível
    const ch = document.getElementById('msn-chat');
    const chatVis = ch.style.display !== 'none' && !ch.classList.contains('minimized') && msnChatContact.name === name;
    if (!chatVis) msnShowNotif(name, msnChatContact.ico, replies[idx]);
    else try { const s = new Audio('src/sounds/msn-sound_1.mp3'); s.volume = 0.4; s.play().catch(() => { }); } catch (e) { }
    }, replyDelay);
}
function insertEmo(e) { } /* kept for compat */

/* ══════════════════════════════════════
    AUTO CONVERSATIONS
══════════════════════════════════════ */
const autoScripts = {
    'Pablo': {
    ico: '😎', msgs: [
        { from: 'them', text: 'eae bixa, tô aqui', d: 0 },
        { from: 'me', text: 'opa! que foi?', d: 1800 },
        { from: 'them', text: 'cara, viu aquele repositório que te mandei?', d: 2400 },
        { from: 'me', text: 'ainda não, o que é?', d: 1600 },
        { from: 'them', text: 'uma lib de Go pra injeção de dependência automática, é brabo demais', d: 3000 },
        { from: 'me', text: 'sério?? manda o link', d: 1300 },
        { from: 'them', text: 'github.com/uber-go/fx — olha o exemplo de providers', d: 2800 },
        { from: 'me', text: 'cara isso aqui é surreal', d: 2200 },
        { from: 'them', text: 'né?? to usando no trampo já', d: 2000 },
        { from: 'me', text: 'vou testar aqui também', d: 1500 },
        { from: 'them', text: 'qualquer dúvida me fala 🔥', d: 2200 },
        { from: 'me', text: 'valeu demais', d: 1400 },
    ]
    },
    'Carla': {
    ico: '👩', msgs: [
        { from: 'them', text: 'oi nem!! 🥺', d: 0 },
        { from: 'me', text: 'oi Carla! tudo bem?', d: 1600 },
        { from: 'them', text: 'tudo sim! a Manu perguntou de vc hoje kkkkk', d: 2500 },
        { from: 'me', text: 'nossa minha sobrinha linda!! quando posso ver ela?', d: 2000 },
        { from: 'them', text: 'semana que vem! vem jantar aqui', d: 2200 },
        { from: 'me', text: 'top!! vou levar aquela roupinha que comprei pra ela', d: 1800 },
        { from: 'them', text: 'ela vai amar!! e o apartamento, como tá indo?', d: 2800 },
        { from: 'me', text: 'tô montando aos poucos, comprei a estante essa semana', d: 2000 },
        { from: 'them', text: 'manda foto quando terminar!', d: 2000 },
        { from: 'me', text: 'mando sim, tô feliz demais aqui kk', d: 1600 },
        { from: 'them', text: 'saudade 🥺', d: 2400 },
        { from: 'me', text: 'saudade também! semana que vem tô aí', d: 1800 },
    ]
    },
    'Edmundo': {
    ico: '🇵🇪', msgs: [
        { from: 'them', text: 'oye gordito!! 🥰', d: 0 },
        { from: 'me', text: 'eaee Edmundo!! tô aqui', d: 1700 },
        { from: 'them', text: 'quando a gente sai?? quero muito te ver', d: 2800 },
        { from: 'me', text: 'que saudade! esse fds tô livre', d: 1900 },
        { from: 'them', text: 'sábado então?? tem um restaurante peruano novo aqui perto', d: 2400 },
        { from: 'me', text: 'adorei!! que horas?', d: 1300 },
        { from: 'them', text: '19h tá bom pra vc?', d: 2000 },
        { from: 'me', text: 'perfeito! e o plantão, como tá sendo?', d: 2200 },
        { from: 'them', text: 'cansado... 12h de plantão ontem 😔', d: 2700 },
        { from: 'me', text: 'coitado!! descansa hoje então', d: 1600 },
        { from: 'them', text: 'só depois de uma skol beats', d: 2200 },
        { from: 'me', text: 'kkkkkk da vermelha com gelo e limao', d: 1200 },
        { from: 'them', text: 'se te quieres, criança', d: 2000 },
    ]
    },
    'Kris': {
    ico: '🐍', msgs: [
        { from: 'them', text: 'ESTAGIÁRIO!! tá vivo??', d: 0 },
        { from: 'me', text: 'KRIS!! to sim!! que saudade', d: 1800 },
        { from: 'them', text: 'saudade vc!! vi que vc tá mexendo com Laravel né', d: 2600 },
        { from: 'me', text: 'sim!! tô amando. mas Python tem um lugar no meu coração tbm', d: 2000 },
        { from: 'them', text: 'BOM MESMO. se vc largar Python eu vou aí te buscar 😤', d: 2400 },
        { from: 'me', text: 'kkkkk jamais!! vc me ensinou bem demais', d: 1600 },
        { from: 'them', text: 'lembra do teu segundo dia de estágio?', d: 2200 },
        { from: 'me', text: 'quando eu derrubei o banco de dev? 😰', d: 1800 },
        { from: 'them', text: 'KKKKKKKK eu quase te mandei embora naquele dia', d: 2800 },
        { from: 'me', text: 'ainda bem que não mandou 🙏', d: 1400 },
        { from: 'them', text: 'vc era o pior estagiário do mundo. agora é o melhor dev que eu conheço', d: 3000 },
        { from: 'me', text: 'para com isso que eu vou chorar 🥹', d: 1600 },
        { from: 'them', text: 'verdade. orgulho de vc, garoto. de verdade. ♥', d: 2400 },
    ]
    },
};
// delays iniciais após entrar no desktop (ms)
const autoStartAt = { 'Pablo': 12000, 'Carla': 24000, 'Edmundo': 38000, 'Kris': 50000 };
const scriptIdx = {};
function startAutoConversations() {
    Object.keys(autoScripts).forEach(name => {
    if (!chatLogs[name]) chatLogs[name] = [];
    scriptIdx[name] = 0;
    setTimeout(() => runNextMsg(name), autoStartAt[name] || 15000);
    });
}
function runNextMsg(name) {
    const sc = autoScripts[name]; if (!sc) return;
    const i = scriptIdx[name] || 0;
    if (i >= sc.msgs.length) return;
    const msg = sc.msgs[i];
    scriptIdx[name] = i + 1;
    const ch = document.getElementById('msn-chat');
    const chatVis = ch && ch.style.display !== 'none' && !ch.classList.contains('minimized') && msnChatContact.name === name;
    // show typing indicator for 'them' messages when chat is visible
    const typingDelay = msg.from === 'them' && chatVis ? 900 + Math.random() * 600 : 0;
    if (msg.from === 'them' && chatVis) msnShowTyping(name);
    setTimeout(() => {
    if (chatVis) msnHideTyping();
    const t = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    chatLogs[name].push({ from: msg.from, text: msg.text, time: t });
    if (chatVis) {
        const msgs = document.getElementById('msn-chat-msgs');
        const b = document.createElement('div'); b.className = 'msn-msg-block';
        b.innerHTML = msg.from === 'me'
        ? `<span class="msn-msg-name me-c">Matheus</span> diz:<br>${msg.text}`
        : `<span class="msn-msg-name them-c">${name}</span> diz:<br>${msg.text}`;
        msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight;
        document.getElementById('msn-chat-time').textContent = t;
        if (msg.from === 'them') try { const s = new Audio('src/sounds/msn-sound_1.mp3'); s.volume = 0.45; s.play().catch(() => { }); } catch (e) { }
    } else if (msg.from === 'them') {
        msnShowNotif(name, sc.ico, msg.text);
    }
    // agenda próxima mensagem
    const next = scriptIdx[name];
    if (next < sc.msgs.length) {
        const delay = sc.msgs[next].d || 2000;
        setTimeout(() => runNextMsg(name), Math.max(delay, 800));
    }
    }, typingDelay);
}

/* TRAY BALLOON NOTIFICATIONS */
const trayMsgs = [
    { title: '🔄 Windows Update', msg: 'Atualizações importantes disponíveis para o seu computador.' },
    { title: '🔒 Windows Firewall', msg: 'Firewall ativo. Seu computador está protegido.' },
    { title: '📶 Conexão de rede', msg: 'Conectado a: MatheusNet_Wi-Fi. Sinal excelente.' },
    { title: '🖨️ Novo hardware', msg: 'Dispositivo USB detectado. Instalando drivers...' },
    { title: '⚡ Desempenho', msg: 'CPU: 3%  |  RAM: 128 MB / 512 MB' },
    { title: '🛡️ Norton AntiVirus', msg: 'Sistema protegido. Última verificação: agora.' },
    { title: '🔊 Áudio', msg: 'Dispositivo de áudio detectado e pronto para uso.' },
];
let trayBallTimer = null;
function showTrayBalloon() {
    const m = trayMsgs[Math.floor(Math.random() * trayMsgs.length)];
    document.getElementById('tray-b-title').textContent = m.title;
    document.getElementById('tray-b-msg').textContent = m.msg;
    const el = document.getElementById('tray-balloon');
    el.classList.remove('show'); void el.offsetHeight; el.classList.add('show');
    if (trayBallTimer) clearTimeout(trayBallTimer);
    trayBallTimer = setTimeout(hideTrayBalloon, 6000);
}
function hideTrayBalloon() {
    document.getElementById('tray-balloon').classList.remove('show');
    if (trayBallTimer) { clearTimeout(trayBallTimer); trayBallTimer = null; }
}

/* ══════════════════════════════════════
    VOLUME POPUP
══════════════════════════════════════ */
let volMuted = false, volLevel = 70;
function toggleVolPopup(e) {
    e.stopPropagation();
    document.getElementById('vol-popup').classList.toggle('open');
}
document.addEventListener('click', () => { const p = document.getElementById('vol-popup'); if (p) p.classList.remove('open'); });
function setVol(v) {
    volLevel = parseInt(v); if (volMuted && v > 0) { volMuted = false; }
    const ico = document.getElementById('vol-ico');
    const mbtn = document.getElementById('vol-mute-btn');
    const lbl = document.getElementById('vol-pct-lbl');
    const em = volLevel === 0 ? '🔇' : volLevel < 40 ? '🔉' : '🔊';
    if (ico) ico.textContent = em;
    if (mbtn) mbtn.textContent = em;
    if (lbl) lbl.textContent = volLevel + '%';
}
function toggleMute() {
    volMuted = !volMuted;
    const slider = document.getElementById('vol-slider');
    if (volMuted) { slider.value = 0; setVol(0); }
    else { slider.value = volLevel || 70; setVol(volLevel || 70); }
}

/* ══════════════════════════════════════
    CALCULATOR
══════════════════════════════════════ */
let calcDisplay = '0', calcPrev = null, calcOp = null, calcReset = false, calcMem = 0;
function calcPress(v) {
    if (v === 'C') { calcDisplay = '0'; calcPrev = null; calcOp = null; calcReset = false; }
    else if (v === 'CE') { calcDisplay = '0'; }
    else if (v === 'BS') { calcDisplay = calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0'; }
    else if (v === '+/-') { const n = -parseFloat(calcDisplay); calcDisplay = isNaN(n) ? '0' : String(n); }
    else if (v === '.') { if (!calcDisplay.includes('.')) calcDisplay += '.'; calcReset = false; return calcUpdDisp(); }
    else if (v === 'MC') { calcMem = 0; }
    else if (v === 'MR') { calcDisplay = String(calcMem); calcReset = true; }
    else if (v === 'MS') { calcMem = parseFloat(calcDisplay) || 0; }
    else if (v === 'M+') { calcMem += (parseFloat(calcDisplay) || 0); }
    else if ('0123456789'.includes(v)) {
    if (calcReset || calcDisplay === '0') { calcDisplay = v; calcReset = false; }
    else { if (calcDisplay.replace('-', '').replace('.', '').length < 12) calcDisplay += v; }
    return calcUpdDisp();
    }
    else if (['+', '-', '*', '/'].includes(v)) {
    if (calcOp && !calcReset) { const r = calcDoOp(parseFloat(calcPrev), parseFloat(calcDisplay), calcOp); calcDisplay = calcFmt(r); }
    calcPrev = calcDisplay; calcOp = v; calcReset = true;
    }
    else if (v === '=') {
    if (calcOp) { const r = calcDoOp(parseFloat(calcPrev), parseFloat(calcDisplay), calcOp); calcDisplay = calcFmt(r); calcOp = null; calcPrev = null; calcReset = true; }
    }
    else if (v === 'sqrt') { const n = Math.sqrt(parseFloat(calcDisplay)); calcDisplay = calcFmt(n); calcReset = true; }
    else if (v === '%') { calcDisplay = calcFmt(parseFloat(calcDisplay) / 100); calcReset = true; }
    else if (v === '1/x') { const n = parseFloat(calcDisplay); calcDisplay = n === 0 ? 'Erro' : calcFmt(1 / n); calcReset = true; }
    calcUpdDisp();
}
function calcDoOp(a, b, op) {
    if (op === '+') return a + b; if (op === '-') return a - b;
    if (op === '*') return a * b; if (op === '/') return b === 0 ? NaN : a / b; return b;
}
function calcFmt(n) {
    if (isNaN(n)) return 'Erro';
    if (!isFinite(n)) return 'Erro';
    let s = String(parseFloat(n.toPrecision(12)));
    return s;
}
function calcUpdDisp() {
    const el = document.getElementById('calc-display');
    if (el) el.textContent = calcDisplay || '0';
}

/* ══════════════════════════════════════
    MS PAINT
══════════════════════════════════════ */
let pCtx = null, pTool = 'pencil', pColor = '#000000', pBgColor = '#ffffff', pSz = 1;
let pDrawing = false, pSX = 0, pSY = 0, pSnap = null;
const pColors = [
    '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
    '#c0c0c0', '#ffffff', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
    '#ff8040', '#804000', '#80ff00', '#004040', '#0080ff', '#8000ff', '#ff0080', '#ff8080',
    '#ffff80', '#80ff80', '#80ffff', '#8080ff', '#ff80ff', '#404040'
];
function paintInit() {
    const cv = document.getElementById('paint-canvas');
    if (!cv || pCtx) return;
    pCtx = cv.getContext('2d');
    pCtx.fillStyle = '#ffffff'; pCtx.fillRect(0, 0, cv.width, cv.height);
    const pal = document.getElementById('paint-palette');
    if (pal) {
    pColors.forEach(c => {
        const s = document.createElement('div'); s.className = 'paint-swatch';
        s.style.background = c; s.title = c;
        s.addEventListener('click', e => { e.shiftKey ? (pBgColor = c) : (pColor = c); paintUpdCurs(); });
        s.addEventListener('contextmenu', e => { e.preventDefault(); pBgColor = c; paintUpdCurs(); });
        pal.appendChild(s);
    });
    }
    paintUpdCurs();
    cv.addEventListener('mousedown', pDown);
    cv.addEventListener('mousemove', pMove);
    cv.addEventListener('mouseup', pUp);
    cv.addEventListener('mouseleave', pUp);
}
/* Paint — Menu Arquivo + Export */
function togglePaintFileMenu() {
    const m = document.getElementById('paint-file-menu');
    m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
function paintNew() {
    document.getElementById('paint-file-menu').style.display = 'none';
    const cv = document.getElementById('paint-canvas');
    if (pCtx) { pCtx.fillStyle = '#ffffff'; pCtx.fillRect(0, 0, cv.width, cv.height); }
    sndClick();
}
function paintSaveExport() {
    document.getElementById('paint-file-menu').style.display = 'none';
    const cv = document.getElementById('paint-canvas');
    const link = document.createElement('a');
    link.download = 'minha_obra_de_arte.png';
    link.href = cv.toDataURL('image/png');
    link.click();
    sndClick();
    showNotif('💾 Paint', 'Imagem salva com sucesso! Confere a pasta de downloads.');
}
/* Fechar menu ao clicar fora */
document.addEventListener('click', e => {
    const m = document.getElementById('paint-file-menu');
    if (m && m.style.display === 'block' && !e.target.closest('.paint-file-menu') && !e.target.closest('#paint-menu-arquivo')) {
        m.style.display = 'none';
    }
});

function paintUpdCurs() {
    const fg = document.getElementById('paint-fg-sw'), bg = document.getElementById('paint-bg-sw');
    if (fg) fg.style.background = pColor; if (bg) bg.style.background = pBgColor;
}
function paintSetTool(t) {
    pTool = t;
    document.querySelectorAll('.paint-tool').forEach(el => el.classList.remove('active'));
    const el = document.getElementById('pt-' + t); if (el) el.classList.add('active');
}
function paintSetSize(s, el) {
    pSz = s;
    document.querySelectorAll('.paint-size').forEach(e => e.classList.remove('active'));
    if (el) el.classList.add('active');
}
function pPos(e) { const r = document.getElementById('paint-canvas').getBoundingClientRect(); return { x: Math.floor(e.clientX - r.left), y: Math.floor(e.clientY - r.top) }; }
function pDown(e) {
    if (!pCtx) { paintInit(); }
    const p = pPos(e); pSX = p.x; pSY = p.y;
    const cv = document.getElementById('paint-canvas');
    if (pTool === 'fill') { pFloodFill(p.x, p.y, pColor); }
    else if (pTool === 'picker') { const d = pCtx.getImageData(p.x, p.y, 1, 1).data; pColor = `rgb(${d[0]},${d[1]},${d[2]})`; paintUpdCurs(); }
    else if (pTool === 'text') { const txt = prompt('Texto:', ''); if (txt) { pCtx.fillStyle = pColor; pCtx.font = `${14 + pSz * 2}px Tahoma,sans-serif`; pCtx.fillText(txt, p.x, p.y); } }
    else {
    pSnap = pCtx.getImageData(0, 0, cv.width, cv.height);
    pDrawing = true;
    if (pTool === 'pencil' || pTool === 'eraser') { pCtx.beginPath(); pCtx.moveTo(p.x, p.y); }
    }
}
function pMove(e) {
    if (!pDrawing || !pCtx) return;
    const p = pPos(e);
    const cv = document.getElementById('paint-canvas');
    if (pTool === 'pencil') { pCtx.strokeStyle = pColor; pCtx.lineWidth = pSz; pCtx.lineCap = 'round'; pCtx.lineJoin = 'round'; pCtx.lineTo(p.x, p.y); pCtx.stroke(); }
    else if (pTool === 'eraser') { pCtx.strokeStyle = pBgColor; pCtx.lineWidth = Math.max(pSz * 5, 8); pCtx.lineCap = 'round'; pCtx.lineJoin = 'round'; pCtx.lineTo(p.x, p.y); pCtx.stroke(); }
    else if (pTool === 'line') { pCtx.putImageData(pSnap, 0, 0); pCtx.beginPath(); pCtx.strokeStyle = pColor; pCtx.lineWidth = pSz; pCtx.moveTo(pSX, pSY); pCtx.lineTo(p.x, p.y); pCtx.stroke(); }
    else if (pTool === 'rect') { pCtx.putImageData(pSnap, 0, 0); pCtx.beginPath(); pCtx.strokeStyle = pColor; pCtx.lineWidth = pSz; pCtx.strokeRect(pSX, pSY, p.x - pSX, p.y - pSY); }
    else if (pTool === 'circle') { pCtx.putImageData(pSnap, 0, 0); pCtx.beginPath(); const rx = (p.x - pSX) / 2, ry = (p.y - pSY) / 2; pCtx.strokeStyle = pColor; pCtx.lineWidth = pSz; pCtx.ellipse(pSX + rx, pSY + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI); pCtx.stroke(); }
}
function pUp() { pDrawing = false; if (pCtx && (pTool === 'pencil' || pTool === 'eraser')) pCtx.beginPath(); pSnap = null; }
function pFloodFill(x, y, fc) {
    const cv = document.getElementById('paint-canvas');
    const id = pCtx.getImageData(0, 0, cv.width, cv.height);
    const d = id.data, w = cv.width, h = cv.height;
    const gi = (x, y) => (y * w + x) * 4;
    const si = gi(x, y);
    const sR = d[si], sG = d[si + 1], sB = d[si + 2];
    const tmp = document.createElement('canvas').getContext('2d');
    tmp.fillStyle = fc; tmp.fillRect(0, 0, 1, 1);
    const fd = tmp.getImageData(0, 0, 1, 1).data;
    const fR = fd[0], fG = fd[1], fB = fd[2];
    if (sR === fR && sG === fG && sB === fB) return;
    const match = i => d[i] === sR && d[i + 1] === sG && d[i + 2] === sB;
    const fill = i => { d[i] = fR; d[i + 1] = fG; d[i + 2] = fB; d[i + 3] = 255; };
    const stk = [[x, y]]; const visited = new Set();
    while (stk.length) {
    const [cx, cy] = stk.pop();
    if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
    const key = cy * w + cx; if (visited.has(key)) continue;
    visited.add(key);
    const i = gi(cx, cy); if (!match(i)) continue;
    fill(i);
    stk.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    pCtx.putImageData(id, 0, 0);
}

/* MSN notification popup */
let msnNotifTimer = null, msnNotifPending = null;
function msnShowNotif(name, ico, msg) {
    document.getElementById('msn-notif-av').textContent = ico;
    document.getElementById('msn-notif-name').textContent = name;
    document.getElementById('msn-notif-msg').textContent = msg;
    msnNotifPending = { name, ico };
    const el = document.getElementById('msn-notif');
    el.classList.remove('show'); void el.offsetHeight;
    el.classList.add('show');
    if (msnNotifTimer) clearTimeout(msnNotifTimer);
    msnNotifTimer = setTimeout(msnNotifClose, 5000);
    try { const snd = new Audio('src/sounds/msn-sound_1.mp3'); snd.volume = 0.7; snd.play().catch(() => { }); } catch (e) { }
}
function msnNotifClose() {
    const el = document.getElementById('msn-notif');
    el.classList.remove('show');
    if (msnNotifTimer) { clearTimeout(msnNotifTimer); msnNotifTimer = null; }
}
function msnNotifClick() {
    if (!msnNotifPending) return;
    const { name, ico } = msnNotifPending;
    msnNotifClose();
    const ch = document.getElementById('msn-chat');
    if (msnChatContact.name === name) {
    // chat já aberto com esse contato — só restaura/foca
    ch.style.display = 'flex';
    ch.classList.remove('minimized');
    focusWin('msn-chat');
    addTbItem('msn-chat');
    } else {
    const replies = msnContactReplies[name] || ['oi!'];
    msnOpenChat(name, ico, replies[0], 'dot-on');
    }
}

/* ══════════════════════════════════════
    WINDOWS MEDIA PLAYER
══════════════════════════════════════ */
// Adicione faixas no array abaixo após colocar arquivos em src/music/
// Formato: { file:'src/music/nome.mp3', title:'Título', artist:'Artista', dur:'3:45' }
const wmpTracks = [
    { file: 'src/music/Moptop - O Rock Acabou.mp3', title: 'O Rock Acabou', artist: 'Moptop', dur: '' },
];

let wmpAudio = new Audio(), wmpIdx = -1, wmpPlaying = false, wmpShuffle = false, wmpRepeat = false;
let wmpCtx = null, wmpAnalyser = null, wmpAudioSrc = null, wmpVizRaf = null;
wmpAudio.volume = 0.7;

function wmpInitAudioCtx() {
    if (wmpCtx) return;
    try {
    wmpCtx = new AudioContext();
    wmpAnalyser = wmpCtx.createAnalyser();
    wmpAnalyser.fftSize = 128;
    wmpAudioSrc = wmpCtx.createMediaElementSource(wmpAudio);
    wmpAudioSrc.connect(wmpAnalyser);
    wmpAnalyser.connect(wmpCtx.destination);
    } catch (e) { wmpCtx = null; }
}
const WMP_VIZ_H = 72;
function wmpStartViz() {
    const cv = document.getElementById('wmp-viz');
    if (!cv) return;
    cv.style.display = 'block';
    if (wmpVizRaf) cancelAnimationFrame(wmpVizRaf);
    function draw() {
    wmpVizRaf = requestAnimationFrame(draw);
    const W = cv.offsetWidth || 470;
    if (cv.width !== W) cv.width = W;
    cv.height = WMP_VIZ_H;
    const ctx = cv.getContext('2d'), H = WMP_VIZ_H;
    ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, W, H);
    if (!wmpAnalyser) {
        const n = 32, bw = W / n;
        for (let i = 0; i < n; i++) {
        const h = (0.2 + 0.8 * Math.abs(Math.sin(Date.now() / 400 + i * 0.5))) * (H * 0.85);
        const g = ctx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, '#1244a8'); g.addColorStop(0.6, '#2878e0'); g.addColorStop(1, '#50b8ff');
        ctx.fillStyle = g; ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
        }
        return;
    }
    const buf = new Uint8Array(wmpAnalyser.frequencyBinCount);
    wmpAnalyser.getByteFrequencyData(buf);
    const n = buf.length, bw = W / n;
    for (let i = 0; i < n; i++) {
        const h = (buf[i] / 255) * H * 0.92;
        if (h < 1) continue;
        const g = ctx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, '#0e3888'); g.addColorStop(0.55, '#2878e0'); g.addColorStop(1, '#60c8ff');
        ctx.fillStyle = g; ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
    }
    }
    draw();
}
function wmpStopViz() {
    if (wmpVizRaf) { cancelAnimationFrame(wmpVizRaf); wmpVizRaf = null; }
    const cv = document.getElementById('wmp-viz');
    if (cv) cv.style.display = 'none';
}

function toggleWMP() {
    const w = document.getElementById('wmp');
    if (w.style.display === 'none' || w.style.display === '') { openWindow('wmp'); wmpRender(); }
    else minimizeWin('wmp');
}
function wmpRender() {
    const pl = document.getElementById('wmp-playlist'); pl.innerHTML = '';
    if (!wmpTracks.length) {
    pl.innerHTML = '<div class="wmp-empty-msg">Nenhuma faixa encontrada.<br>Adicione arquivos MP3 em <strong>src/music/</strong><br>e registre-os no array <strong>wmpTracks</strong><br>no topo do bloco JavaScript.</div>';
    return;
    }
    wmpTracks.forEach((t, i) => {
    const r = document.createElement('div');
    r.className = 'wmp-pl-row' + (i === wmpIdx ? ' wmp-playing' : '');
    r.id = 'wmpr-' + i;
    r.ondblclick = () => { wmpLoad(i); wmpPlay(); };
    r.onclick = () => wmpSelRow(i);
    r.innerHTML = `<div class="wmp-pl-cell wmp-pl-num">${i + 1}</div><div class="wmp-pl-cell" style="flex:3">${t.title}</div><div class="wmp-pl-cell" style="flex:2">${t.artist || '—'}</div><div class="wmp-pl-cell" style="width:50px">${t.dur || '—'}</div>`;
    pl.appendChild(r);
    });
}
function wmpSelRow(i) {
    document.querySelectorAll('.wmp-pl-row').forEach(r => r.classList.remove('wmp-selected'));
    const r = document.getElementById('wmpr-' + i); if (r) r.classList.add('wmp-selected');
}
function wmpLoad(i) {
    if (i < 0 || i >= wmpTracks.length) return;
    wmpIdx = i; const t = wmpTracks[i];
    wmpAudio.src = t.file; wmpAudio.load();
    document.getElementById('wmp-now').textContent = t.title + (t.artist ? ' — ' + t.artist : '');
    document.getElementById('wmp-title-txt').textContent = t.title + ' — Windows Media Player';
    document.getElementById('wmp-cur').textContent = '0:00';
    document.getElementById('wmp-dur').textContent = t.dur || '0:00';
    document.getElementById('wmp-seek').value = 0;
    document.getElementById('wmp-status').textContent = 'Carregando…';
    document.querySelectorAll('.wmp-pl-row').forEach((r, j) => { r.classList.toggle('wmp-playing', j === i); r.classList.remove('wmp-selected'); });
}
function wmpPlay() {
    if (!wmpTracks.length) return;
    if (wmpIdx < 0) wmpLoad(0);
    wmpInitAudioCtx();
    if (wmpCtx && wmpCtx.state === 'suspended') wmpCtx.resume();
    wmpAudio.play().then(() => {
    wmpPlaying = true;
    document.getElementById('wmp-playbtn').textContent = '⏸';
    document.getElementById('wmp-status').textContent = 'A reproduzir: ' + wmpTracks[wmpIdx].title;
    wmpStartViz();
    }).catch(e => document.getElementById('wmp-status').textContent = 'Erro: ' + e.message);
}
function wmpPause() {
    wmpAudio.pause(); wmpPlaying = false;
    document.getElementById('wmp-playbtn').textContent = '▶';
    document.getElementById('wmp-status').textContent = 'Pausado';
    wmpStopViz();
}
function wmpTogglePlay() { if (wmpTracks.length === 0) return; if (wmpPlaying) wmpPause(); else wmpPlay(); }
function wmpStop() {
    wmpAudio.pause(); wmpAudio.currentTime = 0; wmpPlaying = false;
    document.getElementById('wmp-playbtn').textContent = '▶';
    document.getElementById('wmp-seek').value = 0;
    document.getElementById('wmp-cur').textContent = '0:00';
    document.getElementById('wmp-status').textContent = 'Parado';
    wmpStopViz();
}
function wmpPrev() {
    if (!wmpTracks.length) return;
    const i = wmpShuffle ? Math.floor(Math.random() * wmpTracks.length) : (wmpIdx - 1 + wmpTracks.length) % wmpTracks.length;
    wmpLoad(i); if (wmpPlaying) wmpPlay();
}
function wmpNext() {
    if (!wmpTracks.length) return;
    const i = wmpShuffle ? Math.floor(Math.random() * wmpTracks.length) : (wmpIdx + 1) % wmpTracks.length;
    wmpLoad(i); if (wmpPlaying) wmpPlay();
}
function wmpRew() { wmpAudio.currentTime = Math.max(0, wmpAudio.currentTime - 10); }
function wmpFwd() { if (wmpAudio.duration) wmpAudio.currentTime = Math.min(wmpAudio.duration, wmpAudio.currentTime + 10); }
function wmpOnSeek(v) { if (wmpAudio.duration) wmpAudio.currentTime = (v / 100) * wmpAudio.duration; }
function wmpSetVol(v) { wmpAudio.volume = v / 100; }
function wmpToggleShuffle() { wmpShuffle = !wmpShuffle; document.getElementById('wmp-btn-shuf').classList.toggle('wmp-on', wmpShuffle); }
function wmpToggleRepeat() { wmpRepeat = !wmpRepeat; wmpAudio.loop = wmpRepeat; document.getElementById('wmp-btn-rep').classList.toggle('wmp-on', wmpRepeat); }
function wmpNavSel(s) {
    document.querySelectorAll('.wmp-nav-item').forEach(el => el.classList.remove('wmp-active'));
    const el = document.getElementById('wmp-nav-' + s); if (el) el.classList.add('wmp-active');
}
wmpAudio.addEventListener('timeupdate', () => {
    if (!wmpAudio.duration) return;
    const p = (wmpAudio.currentTime / wmpAudio.duration) * 100;
    document.getElementById('wmp-seek').value = p;
    const m = Math.floor(wmpAudio.currentTime / 60), s = Math.floor(wmpAudio.currentTime % 60);
    document.getElementById('wmp-cur').textContent = `${m}:${String(s).padStart(2, '0')}`;
});
wmpAudio.addEventListener('loadedmetadata', () => {
    const m = Math.floor(wmpAudio.duration / 60), s = Math.floor(wmpAudio.duration % 60);
    document.getElementById('wmp-dur').textContent = `${m}:${String(s).padStart(2, '0')}`;
    document.getElementById('wmp-status').textContent = 'Pronto';
});
wmpAudio.addEventListener('ended', () => {
    if (!wmpRepeat) {
    if (wmpIdx < wmpTracks.length - 1) wmpNext();
    else { wmpPlaying = false; document.getElementById('wmp-playbtn').textContent = '▶'; document.getElementById('wmp-status').textContent = 'Fim da playlist'; }
    }
});

/* ══════════════════════════════════════
    CAMPO MINADO
══════════════════════════════════════ */
const MINE_ROWS = 9, MINE_COLS = 9, MINE_COUNT = 10;
let mineBoard = [], mineRevealed = [], mineFlagged = [], mineGameOver = false, mineFirstClick = true;
let mineTimerVal = 0, mineTimerInt = null, mineFlagsUsed = 0;
function mineNewGame() {
    clearInterval(mineTimerInt); mineTimerVal = 0; mineFirstClick = true; mineGameOver = false; mineFlagsUsed = 0;
    mineBoard = Array.from({ length: MINE_ROWS }, () => Array(MINE_COLS).fill(0));
    mineRevealed = Array.from({ length: MINE_ROWS }, () => Array(MINE_COLS).fill(false));
    mineFlagged = Array.from({ length: MINE_ROWS }, () => Array(MINE_COLS).fill(false));
    document.getElementById('mine-smiley').textContent = '🙂';
    mineUpdateSeg('mine-count', MINE_COUNT);
    mineUpdateSeg('mine-timer', 0);
    mineRender();
}
function minePlaceMines(sr, sc) {
    let placed = 0;
    while (placed < MINE_COUNT) {
    const r = Math.floor(Math.random() * MINE_ROWS), c = Math.floor(Math.random() * MINE_COLS);
    if (mineBoard[r][c] === -1) continue;
    if (Math.abs(r - sr) <= 1 && Math.abs(c - sc) <= 1) continue;
    mineBoard[r][c] = -1; placed++;
    }
    for (let r = 0; r < MINE_ROWS; r++) for (let c = 0; c < MINE_COLS; c++) {
    if (mineBoard[r][c] === -1) continue;
    let cnt = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < MINE_ROWS && nc >= 0 && nc < MINE_COLS && mineBoard[nr][nc] === -1) cnt++;
    }
    mineBoard[r][c] = cnt;
    }
}
function mineReveal(r, c) {
    if (mineGameOver || mineRevealed[r][c] || mineFlagged[r][c]) return;
    if (mineFirstClick) {
    mineFirstClick = false;
    minePlaceMines(r, c);
    mineTimerInt = setInterval(() => {
        mineTimerVal = Math.min(mineTimerVal + 1, 999);
        mineUpdateSeg('mine-timer', mineTimerVal);
    }, 1000);
    }
    mineRevealed[r][c] = true;
    if (mineBoard[r][c] === -1) {
    mineGameOver = true;
    clearInterval(mineTimerInt);
    document.getElementById('mine-smiley').textContent = '😵';
    // reveal all mines
    for (let i = 0; i < MINE_ROWS; i++) for (let j = 0; j < MINE_COLS; j++) {
        if (mineBoard[i][j] === -1) mineRevealed[i][j] = true;
    }
    mineRender();
    const boom = document.querySelector(`.mine-cell[data-r="${r}"][data-c="${c}"]`);
    if (boom) boom.classList.add('boom');
    return;
    }
    if (mineBoard[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < MINE_ROWS && nc >= 0 && nc < MINE_COLS && !mineRevealed[nr][nc] && !mineFlagged[nr][nc])
        mineReveal(nr, nc);
    }
    }
    // check win
    let hidden = 0;
    for (let i = 0; i < MINE_ROWS; i++) for (let j = 0; j < MINE_COLS; j++) if (!mineRevealed[i][j]) hidden++;
    if (hidden === MINE_COUNT) {
    mineGameOver = true; clearInterval(mineTimerInt);
    document.getElementById('mine-smiley').textContent = '😎';
    mineUpdateSeg('mine-count', 0);
    }
    mineRender();
}
function mineFlag(r, c) {
    if (mineGameOver || mineRevealed[r][c]) return;
    mineFlagged[r][c] = !mineFlagged[r][c];
    mineFlagsUsed += mineFlagged[r][c] ? 1 : -1;
    mineUpdateSeg('mine-count', Math.max(0, MINE_COUNT - mineFlagsUsed));
    mineRender();
}
function mineRender() {
    const grid = document.getElementById('mine-grid'); if (!grid) return;
    grid.innerHTML = '';
    for (let r = 0; r < MINE_ROWS; r++) for (let c = 0; c < MINE_COLS; c++) {
    const cell = document.createElement('div');
    cell.className = 'mine-cell';
    cell.dataset.r = r; cell.dataset.c = c;
    if (mineRevealed[r][c]) {
        cell.classList.add('revealed');
        if (mineBoard[r][c] === -1) { cell.textContent = '💣'; }
        else if (mineBoard[r][c] > 0) { cell.textContent = mineBoard[r][c]; cell.classList.add('mine-c' + mineBoard[r][c]); }
    } else if (mineFlagged[r][c]) {
        cell.classList.add('flagged'); cell.textContent = '🚩';
    }
    cell.addEventListener('click', () => mineReveal(r, c));
    cell.addEventListener('contextmenu', e => { e.preventDefault(); mineFlag(r, c); });
    cell.addEventListener('mousedown', e => { if (!mineGameOver) document.getElementById('mine-smiley').textContent = '😮'; });
    cell.addEventListener('mouseup', e => { if (!mineGameOver) document.getElementById('mine-smiley').textContent = '🙂'; });
    grid.appendChild(cell);
    }
}
function mineUpdateSeg(id, n) {
    const el = document.getElementById(id); if (!el) return;
    el.textContent = String(Math.max(0, Math.min(999, n))).padStart(3, '0');
}

/* ══════════════════════════════════════
    NOTEPAD++
══════════════════════════════════════ */
let _nppDone = false, _nppFontSize = 12;

/* Escape HTML entities */
const _ne = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Highlight one raw source line */
function nppHL(raw) {
    const tr = raw.trimStart();

    /* HTML comment (full or partial) */
    if (tr.startsWith('<!--'))
    return `<span class="nc">${_ne(raw)}</span>`;

    /* JS/CSS single-line comment */
    if (/^\s*(\/\/|\/\*|\*[ /])/.test(raw))
    return `<span class="nc">${_ne(raw)}</span>`;

    /* CSS property: value lines (no < in line) */
    if (!tr.includes('<') && !tr.startsWith('}') && !tr.startsWith('{')) {
    const cm = raw.match(/^(\s*)([\w-]+)(\s*:\s*)(.+?)(;?\s*)$/);
    if (cm) return _ne(cm[1]) +
        `<span class="np">${_ne(cm[2])}</span>` + _ne(cm[3]) +
        `<span class="nq">${_ne(cm[4])}</span>` + _ne(cm[5]);
    }

    /* JS keywords on lines without tags */
    if (!tr.startsWith('<') && !tr.startsWith('*')) {
    const jm = raw.match(/^(\s*)(const|let|var|function|return|if|else|for|while|class|import|export|new|this|typeof|async|await)(\s)/);
    if (jm) {
        const rest = _ne(raw.slice(jm[1].length + jm[2].length));
        return _ne(jm[1]) + `<span class="nk">${jm[2]}</span>` + rest;
    }
    }

    /* HTML tags – process token by token */
    let out = '', pos = 0;
    const re = /<(\/?)(\w[\w:-]*)([^>]*)>/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
    out += _ne(raw.slice(pos, m.index));
    /* Highlight attributes inside the tag */
    const ah = _ne(m[3]).replace(
        /([\w:-]+)(=(?:"[^"]*"|'[^']*'))/g,
        `<span class="na">$1</span><span class="nv">$2</span>`
    );
    out += `<span class="nb">&lt;${_ne(m[1])}</span>` +
        `<span class="nt">${_ne(m[2])}</span>` +
        ah +
        `<span class="nb">&gt;</span>`;
    pos = m.index + m[0].length;
    }
    out += _ne(raw.slice(pos));
    return out;
}

/* Source code of the portfolio site shown in IE (matheusteixeira.com.br) */
const _nppSource = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Matheus Teixeira — Back-End Developer</title>
<style>
:root {
    --gta-yellow: #f5c518;
    --gta-dark:   #111111;
    --gta-brown:  #8b7355;
    --gta-green:  #4a7c59;
    --gta-red:    #a83232;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background-color: #1a1a1a;
    color: #e8e0d0;
    font-family: 'Pricedown', 'Arial Black', Impact, sans-serif;
    font-size: 13px;
}

/* === HEADER === */
.site-header {
    background: linear-gradient(180deg, #0a0a0a 0%, #1c1c1c 100%);
    border-bottom: 3px solid var(--gta-yellow);
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.logo-wrap { display: flex; flex-direction: column; gap: 2px; }
.logo-name {
    font-size: 28px;
    color: var(--gta-yellow);
    text-shadow: 2px 2px 0 #000, -1px -1px 0 #8b6000;
    letter-spacing: 1px;
}
.logo-role {
    font-size: 12px;
    color: #aaa;
    letter-spacing: 3px;
    text-transform: uppercase;
    font-family: Arial, sans-serif;
    font-weight: bold;
}
.site-nav { display: flex; gap: 4px; }
.site-nav a {
    padding: 6px 14px;
    background: var(--gta-dark);
    color: var(--gta-yellow);
    text-decoration: none;
    font-size: 11px;
    border: 1px solid #333;
    letter-spacing: 1px;
    transition: background 0.15s;
}
.site-nav a:hover { background: var(--gta-yellow); color: #000; }
.site-nav a.active { background: var(--gta-yellow); color: #000; }

/* === TICKER === */
.ticker {
    background: var(--gta-yellow);
    color: #000;
    padding: 3px 0;
    font-size: 12px;
    font-family: Arial, sans-serif;
    overflow: hidden;
    white-space: nowrap;
}
.ticker-inner { display: inline-block; animation: ticker 30s linear infinite; }
@keyframes ticker {
    from { transform: translateX(100vw); }
    to   { transform: translateX(-100%); }
}

/* === HERO === */
.hero {
    background: url('bg-sa.jpg') center / cover no-repeat;
    min-height: 280px;
    display: flex;
    align-items: center;
    padding: 40px 24px;
    position: relative;
}
.hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
}
.hero-content { position: relative; z-index: 1; max-width: 600px; }
.hero-title {
    font-size: 42px;
    color: var(--gta-yellow);
    line-height: 1.1;
    text-shadow: 3px 3px 0 #000;
}
.hero-sub {
    font-size: 14px;
    color: #ccc;
    margin-top: 10px;
    font-family: Arial, sans-serif;
    line-height: 1.6;
}
.hero-btns { display: flex; gap: 10px; margin-top: 18px; }
.btn {
    padding: 10px 24px;
    font-family: 'Arial Black', sans-serif;
    font-size: 12px;
    letter-spacing: 1px;
    cursor: pointer;
    text-decoration: none;
    border: none;
}
.btn-primary   { background: var(--gta-yellow); color: #000; }
.btn-secondary { background: transparent; color: var(--gta-yellow); border: 2px solid var(--gta-yellow); }

/* === SECTIONS === */
.section { padding: 40px 24px; }
.section-title {
    font-size: 22px;
    color: var(--gta-yellow);
    border-left: 4px solid var(--gta-yellow);
    padding-left: 12px;
    margin-bottom: 24px;
    text-shadow: 1px 1px 0 #000;
}

/* === SOBRE MIM === */
.sobre-grid { display: grid; grid-template-columns: 180px 1fr; gap: 24px; align-items: start; }
.sobre-photo {
    width: 180px; height: 220px;
    object-fit: cover;
    border: 3px solid var(--gta-yellow);
    filter: sepia(0.3) contrast(1.1);
}
.sobre-text p { font-family: Arial, sans-serif; line-height: 1.7; color: #ccc; margin-bottom: 12px; }
.sobre-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.tag {
    padding: 4px 12px;
    background: #2a2a2a;
    border: 1px solid var(--gta-brown);
    color: var(--gta-yellow);
    font-size: 11px;
    letter-spacing: 1px;
}

/* === PROJETOS === */
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.project-card {
    background: #1e1e1e;
    border: 1px solid #333;
    padding: 16px;
    transition: border-color 0.2s;
}
.project-card:hover { border-color: var(--gta-yellow); }
.project-title { color: var(--gta-yellow); font-size: 14px; margin-bottom: 8px; }
.project-desc { font-family: Arial, sans-serif; font-size: 12px; color: #aaa; line-height: 1.5; }
.project-tech { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 10px; }
.tech-badge { padding: 2px 8px; background: var(--gta-green); color: #fff; font-size: 10px; font-family: monospace; }

/* === HABILIDADES === */
.skills-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.skill-item { text-align: center; padding: 16px 8px; background: #1e1e1e; border: 1px solid #333; }
.skill-ico { font-size: 28px; display: block; margin-bottom: 6px; }
.skill-name { font-size: 11px; color: #aaa; font-family: Arial, sans-serif; }
.skill-bar-wrap { height: 4px; background: #333; margin-top: 8px; border-radius: 2px; }
.skill-bar { height: 4px; background: var(--gta-yellow); border-radius: 2px; }

/* === FOOTER === */
.site-footer {
    background: #0a0a0a;
    border-top: 2px solid #222;
    padding: 20px 24px;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #555;
}
</style>
</head>
<body>

<!-- HEADER -->
<header class="site-header">
<div class="logo-wrap">
    <span class="logo-name">Matheus Teixeira</span>
    <span class="logo-role">Back-End Developer · São Paulo, Brasil</span>
</div>
<nav class="site-nav">
    <a href="#inicio" class="active">Início</a>
    <a href="#sobre">Sobre Mim</a>
    <a href="#projetos">Projetos</a>
    <a href="#habilidades">Habilidades</a>
    <a href="#blog">Blog</a>
    <a href="#cv">Baixar CV</a>
    <a href="#contato">Contato</a>
</nav>
</header>

<!-- TICKER -->
<div class="ticker">
<span class="ticker-inner">
    ★ DISPONÍVEL PARA NOVOS PROJETOS ★ PHP · Laravel · Go · Python · Docker · PostgreSQL
    ★ CONTATO: matheus@matheusteixeira.com.br ★ SÃO PAULO, SP ★ 5+ ANOS DE EXPERIÊNCIA ★
</span>
</div>

<!-- HERO -->
<section class="hero" id="inicio">
<div class="hero-content">
    <h1 class="hero-title">Back-End<br>Developer</h1>
    <p class="hero-sub">
    Especialista em PHP, Laravel e Go. Construindo APIs robustas,<br>
    microsserviços escaláveis e sistemas de alta disponibilidade.
    </p>
    <div class="hero-btns">
    <a class="btn btn-primary" href="#projetos">Ver Projetos</a>
    <a class="btn btn-secondary" href="#contato">Entrar em Contato</a>
    </div>
</div>
</section>

<!-- SOBRE MIM -->
<section class="section" id="sobre">
<h2 class="section-title">Sobre Mim</h2>
<div class="sobre-grid">
    <img class="sobre-photo" src="src/img/matheus.jpg" alt="Matheus Teixeira">
    <div class="sobre-text">
    <p>
        Desenvolvedor back-end com mais de 5 anos de experiência construindo
        aplicações web de alta performance. Apaixonado por arquitetura limpa,
        código bem testado e soluções que escalam.
    </p>
    <p>
        Trabalho principalmente com PHP/Laravel no dia a dia, mas também uso
        Go para serviços que exigem alto throughput. Experiência sólida com
        bancos de dados relacionais (PostgreSQL, MySQL) e mensageria
        (RabbitMQ, Redis).
    </p>
    <p>
        Quando não estou codando, estou contribuindo para open source,
        escrevendo no blog ou explorando novas tecnologias de backend.
    </p>
    <div class="sobre-tags">
        <span class="tag">PHP 8.3</span>
        <span class="tag">Laravel 11</span>
        <span class="tag">Go 1.22</span>
        <span class="tag">Docker</span>
        <span class="tag">PostgreSQL</span>
        <span class="tag">Redis</span>
        <span class="tag">RabbitMQ</span>
        <span class="tag">TDD</span>
    </div>
    </div>
</div>
</section>

<!-- PROJETOS -->
<section class="section" id="projetos">
<h2 class="section-title">Projetos</h2>
<div class="projects-grid">

    <div class="project-card">
    <div class="project-title">📦 PaymentGateway API</div>
    <p class="project-desc">
        Gateway de pagamentos multi-provider com suporte a Pix, cartão e boleto.
        Processa +50k transações/dia com 99.97% de uptime.
    </p>
    <div class="project-tech">
        <span class="tech-badge">Laravel</span>
        <span class="tech-badge">PostgreSQL</span>
        <span class="tech-badge">Redis</span>
    </div>
    </div>

    <div class="project-card">
    <div class="project-title">🚀 MicroAuth Service</div>
    <p class="project-desc">
        Microsserviço de autenticação com JWT, OAuth2 e suporte a 2FA.
        Arquitetura hexagonal, 100% de cobertura de testes.
    </p>
    <div class="project-tech">
        <span class="tech-badge">Go</span>
        <span class="tech-badge">gRPC</span>
        <span class="tech-badge">Docker</span>
    </div>
    </div>

    <div class="project-card">
    <div class="project-title">📊 DataPipeline Worker</div>
    <p class="project-desc">
        Worker assíncrono para processamento de eventos em tempo real.
        Consome +1M mensagens/hora via RabbitMQ.
    </p>
    <div class="project-tech">
        <span class="tech-badge">PHP</span>
        <span class="tech-badge">RabbitMQ</span>
        <span class="tech-badge">MySQL</span>
    </div>
    </div>

</div>
</section>

<!-- HABILIDADES -->
<section class="section" id="habilidades">
<h2 class="section-title">Habilidades</h2>
<div class="skills-grid">
    <div class="skill-item">
    <span class="skill-ico">🐘</span>
    <div class="skill-name">PHP</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:95%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">⚡</span>
    <div class="skill-name">Laravel</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:92%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">🐹</span>
    <div class="skill-name">Go</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:78%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">🐍</span>
    <div class="skill-name">Python</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:70%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">🐘</span>
    <div class="skill-name">PostgreSQL</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:88%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">🐳</span>
    <div class="skill-name">Docker</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:85%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">☁️</span>
    <div class="skill-name">AWS</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:72%"></div></div>
    </div>
    <div class="skill-item">
    <span class="skill-ico">🔄</span>
    <div class="skill-name">RabbitMQ</div>
    <div class="skill-bar-wrap"><div class="skill-bar" style="width:80%"></div></div>
    </div>
</div>
</section>

<!-- FOOTER -->
<footer class="site-footer">
<p>© 2025 Matheus Teixeira — Back-End Developer</p>
<p style="margin-top:6px">
    matheus@matheusteixeira.com.br
    · github.com/matheusteixeira
    · linkedin.com/in/matheusteixeira
</p>
</footer>

</body>
</html>`;

function nppInit() {
    if (_nppDone) return;
    _nppDone = true;
    const lines = _nppSource.split('\n');
    const gutter = document.getElementById('npp-gutter');
    const code = document.getElementById('npp-code');
    if (!gutter || !code) return;
    gutter.textContent = lines.map((_, i) => String(i + 1).padStart(4)).join('\n');
    code.textContent = 'Renderizando…';
    setTimeout(() => {
    code.innerHTML = lines.map(nppHL).join('\n');
    document.getElementById('npp-s-total').textContent =
        lines.length + ' linhas';
    }, 30);
}

function nppSyncScroll(el) {
    const g = document.getElementById('npp-gutter');
    if (g) g.scrollTop = el.scrollTop;
}

function nppClick(e) {
    const code = document.getElementById('npp-code');
    if (!code) return;
    const text = code.innerText || code.textContent;
    const before = text.substring(0, getCaretOffset(code, e));
    const ln = (before.match(/\n/g) || []).length + 1;
    const lastNl = before.lastIndexOf('\n');
    const col = before.length - lastNl;
    document.getElementById('npp-s-ln').textContent = `Ln: ${ln}    Col: ${col}`;
}

function getCaretOffset(el, e) {
    try {
    const r = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(e.clientX, e.clientY)
        : document.caretPositionFromPoint
        ? (() => { const p = document.caretPositionFromPoint(e.clientX, e.clientY); return { startOffset: p.offset, startContainer: p.offsetNode }; })()
        : null;
    if (!r) return 0;
    const range = document.createRange();
    range.setStart(el, 0); range.setEnd(r.startContainer, r.startOffset);
    return range.toString().length;
    } catch (_) { return 0; }
}

function nppZoom(dir) {
    _nppFontSize = Math.max(8, Math.min(20, _nppFontSize + dir * 1));
    const px = _nppFontSize + 'px';
    const lh = (_nppFontSize + 5) + 'px';
    ['npp-code', 'npp-gutter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.fontSize = px; el.style.lineHeight = lh; }
    });
}

/* ══════════════════════════════════════
    SCREENSAVER
══════════════════════════════════════ */
let idleTimer = null;
function resetIdleTimer() { clearTimeout(idleTimer); idleTimer = setTimeout(triggerScreensaver, 30000); }
['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, () => { if (document.getElementById('screensaver').style.display === 'block') { exitScreensaver(); return; } resetIdleTimer(); });
});
function triggerScreensaver() {
    closeStartMenu();
    const ss = document.getElementById('screensaver'); ss.style.display = 'block'; ss.innerHTML = '';
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff', '#fa0', '#aff'];
    for (let i = 0; i < 18; i++) {
    const p = document.createElement('div'); p.className = 'pipe';
    const h = Math.random() > 0.5, c = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * 100, y = Math.random() * 100, l = 80 + Math.random() * 200, th = 6 + Math.random() * 8;
    p.style.setProperty('--c', c);
    p.style.cssText += (h ? `left:${x}%;top:${y}%;width:${l}px;height:${th}px` : `left:${x}%;top:${y}%;width:${th}px;height:${l}px`) + ';';
    ss.appendChild(p);
    }
    const msgs = ['PHP 8.3', 'Laravel', 'MySQL', 'Docker', 'n8n', 'Redis', 'REST API', 'CI/CD', 'matheusteixeira.com.br'];
    msgs.forEach(m => {
    const t = document.createElement('div'); t.className = 'ss-text';
    const sx = Math.random() * 80 + 'vw', sy = Math.random() * 80 + 'vh', ex = Math.random() * 80 + 'vw', ey = Math.random() * 80 + 'vh';
    t.textContent = m; t.style.cssText = `--sx:${sx};--sy:${sy};--ex:${ex};--ey:${ey};--d:${6 + Math.random() * 10}s;animation-delay:${Math.random() * 5}s;left:0;top:0;`;
    ss.appendChild(t);
    });
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:60px;width:100%;text-align:center;color:#444;font-size:11px;font-family:monospace;';
    hint.textContent = 'Clique ou pressione qualquer tecla para sair';
    ss.appendChild(hint);
}
function exitScreensaver() { document.getElementById('screensaver').style.display = 'none'; resetIdleTimer(); sndClick(); }

/* ══════════════════════════════════════
    EXPLORER FILE SELECT
══════════════════════════════════════ */
function selFile(el, desc) {
    sndClick();
    const parentWin = el.closest('.xp-win');
    if (parentWin) {
        parentWin.querySelectorAll('.xp-file').forEach(f => f.style.background = '');
    } else {
        document.querySelectorAll('.xp-file').forEach(f => f.style.background = '');
    }
    el.style.background = '#b8d4f0';
    const statusSpans = parentWin ? parentWin.querySelectorAll('.xp-statusbar span') : [];
    const lastSpan = statusSpans.length > 1 ? statusSpans[statusSpans.length - 1] : document.getElementById('proj-sel');
    if (lastSpan) lastSpan.textContent = desc.length > 50 ? desc.substring(0, 47) + '...' : desc;
    const s = document.getElementById('proj-sel');
    if (s && s !== lastSpan) s.textContent = desc;
}

/* ══════════════════════════════════════
    SHOW DESKTOP
══════════════════════════════════════ */
function showDesktop() {
    sndMinimize();
    document.querySelectorAll('.xp-win').forEach(w => {
    if (w.style.display !== 'none' && !w.classList.contains('minimized')) {
        w.classList.add('minimized');
        const id = w.id; const tbi = document.getElementById('tbi-' + id);
        if (tbi) tbi.classList.remove('tb-active');
    }
    });
}

/* ══════════════════════════════════════
    SHUTDOWN
══════════════════════════════════════ */
function doShutdown() {
    closeStartMenu();
    localStorage.removeItem('xp_dirty'); // clean shutdown
    const shutSnd = new Audio('src/sounds/windows-xp-desligando.mp3');
    shutSnd.volume = 0.65;
    shutSnd.play().catch(() => sndShutdown());
    setTimeout(() => {
        const sd = document.getElementById('shutdown');
        sd.style.display = 'flex';
        // Add a small force-close X button to simulate dirty shutdown on reload
        if (!document.getElementById('sd-force-x')) {
            const btn = document.createElement('div');
            btn.id = 'sd-force-x';
            btn.title = 'Forçar desligamento';
            btn.textContent = '✕';
            btn.style.cssText = 'position:absolute;top:10px;right:14px;color:#777;font-size:14px;cursor:pointer;user-select:none;';
            btn.onclick = () => { localStorage.setItem('xp_dirty', '1'); location.reload(); };
            sd.appendChild(btn);
        }
    }, 600);
}

/* ══════════════════════════════════════
    DESKTOP ICON SELECTION + DBLCLICK FLASH
══════════════════════════════════════ */
document.querySelectorAll('.d-icon').forEach(ico => {
    ico.addEventListener('click', e => {
    sndClick();
    document.querySelectorAll('.d-icon').forEach(i => i.classList.remove('selected'));
    ico.classList.add('selected'); e.stopPropagation();
    });
    ico.addEventListener('dblclick', () => {
    ico.style.opacity = '0.45';
    setTimeout(() => ico.style.opacity = '1', 160);
    });
});
document.getElementById('desktop').addEventListener('click', e => {
    if (!e.target.closest('.d-icon')) document.querySelectorAll('.d-icon').forEach(i => i.classList.remove('selected'));
});

/* ══════════════════════════════════════
    RESIZE HANDLES — TODAS AS DIREÇÕES
══════════════════════════════════════ */
document.querySelectorAll('.xp-resize').forEach(el => el.remove());
document.querySelectorAll('.xp-win').forEach(w => {
    ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(dir => {
    const h = document.createElement('div');
    h.className = 'xp-rh xp-rh-' + dir;
    h.addEventListener('mousedown', e => { e.stopPropagation(); startResize(e, w.id, dir); });
    w.appendChild(h);
    });
});

/* ══════════════════════════════════════
    MEUS DOCUMENTOS — EXPLORER
══════════════════════════════════════ */
const mydocsTree = {
    root: {
        addr: 'C:\\Documents and Settings\\Matheus\\Meus Documentos\\',
        label: 'Meus Documentos',
        detail: 'Meus Documentos<br>Pasta do sistema<br><br>10 objetos',
        count: '10 objetos',
        items: [
            { ico: _ico('pasta-vazia.ico'), name: 'Downloads',                type: 'Pasta de arquivos', size: '',      action: () => openWindow('win-downloads') },
            { ico: _ico('pasta-vazia.ico'), name: 'Projetos de Desenvolvimento', type: 'Pasta de arquivos', size: '',   action: () => openWindow('win-dev-projects') },
            { ico: _ico('minhas-musicas.ico'), name: 'Minhas Músicas',           type: 'Pasta do sistema',   size: '',      action: () => { showNotif('🎵 Minhas Músicas', 'Pasta vazia. Tudo está no Winamp.'); sndClick(); } },
            { ico: _ico('minhas-imagens.ico'), name: 'Minhas Imagens',           type: 'Pasta do sistema',   size: '',      action: () => mydocsNav('imagens') },
            { ico: _ico('wordpad.webp'), name: 'Carta_Apresentacao.rtf', type: 'Documento RTF', size: '12 KB', action: () => openWindow('win-carta-edmundo') },
            { ico: _ico('bloco-de-notas-icon.png'), name: 'TODO_vida_2025.txt',       type: 'Arquivo de Texto',   size: '3 KB',  action: () => openWindow('win-todo-doc') },
            { ico: _ico('wordpad.webp'), name: 'PlanoNegociosMilhao_v7_DEFINITIVO.doc', type: 'Documento Word', size: '28 KB', action: () => openWindow('win-saas-plan') },
            { ico: _ico('bloco-de-notas-icon.png'), name: 'receitas_bacalhau_mae.txt',type: 'Arquivo de Texto',   size: '2 KB',  action: () => openReceitaDoc() },
            { ico: '🌐', name: 'primeiro_site.html',       type: 'Documento HTML',     size: '4 KB',  action: () => { showNotif('🌐 primeiro_site.html','<marquee>Bem vindo ao site do Matheus!!</marquee><br>Feito em 2012 com Notepad e muito amor. Tabelas dentro de tabelas dentro de tabelas.'); sndClick(); } },
            { ico: _ico('bloco-de-notas-icon.png'), name: 'plano_mestre_oficina.txt', type: 'Arquivo de Texto',   size: '6 KB',  action: () => { showNotif('🔧 Mestre Oficina','Plano de Negócio v12 — SaaS para gestão de oficinas mecânicas. Laravel + MySQL + n8n. Meta: 100 oficinas até 2026.'); sndClick(); } },
        ]
    },
    imagens: {
        addr: 'C:\\Documents and Settings\\Matheus\\Meus Documentos\\Minhas Imagens\\',
        label: 'Minhas Imagens',
        detail: 'Minhas Imagens<br>Pasta do sistema<br><br>3 pastas',
        count: '3 pastas',
        items: [
            { ico: _ico('pasta-vazia.ico'), name: 'Família',   type: 'Pasta de arquivos', size: '', action: () => mydocsNav('img-familia') },
            { ico: _ico('pasta-vazia.ico'), name: 'Edmundo',   type: 'Pasta de arquivos', size: '', action: () => mydocsNav('img-edmundo') },
            { ico: _ico('pasta-vazia.ico'), name: 'Palestras', type: 'Pasta de arquivos', size: '', action: () => mydocsNav('img-palestras') },
        ]
    },
    'img-familia': {
        addr: 'C:\\Documents and Settings\\Matheus\\Meus Documentos\\Minhas Imagens\\Família\\',
        label: 'Família',
        detail: 'Família<br>Pasta de arquivos<br><br>7 objetos',
        count: '7 objetos',
        items: [
            { ico: _ico('minhas-imagens.ico'), name: 'carla_e_eu_macae.jpg',       type: 'Imagem JPEG', size: '2,4 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'manu_e_matheus.jpg',          type: 'Imagem JPEG', size: '1,8 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'celo_e_matheus.jpg',          type: 'Imagem JPEG', size: '2,1 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'natal_familia_2024.jpg',      type: 'Imagem JPEG', size: '3,6 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'ferias_ilha_grande.jpg',      type: 'Imagem JPEG', size: '4,2 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'churrasco_domingo.jpg',       type: 'Imagem JPEG', size: '2,9 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'aniversario_carla_2023.jpg',  type: 'Imagem JPEG', size: '1,6 MB', action: () => sndClick() },
        ]
    },
    'img-edmundo': {
        addr: 'C:\\Documents and Settings\\Matheus\\Meus Documentos\\Minhas Imagens\\Edmundo\\',
        label: 'Edmundo',
        detail: 'Edmundo<br>Pasta de arquivos<br><br>6 objetos',
        count: '6 objetos',
        items: [
            { ico: _ico('minhas-imagens.ico'), name: 'show_vespas_mandarinas.jpg',  type: 'Imagem JPEG', size: '3,1 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'rua_bento_sp.jpg',             type: 'Imagem JPEG', size: '2,7 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'feijoada_do_edmundo.jpg',      type: 'Imagem JPEG', size: '1,4 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'bar_sagarana_rj.jpg',          type: 'Imagem JPEG', size: '2,2 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'trilha_pedra_bonita.jpg',      type: 'Imagem JPEG', size: '3,8 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'anos_novos_copacabana.jpg',    type: 'Imagem JPEG', size: '4,1 MB', action: () => sndClick() },
        ]
    },
    'img-palestras': {
        addr: 'C:\\Documents and Settings\\Matheus\\Meus Documentos\\Minhas Imagens\\Palestras\\',
        label: 'Palestras',
        detail: 'Palestras<br>Pasta de arquivos<br><br>6 objetos',
        count: '6 objetos',
        items: [
            { ico: _ico('minhas-imagens.ico'), name: 'palestra_senac_php_2024.jpg',  type: 'Imagem JPEG', size: '2,8 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'turma_web_design_senac.jpg',   type: 'Imagem JPEG', size: '3,4 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'workshop_laravel_rj.jpg',       type: 'Imagem JPEG', size: '2,1 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'phpconf_brasil_2024.jpg',       type: 'Imagem JPEG', size: '3,9 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'eu_no_palco_phpconf.jpg',       type: 'Imagem JPEG', size: '2,6 MB', action: () => sndClick() },
            { ico: _ico('minhas-imagens.ico'), name: 'certificado_instrutor.jpg',     type: 'Imagem JPEG', size: '0,8 MB', action: () => sndClick() },
        ]
    },
};

let mydocsHistory = ['root'];

function mydocsInit() {
    mydocsHistory = ['root'];
    mydocsRender('root');
    const backBtn = document.getElementById('mydocs-back');
    if (backBtn) backBtn.style.opacity = '0.4';
}

function mydocsRender(key) {
    const node = mydocsTree[key];
    if (!node) return;
    const container = document.getElementById('mydocs-icons');
    const addrEl = document.getElementById('mydocs-addr');
    const titleEl = document.getElementById('mydocs-title-txt');
    const statusEl = document.getElementById('mydocs-status');
    const detailEl = document.getElementById('mydocs-sb-detail');
    if (addrEl) addrEl.textContent = node.addr;
    if (titleEl) titleEl.textContent = node.label;
    if (statusEl) statusEl.textContent = node.count;
    if (detailEl) detailEl.innerHTML = node.detail;
    if (!container) return;
    container.innerHTML = '';
    node.items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'mydocs-icon';
        el.innerHTML = `<div class="mydocs-icon-img">${item.ico}</div><div class="mydocs-icon-lbl">${item.name}</div>`;
        el.title = item.name + (item.size ? ' · ' + item.size : '') + '\n' + item.type;
        el.addEventListener('click', () => {
            sndClick();
            container.querySelectorAll('.mydocs-icon').forEach(i => i.classList.remove('selected'));
            el.classList.add('selected');
            if (detailEl) detailEl.innerHTML = `<strong>${item.name}</strong><br>${item.type}${item.size ? '<br>' + item.size : ''}`;
        });
        el.addEventListener('dblclick', () => { item.action(); });
        container.appendChild(el);
    });
}

function mydocsNav(key) {
    if (!mydocsTree[key]) return;
    sndClick();
    mydocsHistory.push(key);
    mydocsRender(key);
    const backBtn = document.getElementById('mydocs-back');
    if (backBtn) backBtn.style.opacity = '1';
}

function mydocsNavBack() {
    if (mydocsHistory.length <= 1) return;
    mydocsHistory.pop();
    const key = mydocsHistory[mydocsHistory.length - 1];
    mydocsRender(key);
    const backBtn = document.getElementById('mydocs-back');
    if (backBtn) backBtn.style.opacity = mydocsHistory.length <= 1 ? '0.4' : '1';
}

function mydocsGoUp() {
    sndClick();
    mydocsHistory = ['root'];
    mydocsRender('root');
    const backBtn = document.getElementById('mydocs-back');
    if (backBtn) backBtn.style.opacity = '0.4';
}


function openReceitaDoc() {
    const existingId = 'win-receita';
    let w = document.getElementById(existingId);
    if (!w) {
        w = document.createElement('div');
        w.id = existingId;
        w.className = 'xp-win';
        w.style.cssText = 'width:500px;top:85px;left:155px;display:none;';
        w.innerHTML = `
        <div class="xp-titlebar" onmousedown="startDrag(event,'win-receita')">
          <span class="xp-titlebar-ico">📄</span>
          <span class="xp-titlebar-txt">receitas_bacalhau_mae.txt — Bloco de Notas</span>
          <div class="xp-wbtns">
            <div class="xp-wbtn wmin" onclick="minimizeWin('win-receita')">_</div>
            <div class="xp-wbtn wmax" onclick="maximizeWin('win-receita')">□</div>
            <div class="xp-wbtn wcls" onclick="closeWin('win-receita')">✕</div>
          </div>
        </div>
        <div class="notepad-menu">
          <div class="notepad-menu-item">Arquivo</div>
          <div class="notepad-menu-item">Editar</div>
          <div class="notepad-menu-item">Formatar</div>
          <div class="notepad-menu-item">Ajuda</div>
        </div>
        <textarea class="notepad-textarea" readonly style="height:340px;font-family:'Courier New',monospace;font-size:12px">RECEITA DA MÃE — Bacalhau de Sexta Santa
=========================================
(digitada às pressas antes de esquecer)

Ingredientes:
- 1 kg de bacalhau dessalgado (deixar de molho 48h, trocar água 3x)
- 1 kg de batata em rodelas
- 4 ovos cozidos
- 1 cebola grande em rodelas
- 3 dentes de alho picados
- Azeitonas pretas a gosto
- Azeite de oliva generoso (não economiza não)
- Cheiro verde
- Sal e pimenta do reino

Modo de preparo:
1. Cozinhar o bacalhau no leite com alho por 15 min
2. Desfiar e reservar
3. Fritar a cebola no azeite até dourar
4. Adicionar o bacalhau, misturar bem
5. Arrumaro no refratário em camadas:
   batata, bacalhau, ovo, azeitona
6. Regar com bastante azeite
7. Forno 180° por 40 minutos

Obs da mãe: "não exagera no sal porque o bacalhau
já tem sal mesmo depois de dessalgar"

Obs minha: nunca fica igual ao dela mesmo seguindo
a receita igual. é um mistério da natureza.

=========================================
Salvo em: 24/12/2019
"Faz um bacalhau ai fiiio" — Mãe, toda sexta santa
</textarea>
        <div class="notepad-statusbar">
          <span>Somente leitura</span>
          <span>Linha 1, Col 1</span>
        </div>`;
        document.getElementById('desktop').appendChild(w);
        winMeta[existingId] = { ico: '📄', lbl: 'receitas_bacalhau_mae.txt' };
        const newW = document.getElementById(existingId);
        ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].forEach(dir => {
            const h = document.createElement('div');
            h.className = 'xp-rh xp-rh-' + dir;
            h.addEventListener('mousedown', e => { e.stopPropagation(); startResize(e, existingId, dir); });
            newW.appendChild(h);
        });
        document.addEventListener('mousedown', e => {
            const win = e.target.closest('.xp-win');
            if (win && win.id === existingId) focusWin(existingId);
        }, true);
    }
    openWindow(existingId);
}

function dlVirusAlert() {
    sndNotif();
    showNotif('⚠️ Windows Security Alert',
        'ATENÇÃO: limewire_pro_GRATIS.exe pode conter vírus!\nEsse arquivo é suspeito. Não abrir.');
}

/* ══════════════════════════════════════
    BSOD
══════════════════════════════════════ */
function triggerBsod() {
    const el = document.getElementById('bsod');
    if (!el) return;
    el.style.display = 'flex';
    let pct = 0;
    const pctEl = document.getElementById('bsod-pct');
    const iv = setInterval(() => {
        pct += Math.floor(Math.random() * 4) + 1;
        if (pct >= 100) { pct = 100; clearInterval(iv); }
        if (pctEl) pctEl.textContent = pct;
    }, 180);
}
function exitBsod() {
    const el = document.getElementById('bsod');
    if (el) el.style.display = 'none';
    document.getElementById('bsod-pct').textContent = '0';
}

/* ══════════════════════════════════════
    RUN DIALOG (Win+R)
══════════════════════════════════════ */
const runCommands = {
    'notepad': () => openWindow('win-notepad'),
    'calc': () => openWindow('win-calc'),
    'mspaint': () => openWindow('win-paint'),
    'winmine': () => openWindow('win-mine'),
    'iexplore': () => openWindow('win-about'),
    'explorer': () => openWindow('win-mydocs'),
    'taskmgr': () => openWindow('win-taskmgr'),
    'wordpad': () => openWindow('win-cv'),
    'cmd': () => openWindow('win-cmd'),
    'msn': () => toggleMSN(),
    'wmp': () => toggleWMP(),
    'shutdown': () => doShutdown(),
    'bsod': () => triggerBsod(),
};

function openRun() {
    sndClick();
    const el = document.getElementById('win-run');
    if (!el) return;
    el.style.display = 'block';
    setTimeout(() => document.getElementById('run-input').focus(), 50);
}
function closeRun() {
    sndClose();
    document.getElementById('win-run').style.display = 'none';
    document.getElementById('run-input').value = '';
}
function runExecute() {
    const val = (document.getElementById('run-input').value || '').trim().toLowerCase();
    closeRun();
    const fn = runCommands[val];
    if (fn) { fn(); }
    else if (val) {
        setTimeout(() => {
            showNotif('Executar', `Windows não encontrou "${val}". Verifique o nome e tente novamente.`);
            sndNotif();
        }, 200);
    }
}
function runKey(e) {
    if (e.key === 'Enter') runExecute();
    if (e.key === 'Escape') closeRun();
}

document.addEventListener('keydown', e => {
    if ((e.metaKey || e.key === 'F12') && e.key === 'r') { e.preventDefault(); openRun(); }
    if (e.ctrlKey && e.shiftKey && e.key === 'Escape') { e.preventDefault(); openWindow('win-taskmgr'); }
});

/* ══════════════════════════════════════
    GERENCIADOR DE TAREFAS
══════════════════════════════════════ */
const tmProcesses = [
    { name: 'System Idle Process', pid: 0,    cpu: 0,  mem: 16,    desc: 'Processo Ocioso do Sistema' },
    { name: 'System',              pid: 4,    cpu: 0,  mem: 228,   desc: 'Sistema' },
    { name: 'explorer.exe',        pid: 1492, cpu: 1,  mem: 18432, desc: 'Windows Explorer' },
    { name: 'php.exe',             pid: 2048, cpu: 12, mem: 32768, desc: 'PHP 8.3 CLI' },
    { name: 'laravel.exe',         pid: 2196, cpu: 8,  mem: 65536, desc: 'Laravel Development Server' },
    { name: 'mysql.exe',           pid: 2312, cpu: 2,  mem: 81920, desc: 'MySQL 8.2 Server' },
    { name: 'redis-server.exe',    pid: 2400, cpu: 0,  mem: 8192,  desc: 'Redis Cache Server' },
    { name: 'docker.exe',          pid: 2588, cpu: 5,  mem: 204800,desc: 'Docker Desktop' },
    { name: 'node.exe',            pid: 2744, cpu: 3,  mem: 45056, desc: 'Node.js Runtime' },
    { name: 'n8n.exe',             pid: 2900, cpu: 1,  mem: 57344, desc: 'n8n Automation Server' },
    { name: 'chrome.exe',          pid: 3012, cpu: 15, mem: 307200,desc: 'Google Chrome' },
    { name: 'vscode.exe',          pid: 3200, cpu: 4,  mem: 245760,desc: 'Visual Studio Code' },
    { name: 'spotify.exe',         pid: 3388, cpu: 2,  mem: 122880,desc: 'Spotify Music Player' },
    { name: 'winamp.exe',          pid: 3512, cpu: 1,  mem: 12288, desc: 'Winamp Media Player' },
    { name: 'msn.exe',             pid: 3640, cpu: 0,  mem: 20480, desc: 'Windows Live Messenger' },
    { name: 'notepad.exe',         pid: 3760, cpu: 0,  mem: 4096,  desc: 'Bloco de Notas' },
    { name: 'taskmgr.exe',         pid: 3888, cpu: 2,  mem: 8192,  desc: 'Gerenciador de Tarefas' },
    { name: 'stress.exe',          pid: 4096, cpu: 99, mem: 1024,  desc: '⚠ MATHEUS_TRABALHO_SEMANA.exe' },
];
let tmSelectedProc = null;
let tmUpdateTimer = null;

function taskmgrInit() {
    renderTmProcs();
    tmUpdateTimer = setInterval(tmUpdate, 2000);
}
function tmKillSelected() {
    if (!tmSelectedProc) { showNotif('Gerenciador de Tarefas', 'Selecione um processo para finalizar.'); return; }
    if (tmSelectedProc === 'stress.exe') {
        showNotif('✅ Processo finalizado', 'stress.exe encerrado. Você está bem agora. 😮‍💨');
        tmProcesses.find(p => p.name === 'stress.exe').cpu = 2;
    } else {
        showNotif('⚠ Aviso', `Finalizar "${tmSelectedProc}" pode causar instabilidade no sistema.\nUse com cuidado.`);
    }
    sndNotif();
    tmSelectedProc = null;
    renderTmProcs();
}
function renderTmProcs() {
    const list = document.getElementById('tm-proc-list');
    if (!list) return;
    list.innerHTML = '';
    let totalCpu = 0, totalMem = 0;
    tmProcesses.forEach(p => {
        const row = document.createElement('div');
        row.className = 'tm-proc-row' + (p.name === tmSelectedProc ? ' selected' : '');
        const cpuColor = p.cpu > 50 ? '#c00' : p.cpu > 20 ? '#e88020' : '#1a1a1a';
        row.innerHTML = `<span>${p.name}</span><span style="text-align:right">${p.pid}</span><span style="text-align:right;color:${cpuColor}">${p.cpu}</span><span style="text-align:right">${(p.mem/1024).toFixed(1)}</span><span style="color:#556;font-size:10px">${p.desc}</span>`;
        row.addEventListener('click', () => {
            tmSelectedProc = p.name;
            sndClick();
            list.querySelectorAll('.tm-proc-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        });
        list.appendChild(row);
        totalCpu += p.cpu;
        totalMem += p.mem;
    });
    const cpu = Math.min(totalCpu, 99);
    const memGB = (totalMem / 1024 / 1024).toFixed(1) + ' GB';
    ['tm-status-procs','tm-proc-count'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = tmProcesses.length; });
    ['tm-status-cpu','tm-cpu-pct'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = cpu + '%'; });
    ['tm-status-mem','tm-mem-pct'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = memGB; });
}
function tmUpdate() {
    tmProcesses.forEach(p => {
        if (p.name === 'System Idle Process') return;
        p.cpu = Math.max(0, Math.min(p.cpu === 99 ? 99 : p.cpu, p.cpu + Math.floor(Math.random() * 5) - 2));
        p.mem = Math.max(1024, p.mem + Math.floor(Math.random() * 512) - 256);
    });
    renderTmProcs();
    drawTmPerf();
}
function tmSwitchTab(tab) {
    ['proc', 'perf', 'net', 'users'].forEach(t => {
        const pane = document.getElementById('tm-' + t);
        const tabEl = document.getElementById('tmtab-' + t);
        if (pane) pane.style.display = t === tab ? 'flex' : 'none';
        if (tabEl) tabEl.classList.toggle('active', t === tab);
    });
    if (tab === 'perf') drawTmPerf();
    sndClick();
}
const tmCpuHist = Array(20).fill(20);
const tmMemHist = Array(20).fill(60);
function drawTmPerf() {
    const cpuPct = parseInt(document.getElementById('tm-cpu-pct')?.textContent) || 42;
    tmCpuHist.push(cpuPct); tmCpuHist.shift();
    tmMemHist.push(50 + Math.random() * 10); tmMemHist.shift();
    [['tm-cpu-canvas', tmCpuHist, '#00c000'],
     ['tm-cpuhist-canvas', tmCpuHist, '#00c000'],
     ['tm-mem-canvas', tmMemHist, '#ffaa00'],
     ['tm-memhist-canvas', tmMemHist, '#ffaa00']].forEach(([id, data, color]) => {
        const c = document.getElementById(id);
        if (!c) return;
        const ctx = c.getContext('2d');
        const W = c.width, H = c.height;
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#003300';
        ctx.lineWidth = 1;
        for (let y = 0; y < H; y += 10) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        for (let x = 0; x < W; x += 10) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.beginPath();
        data.forEach((v, i) => {
            const x = (i / (data.length - 1)) * W;
            const y = H - (v / 100) * H;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
    });
}

/* ══════════════════════════════════════
    CMD.EXE — PROMPT DE COMANDO
══════════════════════════════════════ */
let cmdCwd = 'C:\\Users\\Matheus';
let cmdHistory = [];
let cmdHistIdx = -1;

const cmdFs = {
    'C:\\Users\\Matheus': ['Desktop', 'Documents', 'Downloads', 'Projetos', 'Music', 'Pictures', '.bashrc'],
    'C:\\Users\\Matheus\\Projetos': ['recepti', 'mestre-oficina', 'ixani', 'site-pessoal-xp', 'n8n-flows', 'README.md', 'docker-compose.yml'],
    'C:\\Users\\Matheus\\Desktop': ['Curriculo.rtf', 'Notepad.exe', 'TODO_vida_2025.txt'],
    'C:\\Users\\Matheus\\Downloads': ['winamp_5.66_final_build.exe','cs_1.6_maps_dust2_pack.zip','php_manual_completo_pt-BR.pdf','utorrent_2.2.1.exe','limewire_pro_GRATIS.exe','docker_desktop_installer.exe'],
};

const cmdHandlers = {
    'cls': () => { document.getElementById('cmd-output').innerHTML = ''; return null; },
    'help': () => `
<span style="color:#fff">Comandos disponíveis:</span>
  cls              Limpa a tela
  dir              Lista arquivos e pastas
  cd [pasta]       Muda de diretório
  php -v           Versão do PHP
  composer         Info do Composer
  git log          Últimos commits
  git status       Status do repositório
  ping [host]      Envia pacotes ICMP
  ipconfig         Configuração de rede
  whoami           Usuário atual
  ver              Versão do Windows
  tasklist         Lista processos
  neofetch         Info do sistema (estilo)
  matrix           Ativa o modo matrix
  npm install      Instala dependências
  npm run dev      Inicia servidor de dev
  docker ps        Lista containers
  laravel          Info do framework
  artisan          Comandos do Artisan
  sudo             Você sabe por que não.
  shutdown         Desliga o computador
  about            Sobre o Matheus
  skills           Skills e tecnologias
  projects         Projetos principais
  history          Histórico profissional
  contact          Informações de contato
  limewire         Abre o LimeWire
  defrag           Abre o Desfragmentador
  bsod             ??? (use com cautela)
  exit             Fecha o prompt
`,
    'whoami': () => '<span style="color:#fff">matheus-xp\\Matheus</span>',
    'ver': () => `
<span style="color:#fff">Microsoft Windows XP [Versão 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.
matheusteixeira.com.br Edition — Build 9.0.1</span>`,
    'php -v': () => `<span style="color:#fff">PHP 8.3.2 (cli) (built: Feb  1 2025 10:42:33)
Copyright (c) The PHP Group
Zend Engine v4.3.2, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.2</span>`,
    'composer': () => `<span style="color:#fff">   ______
  / ____/___  ____ ___  ____  ____  ________  _____
 / /   / __ \\/ __ \`__ \\/ __ \\/ __ \\/ ___/ _ \\/ ___/
/ /___/ /_/ / / / / / / /_/ / /_/ (__  )  __/ /
\\____/\\____/_/ /_/ /_/ .___/\\____/____/\\___/_/
                    /_/
Composer version 2.7.1  2024-02-09</span>`,
    'git status': () => `<span style="color:#fff">No ramo main
Seu ramo está à frente de 'origin/main' por 3 commits.
  (use "git push" para publicar seus commits locais)

Mudanças para commit:
  (use "git restore --staged ..." para desmarcar)

<span style="color:#0f0">        modificado:   index.html
        modificado:   src/app.js
        modificado:   src/app.css</span>

Arquivos não rastreados:
<span style="color:#f00">        .env (NÃO COMMITAR!!!)</span>
nada para fazer o commit mas existem arquivos não rastreados</span>`,
    'git log': () => `<span style="color:#ff8c00">commit a4f8b2c (HEAD -> main)</span>
<span style="color:#fff">Author: Matheus Teixeira &lt;contato@matheusteixeira.com.br&gt;
Date:   Fri Feb 27 02:14:33 2025

    feat: adicionar Meus Documentos com carta pro Edmundo

<span style="color:#ff8c00">commit 7e3d91a</span>
Author: Matheus Teixeira &lt;contato@matheusteixeira.com.br&gt;
Date:   Thu Feb 26 23:45:12 2025

    fix: corrigir deploy que quebrou em produção na sexta às 22h

<span style="color:#ff8c00">commit 3c2a887</span>
Author: Matheus Teixeira &lt;contato@matheusteixeira.com.br&gt;
Date:   Wed Feb 25 01:30:55 2025

    refactor: renomear variável (terceira vez nessa semana)</span>`,
    'ipconfig': () => `<span style="color:#fff">Configuração de IP do Windows

Adaptador Ethernet Conexão Local:
   Sufixo DNS específico de conexão. : local
   Endereço IPv4. . . . . . . . . . . : 192.168.1.100
   Máscara de sub-rede . . . . . . . . : 255.255.255.0
   Gateway padrão. . . . . . . . . . . : 192.168.1.1

Endereço IPv4 Externo: <span style="color:#0ff">201.xxx.xxx.xxx</span>
DNS: 8.8.8.8 (Google)</span>`,
    'tasklist': () => {
        let out = '<span style="color:#fff">Nome da Imagem      PID  Sessão    Mem\n' + '─'.repeat(50) + '\n';
        tmProcesses.slice(0, 10).forEach(p => {
            out += `${p.name.padEnd(20)}${String(p.pid).padEnd(6)}Console   ${(p.mem/1024).toFixed(0)} K\n`;
        });
        return out + '</span>';
    },
    'bsod': () => { setTimeout(triggerBsod, 300); return '<span style="color:#f00">Iniciando diagnóstico crítico do sistema...</span>'; },
    'exit': () => { setTimeout(() => closeWin('win-cmd'), 300); return '<span style="color:#888">Saindo...</span>'; },
    'shutdown': () => { setTimeout(doShutdown, 1000); return '<span style="color:#fff">Desligando o sistema...</span>'; },
};

function cmdInit() {
    cmdCwd = 'C:\\Users\\Matheus';
    const out = document.getElementById('cmd-output');
    const prompt = document.getElementById('cmd-prompt-lbl');
    if (!out) return;
    out.innerHTML = `<div class="cmd-line">Microsoft Windows XP [Versão 5.1.2600]</div><div class="cmd-line">(C) Copyright 1985-2001 Microsoft Corp.</div><div class="cmd-line" style="color:#888">matheusteixeira.com.br Edition</div><div class="cmd-line">&nbsp;</div>`;
    if (prompt) prompt.textContent = cmdCwd + '>';
    cmdHistory = [];
    cmdHistIdx = -1;
    setTimeout(() => document.getElementById('cmd-input').focus(), 100);
}

function cmdKey(e) {
    const input = document.getElementById('cmd-input');
    if (e.key === 'Enter') {
        const val = input.value.trim();
        input.value = '';
        if (val) { cmdHistory.unshift(val); cmdHistIdx = -1; }
        cmdRun(val);
    } else if (e.key === 'ArrowUp') {
        if (cmdHistIdx < cmdHistory.length - 1) { cmdHistIdx++; input.value = cmdHistory[cmdHistIdx]; }
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        if (cmdHistIdx > 0) { cmdHistIdx--; input.value = cmdHistory[cmdHistIdx]; }
        else { cmdHistIdx = -1; input.value = ''; }
        e.preventDefault();
    }
}

function cmdRun(val) {
    const out = document.getElementById('cmd-output');
    const prompt = document.getElementById('cmd-prompt-lbl');
    if (!out) return;
    const echoLine = document.createElement('div');
    echoLine.className = 'cmd-line';
    echoLine.innerHTML = `<span style="color:#ccc">${cmdCwd}&gt;</span><span style="color:#fff"> ${escHtml(val)}</span>`;
    out.appendChild(echoLine);
    if (!val) { cmdScroll(); return; }
    let result = null;
    const low = val.toLowerCase().trim();
    if (low === 'dir') {
        result = cmdDir();
    } else if (low.startsWith('cd ')) {
        result = cmdCd(val.slice(3).trim());
    } else if (low === 'cd' || low === 'cd .') {
        result = '<span style="color:#fff">' + cmdCwd + '</span>';
    } else if (low === 'cd ..') {
        const parts = cmdCwd.split('\\');
        if (parts.length > 1) { parts.pop(); cmdCwd = parts.join('\\') || 'C:\\'; }
        if (prompt) prompt.textContent = cmdCwd + '>';
        cmdScroll(); return;
    } else if (cmdHandlers[low]) {
        result = cmdHandlers[low]();
    } else {
        result = `<span style="color:#f88">'${escHtml(val)}' não é reconhecido como um comando interno<br>ou externo, um programa operável ou um arquivo de lotes.</span>`;
    }
    if (result !== null) {
        const resLine = document.createElement('div');
        resLine.className = 'cmd-line';
        resLine.innerHTML = result;
        out.appendChild(resLine);
    }
    if (prompt) prompt.textContent = cmdCwd + '>';
    cmdScroll();
}

function cmdDir() {
    const files = cmdFs[cmdCwd] || ['[pasta vazia]'];
    let out = `<span style="color:#fff"> Pasta de ${cmdCwd}\n\n`;
    files.forEach(f => {
        const isDir = !f.includes('.');
        const size = isDir ? '&lt;DIR&gt;' : Math.floor(Math.random() * 90000 + 1000) + ' bytes';
        const date = '27/02/2025  02:30';
        out += `${date}  ${isDir ? '<span style="color:#0ff">' + size + '</span>' : size.padStart(12)}  ${f}\n`;
    });
    out += `\n   ${files.filter(f => !f.includes('.')).length} pasta(s)   ${files.filter(f => f.includes('.')).length} arquivo(s)</span>`;
    return out;
}

function cmdCd(dir) {
    const newPath = cmdCwd + '\\' + dir;
    if (cmdFs[newPath] !== undefined) {
        cmdCwd = newPath;
        return null;
    }
    return `<span style="color:#f88">O sistema não pode encontrar o caminho especificado.</span>`;
}

function cmdScroll() {
    const body = document.getElementById('cmd-body');
    if (body) body.scrollTop = body.scrollHeight;
}

function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function cmdPing(host) {
    return `<span style="color:#fff">Disparando ${host} com 32 bytes de dados:

Resposta de ${host}: bytes=32 tempo=18ms TTL=56
Resposta de ${host}: bytes=32 tempo=21ms TTL=56
Resposta de ${host}: bytes=32 tempo=19ms TTL=56
Resposta de ${host}: bytes=32 tempo=20ms TTL=56

Estatísticas do Ping para ${host}:
    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda)
Aproximar um número redondo de vezes em milissegundos:
    Mínimo = 18ms, Máximo = 21ms, Média = 19ms</span>`;
}

/* Adiciona ping ao handler dinamicamente */
(function() {
    const origRun = cmdRun;
    const _cmdRun = function(val) {
        const low = val.toLowerCase().trim();
        if (low.startsWith('ping ')) {
            const host = val.slice(5).trim();
            const out = document.getElementById('cmd-output');
            const prompt = document.getElementById('cmd-prompt-lbl');
            if (!out) return;
            const echoLine = document.createElement('div');
            echoLine.className = 'cmd-line';
            echoLine.innerHTML = `<span style="color:#ccc">${cmdCwd}&gt;</span><span style="color:#fff"> ${escHtml(val)}</span>`;
            out.appendChild(echoLine);
            const resLine = document.createElement('div');
            resLine.className = 'cmd-line';
            resLine.innerHTML = cmdPing(escHtml(host));
            out.appendChild(resLine);
            if (prompt) prompt.textContent = cmdCwd + '>';
            cmdScroll();
        } else {
            origRun(val);
        }
    };
    window.cmdRun = _cmdRun;
})();

/* ══════════════════════════════════════
    ALT+F4 — FECHAR JANELA ATIVA
══════════════════════════════════════ */
document.addEventListener('keydown', e => {
    if (e.altKey && e.key === 'F4') {
    e.preventDefault();
    const all = [...document.querySelectorAll('.xp-win')].filter(w =>
        w.style.display !== 'none' && !w.classList.contains('minimized')
    );
    if (!all.length) return;
    const top = all.reduce((a, b) => (parseInt(a.style.zIndex) || 0) > (parseInt(b.style.zIndex) || 0) ? a : b);
    closeWin(top.id);
    }
});

/* ══════════════════════════════════════
    CHROME OMNIBOX SYNC WITH GTANAV
══════════════════════════════════════ */
const _origGtaNav = gtaNav;
gtaNav = function(page) {
    _origGtaNav(page);
    const addr = document.getElementById('chrome-addr');
    if (addr && chromeTabUrls) addr.value = (chromeTabUrls[0] || 'matheusteixeira.com.br').replace(/\/.*/, '') + '/' + page + '.html';
};

/* ══════════════════════════════════════
    CMD EXTRA COMMANDS
══════════════════════════════════════ */
Object.assign(cmdHandlers, {
    'matrix': () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*<>[]{}';
        let rows = '';
        for (let i = 0; i < 8; i++) {
            let line = '';
            for (let j = 0; j < 55; j++) line += chars[Math.floor(Math.random() * chars.length)];
            rows += '<div class="cmd-matrix">' + line + '</div>';
        }
        return rows + '<span style="color:#0f0">Matrix mode: <span style="color:#ff0">ATIVADO</span>  — siga o coelho branco.</span>';
    },
    'neofetch': () => `<div class="cmd-neo-logo">
██╗    ██╗██╗███╗   ██╗██████╗  ██████╗ ██╗    ██╗███████╗
██║    ██║██║████╗  ██║██╔══██╗██╔═══██╗██║    ██║██╔════╝
██║ █╗ ██║██║██╔██╗ ██║██║  ██║██║   ██║██║ █╗ ██║███████╗
██║███╗██║██║██║╚██╗██║██║  ██║██║   ██║██║███╗██║╚════██║
╚███╔███╔╝██║██║ ╚████║██████╔╝╚██████╔╝╚███╔███╔╝███████║
 ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚══════╝</div>
<div class="cmd-neo-box">
<span class="cmd-highlight">matheus@xp-portfolio</span>
───────────────────────────
<span class="cmd-cyan">OS</span>: Windows XP Professional SP3 (matheusteixeira.com.br Edition)
<span class="cmd-cyan">Host</span>: Dell Inspiron 6400 — "A máquina que não mente"
<span class="cmd-cyan">Kernel</span>: NT 5.1.2600 build 9.0.1
<span class="cmd-cyan">Shell</span>: cmd.exe 6.1 (modo dev)
<span class="cmd-cyan">Resolution</span>: 800×600 (otimizado para IE 6)
<span class="cmd-cyan">CPU</span>: Intel Core i9-13900K @ 5.8GHz (8 núcleos PHP-only)
<span class="cmd-cyan">RAM</span>: 64GB DDR5 (48GB usados pelo Chrome)
<span class="cmd-cyan">Disk</span>: NVMe 2TB / 1.8TB usado (por node_modules)
<span class="cmd-cyan">Stack</span>: PHP · Laravel · MySQL · Docker · n8n · AWS · Redis
<span class="cmd-cyan">Uptime</span>: 8 anos, 3 meses, 12 dias sem mudar de stack
<span class="cmd-cyan">Packages</span>: 847 (composer) + 9,412 (node_modules, não pergunte)
<span class="cmd-cyan">GitHub</span>: github.com/matheusteixeira
<span class="cmd-cyan">Coffee</span>: ████████████████████ 100%
</div>`,
    'npm install': () => {
        return `<span style="color:#fff">
npm warn deprecated inflight@1.0.6: módulo legado desde 2013
npm warn deprecated glob@7.2.3: use glob@10 ou superior
npm warn deprecated rimraf@2.7.1: por favor atualize para v4

added 9412 packages, and audited 9413 packages in 47s

342 packages are looking for funding
  run \`npm fund\` for details

<span style="color:#f00">73 vulnerabilities</span> (12 moderate, 41 high, 20 critical)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run \`npm audit\` for details.
<span style="color:#0f0">✓ node_modules instalado com sucesso! Boa sorte.</span></span>`;
    },
    'npm run dev': () => `<span style="color:#fff">
&gt; project@0.0.1 dev
&gt; vite

<span style="color:#0f0">  VITE v5.1.0  ready in 312 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help</span>
<span style="color:#888">(servidor de desenvolvimento ativo — ctrl+c para encerrar)</span></span>`,
    'docker ps': () => `<span style="color:#fff">CONTAINER ID   IMAGE              COMMAND              STATUS          PORTS
a1b2c3d4e5f6   php:8.3-fpm        "docker-php-entryp…" Up 3 hours      9000/tcp
b2c3d4e5f6a1   mysql:8.0          "docker-entrypoint…" Up 3 hours      0.0.0.0:3306->3306/tcp
c3d4e5f6a1b2   redis:7-alpine     "docker-entrypoint…" Up 3 hours      0.0.0.0:6379->6379/tcp
d4e5f6a1b2c3   nginx:alpine       "/docker-entrypoint" Up 3 hours      0.0.0.0:80->80/tcp
e5f6a1b2c3d4   n8n:latest         "tini -- /docker-e…" Up 2 hours      0.0.0.0:5678->5678/tcp</span>`,
    'laravel': () => `<span style="color:#f00">
    <span style="color:#fff">   _                               _
  | |                             | |
  | |     __ _ _ __ __ ___   _____| |
  | |    / _\` | '__/ _\` \\ \\ / / _ \\ |
  | |___| (_| | | | (_| |\\ V /  __/ |
  |______\\__,_|_|  \\__,_| \\_/ \\___|_|

  Laravel Framework 11.x.x
  Bem-vindo ao framework PHP mais elegante do planeta.</span>`,
    'artisan': () => `<span style="color:#fff">Laravel Framework 11.28.1

Usage:
  command [options] [arguments]

Options:
  -h, --help            Mostra esta mensagem de ajuda
  -V, --version         Exibe a versão da aplicação

Available commands:
 <span style="color:#0ff">make:controller</span>    Cria um novo controller
 <span style="color:#0ff">make:model</span>         Cria um novo Eloquent model
 <span style="color:#0ff">migrate</span>            Executa as migrations
 <span style="color:#0ff">queue:work</span>         Inicia o processamento de fila
 <span style="color:#0ff">route:list</span>         Lista todas as rotas registradas
 <span style="color:#0ff">tinker</span>             Interage com a aplicação</span>`,
    'sudo': () => `<span style="color:#f00">sudo: este incidente será reportado ao Sr. Gates.</span>`,
    'rm -rf /': () => `<span style="color:#f00">Permission denied. Nice try.</span>`,
    'sl': () => `<span style="color:#ff0">🚂💨  choo choo — use ls, não sl.</span>`,
    'ls': () => `<span style="color:#fff">Use <span style="color:#0ff">dir</span> — você está no Windows.</span>`,
});

/* Comandos extras do portfólio */
Object.assign(cmdHandlers, {
    'about': () => `<span style="color:#0ff;white-space:pre">${_cmdExtras.about}</span>`,
    'skills': () => `<span style="color:#0ff;white-space:pre">${_cmdExtras.skills}</span>`,
    'projects': () => `<span style="color:#0ff;white-space:pre">${_cmdExtras.projects}</span>`,
    'history': () => `<span style="color:#0ff;white-space:pre">${_cmdExtras.history}</span>`,
    'contact': () => `<span style="color:#0ff;white-space:pre">${_cmdExtras.contact}</span>`,
    'limewire': () => { openWindow('win-limewire'); return `<span style="color:#0f0;white-space:pre">${_cmdExtras.limewire}</span>`; },
    'defrag': () => { openWindow('win-defrag'); _drawDefrag('defrag-canvas', true); return `<span style="color:#0f0;white-space:pre">${_cmdExtras.defrag}</span>`; },
    'bsod': () => { setTimeout(triggerBSOD, 500); return `<span style="color:#f00;white-space:pre">${_cmdExtras.bsod}</span>`; },
});

/* ══════════════════════════════════════
    KONAMI CODE EASTER EGG
══════════════════════════════════════ */
(function konamiInit() {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    document.addEventListener('keydown', e => {
        if (e.key === seq[idx]) {
            idx++;
            if (idx === seq.length) {
                idx = 0;
                showKonami();
            }
        } else {
            idx = e.key === seq[0] ? 1 : 0;
        }
    });
})();
function showKonami() {
    sndNotif();
    document.getElementById('konami-overlay').classList.add('active');
}
function hideKonami() {
    document.getElementById('konami-overlay').classList.remove('active');
}

/* ══════════════════════════════════════
   BAIXAKI 2010
══════════════════════════════════════ */
const bkSoftware = [
    { id:'vlc',      cat:'multimidia', name:'VLC Media Player',         ver:'1.0.5',  size:'17,3 MB',  lic:'Freeware', dl:'2.847.923', rating:5, ico:'🎬', desc:'O player de vídeo mais completo do mundo. Reproduz AVI, MKV, MP4 e qualquer formato sem precisar de codec extra.' },
    { id:'ccleaner', cat:'sistema',    name:'CCleaner',                  ver:'2.35',   size:'3,1 MB',   lic:'Freeware', dl:'3.421.887', rating:5, ico:'🧹', desc:'Limpe seu PC, corrija o registro e deixe o Windows voando. O favorito dos técnicos de informática do Brasil!' },
    { id:'utorrent', cat:'internet',   name:'uTorrent',                  ver:'1.8.3',  size:'218 KB',   lic:'Freeware', dl:'4.892.341', rating:5, ico:'⬇️', desc:'O cliente BitTorrent mais leve e rápido do planeta. Baixe torrents a velocidade máxima com consumo mínimo de memória.' },
    { id:'firefox',  cat:'internet',   name:'Mozilla Firefox',           ver:'3.6',    size:'7,7 MB',   lic:'Freeware', dl:'5.234.789', rating:5, ico:'🦊', desc:'O navegador mais seguro e personalizável. Esqueça o Internet Explorer e navegue sem medo com o Firefox!' },
    { id:'avast',    cat:'seguranca',  name:'Avast! Antivírus Home',     ver:'5.0',    size:'52,4 MB',  lic:'Freeware', dl:'1.987.654', rating:4, ico:'🛡️', desc:'Proteção completa e 100% gratuita contra vírus, spyware, rootkits e outras ameaças. Atualizações automáticas diárias.' },
    { id:'winrar',   cat:'utilitarios',name:'WinRAR',                    ver:'3.90',   size:'1,4 MB',   lic:'Trial',    dl:'6.789.012', rating:5, ico:'📦', desc:'O compactador mais popular do mundo. Crie e extraia arquivos RAR, ZIP, 7Z e mais de 20 outros formatos.' },
    { id:'msn',      cat:'internet',   name:'MSN Messenger',             ver:'8.5',    size:'14,2 MB',  lic:'Freeware', dl:'8.901.234', rating:4, ico:'🦋', desc:'Converse com amigos em tempo real. O mensageiro mais usado no Brasil com texto, voz, vídeo e transferência de arquivos.' },
    { id:'daemon',   cat:'sistema',    name:'Daemon Tools Lite',         ver:'4.35',   size:'2,9 MB',   lic:'Freeware', dl:'1.456.789', rating:4, ico:'💿', desc:'Monte imagens ISO e emule unidades de CD/DVD sem precisar de disco físico. Ideal para jogos e programas.' },
    { id:'winamp',   cat:'multimidia', name:'Winamp',                    ver:'5.58',   size:'8,5 MB',   lic:'Freeware', dl:'7.890.123', rating:5, ico:'🎵', desc:'O player de música que revolucionou o mundo digital. Skins, plugins, rádio online e suporte a todos os formatos de áudio.' },
    { id:'7zip',     cat:'utilitarios',name:'7-Zip',                     ver:'9.20',   size:'1,1 MB',   lic:'Freeware', dl:'2.123.456', rating:5, ico:'🗜️', desc:'Compactador open source gratuito com suporte a 7z, ZIP, RAR, TAR, GZIP e mais de 30 formatos. Taxa de compressão imbatível.' },
    { id:'skype',    cat:'internet',   name:'Skype',                     ver:'4.2',    size:'21,6 MB',  lic:'Freeware', dl:'3.234.567', rating:5, ico:'📞', desc:'Ligue grátis para qualquer PC no mundo. Videoconferência HD, chat, envio de arquivos e chamadas para telefone fixo.' },
    { id:'adobe',    cat:'utilitarios',name:'Adobe Reader',               ver:'9.3',    size:'33,8 MB',  lic:'Freeware', dl:'4.567.890', rating:3, ico:'📄', desc:'Visualize, imprima e comente documentos PDF com o leitor oficial da Adobe. Compatível com todos os PDFs.' },
    { id:'nero',     cat:'multimidia', name:'Nero 9 Free',               ver:'9.4.26', size:'504 MB',   lic:'Freeware', dl:'987.654',   rating:4, ico:'🔴', desc:'Suite de gravação de CDs e DVDs da Nero. Grave backups, crie DVDs de vídeo e muito mais com a versão gratuita.' },
    { id:'chrome',   cat:'internet',   name:'Google Chrome',             ver:'4.0',    size:'7,2 MB',   lic:'Freeware', dl:'1.234.567', rating:4, ico:'🟢', desc:'O novo navegador do Google. Incrivelmente rápido, simples e seguro. Já disponível em português do Brasil!' },
    { id:'npp',      cat:'utilitarios',name:'Notepad++',                 ver:'5.6.8',  size:'3,4 MB',   lic:'Freeware', dl:'1.876.543', rating:5, ico:'📝', desc:'Editor de código e texto avançado. Suporte a mais de 50 linguagens com syntax highlighting, macros e plugins.' },
    { id:'imgburn',  cat:'utilitarios',name:'ImgBurn',                   size:'2,7 MB',ver:'2.5',       lic:'Freeware', dl:'876.543',   rating:4, ico:'💿', desc:'Grave imagens ISO em CDs e DVDs de forma gratuita. Simples, confiável e com suporte a todos os formatos de imagem.' },
    { id:'paint',    cat:'multimidia', name:'Paint.NET',                 ver:'3.5.5',  size:'5,9 MB',   lic:'Freeware', dl:'2.345.678', rating:5, ico:'🎨', desc:'Editor de imagens gratuito para Windows. Camadas, efeitos, filtros e interface simples. O Photoshop dos pobres (melhor senso).' },
    { id:'picpick',  cat:'sistema',    name:'PicPick',                   ver:'2.1',    size:'4,2 MB',   lic:'Freeware', dl:'654.321',   rating:4, ico:'📸', desc:'Captura de tela profissional com editor integrado, régua, lupa, paleta de cores e muito mais. Tudo gratuito.' },
    { id:'openoffice',cat:'utilitarios',name:'BrOffice.org (OpenOffice)',ver:'3.2',    size:'148 MB',   lic:'Freeware', dl:'3.456.789', rating:4, ico:'📊', desc:'Suite de escritório completa e gratuita. Writer, Calc, Impress e Draw. Compatível com documentos do Microsoft Office.' },
    { id:'audacity', cat:'multimidia', name:'Audacity',                  ver:'1.3.12', size:'14,7 MB',  lic:'Freeware', dl:'1.098.765', rating:5, ico:'🎙️', desc:'Grave e edite áudio gratuitamente. Ideal para podcasts, remoção de ruídos, conversão de formatos e mixagem de faixas.' },
];

const bkCatNames = { todos:'Todos os programas', internet:'Internet (48)', multimidia:'Multimídia (67)', seguranca:'Segurança (24)', sistema:'Sistema (31)', utilitarios:'Utilitários (52)', jogos:'Jogos (89)', educacao:'Educação (18)' };
let bkCurrentCat = 'todos';

function bkInit() {
    bkRender(bkSoftware);
    bkRenderTop10();
    bkRenderCatLinks();
}

function bkRenderTop10() {
    const el = document.getElementById('bk-top10');
    if (!el) return;
    const top = [...bkSoftware].sort((a,b) => parseInt(b.dl.replace(/\./g,'')) - parseInt(a.dl.replace(/\./g,''))).slice(0,10);
    el.innerHTML = top.map((s,i) => `<div class="bk-top-item" onclick="bkHighlight('${s.id}')"><span class="bk-top-num">${i+1}.</span><span class="bk-top-name">${s.name}</span></div>`).join('');
}

function bkRenderCatLinks() {
    const el = document.getElementById('bk-catlinks');
    if (!el) return;
    const cats = [
        { k:'internet', l:'🌐 Internet (48)' }, { k:'multimidia', l:'🎵 Multimídia (67)' },
        { k:'sistema', l:'💻 Sistema (31)' }, { k:'seguranca', l:'🔒 Segurança (24)' },
        { k:'utilitarios', l:'🔧 Utilitários (52)' }, { k:'jogos', l:'🎮 Jogos (89)' },
        { k:'educacao', l:'📚 Educação (18)' },
    ];
    el.innerHTML = cats.map(c => `<div class="bk-cat-item" onclick="bkCategory('${c.k}',null)">${c.l}</div>`).join('');
}

function bkSearch() {
    const q = (document.getElementById('bk-q').value || '').toLowerCase().trim();
    const res = q ? bkSoftware.filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)) : bkSoftware;
    const crumb = document.getElementById('bk-crumb');
    if (crumb) crumb.textContent = q ? `Resultados para "${q}"` : 'Todos os programas';
    bkRender(res);
    sndClick();
}

function bkCategory(cat, el) {
    bkCurrentCat = cat;
    document.querySelectorAll('.bk-nl').forEach(n => n.classList.remove('bk-nl-active'));
    if (el) el.classList.add('bk-nl-active');
    const res = cat === 'todos' ? bkSoftware : bkSoftware.filter(s => s.cat === cat);
    const crumb = document.getElementById('bk-crumb');
    if (crumb) crumb.textContent = bkCatNames[cat] || cat;
    bkRender(res);
    sndClick();
}

function bkRender(list) {
    const el = document.getElementById('bk-list');
    const ct = document.getElementById('bk-count-lbl');
    if (!el) return;
    if (ct) ct.textContent = list.length + ' programa' + (list.length !== 1 ? 's' : '') + ' encontrado' + (list.length !== 1 ? 's' : '');
    if (list.length === 0) { el.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Nenhum resultado encontrado.</div>'; return; }
    el.innerHTML = list.map(s => {
        const stars = '★'.repeat(s.rating) + '☆'.repeat(5 - s.rating);
        const licColor = s.lic === 'Freeware' ? '#006600' : s.lic === 'Trial' ? '#996600' : '#990000';
        return `<div class="bk-item" id="bk-${s.id}">
            <div class="bk-item-left">
                <div class="bk-item-ico">${s.ico}</div>
                <div class="bk-item-stars" title="${s.rating}/5 estrelas">${stars}</div>
                <div class="bk-item-dl-ct">⬇ ${s.dl}</div>
            </div>
            <div class="bk-item-info">
                <div class="bk-item-name">${s.name} <span class="bk-item-ver">v${s.ver}</span> <span class="bk-item-lic" style="color:${licColor}">[${s.lic}]</span></div>
                <div class="bk-item-size">Tamanho: <b>${s.size}</b> &nbsp;|&nbsp; Licença: <b style="color:${licColor}">${s.lic}</b></div>
                <div class="bk-item-desc">${s.desc}</div>
            </div>
            <div class="bk-item-right">
                <button class="bk-dl-btn" onclick="bkDownload('${s.id}')">⬇ Download</button>
                <div class="bk-item-more">
                    <a class="bk-link" onclick="sndClick()">Detalhes</a> |
                    <a class="bk-link" onclick="sndClick()">Avalie</a>
                </div>
            </div>
        </div>`;
    }).join('');
}

function bkHighlight(id) {
    sndClick();
    bkCategory('todos', null);
    setTimeout(() => {
        const el = document.getElementById('bk-' + id);
        if (el) { el.style.background = '#fff3cc'; el.scrollIntoView({ behavior:'smooth', block:'center' }); setTimeout(() => el.style.background = '', 2000); }
    }, 100);
}

function bkDownload(id) {
    const s = bkSoftware.find(x => x.id === id);
    if (!s) return;
    sndClick();
    const winId = 'win-bkdl-' + id;
    let w = document.getElementById(winId);
    if (w) { openWindow(winId); return; }
    w = document.createElement('div');
    w.id = winId;
    w.className = 'xp-win';
    w.style.cssText = 'width:400px;top:160px;left:220px;display:none;';
    w.innerHTML = `
        <div class="xp-titlebar" onmousedown="startDrag(event,'${winId}')">
            <span class="xp-titlebar-ico">📥</span>
            <span class="xp-titlebar-txt">Download de Arquivo</span>
            <div class="xp-wbtns">
                <div class="xp-wbtn wcls" onclick="closeWin('${winId}')">✕</div>
            </div>
        </div>
        <div style="padding:16px;font-family:Tahoma,Arial,sans-serif;font-size:12px;background:#f0f0f0">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                <div style="font-size:28px">${s.ico}</div>
                <div>
                    <div style="font-weight:bold;font-size:13px">${s.name} ${s.ver}</div>
                    <div style="color:#555;font-size:11px">Tamanho: ${s.size} &nbsp;|&nbsp; ${s.lic}</div>
                    <div style="color:#555;font-size:11px">De: www.baixaki.com.br</div>
                </div>
            </div>
            <div style="background:#fff;border:1px solid #aaa;padding:10px;margin-bottom:10px">
                <div style="margin-bottom:6px;font-size:11px">Baixando <b>${s.name} ${s.ver}</b>...</div>
                <div style="height:20px;background:#e0e0e0;border:1px inset #999;position:relative;overflow:hidden" id="${winId}-bar">
                    <div id="${winId}-fill" style="height:100%;width:0%;background:linear-gradient(180deg,#4a9eff,#0055cc);transition:width 0.1s"></div>
                </div>
                <div style="margin-top:4px;font-size:11px;color:#555" id="${winId}-pct">0% concluído — Velocidade: 248 KB/s</div>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:6px">
                <button style="padding:4px 14px;font-size:11px;cursor:pointer" onclick="closeWin('${winId}')">Cancelar</button>
                <button id="${winId}-open" style="padding:4px 14px;font-size:11px;cursor:pointer;display:none" onclick="sndClick();closeWin('${winId}')">Abrir</button>
            </div>
            <div style="font-size:10px;color:#888;margin-top:8px;border-top:1px solid #ccc;padding-top:6px">
                ⚠️ Sempre verifique programas com um antivírus antes de instalar.
            </div>
        </div>
        <div class="xp-resize" onmousedown="startResize(event,'${winId}')"></div>`;
    document.body.appendChild(w);
    winMeta[winId] = { ico:'📥', lbl: s.name + ' — Download' };
    openWindow(winId);
    let pct = 0;
    const speeds = ['248 KB/s','312 KB/s','198 KB/s','421 KB/s','287 KB/s','364 KB/s'];
    const iv = setInterval(() => {
        pct = Math.min(100, pct + Math.random() * 8 + 3);
        const fill = document.getElementById(winId + '-fill');
        const lbl = document.getElementById(winId + '-pct');
        if (fill) fill.style.width = pct + '%';
        if (lbl) lbl.textContent = Math.floor(pct) + '% concluído — Velocidade: ' + speeds[Math.floor(Math.random() * speeds.length)];
        if (pct >= 100) {
            clearInterval(iv);
            if (lbl) lbl.innerHTML = '<span style="color:#006600;font-weight:bold">✓ Download concluído!</span>';
            const btn = document.getElementById(winId + '-open');
            if (btn) { btn.style.display = 'inline'; btn.textContent = 'Executar'; }
            showNotif('📥 Download Completo', s.name + ' ' + s.ver + ' baixado com sucesso!');
        }
    }, 120);
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bk-list')) bkInit();
});
setTimeout(() => { if (document.getElementById('bk-list')) bkInit(); }, 500);

/* ══════════════════════════════════════
   GMAIL 2
══════════════════════════════════════ */
const gmEmails = [
    // INBOX — não lidos
    { id:1,  folder:'inbox',   read:false, starred:false, from:'Mãe',               addr:'sonia.teixeira@yahoo.com.br', subj:'Matheus como faz pra abrir aquele arquivo???',   date:'09:31', body:'Matheus meu filho\n\naquele arquivo que vc mandou nao abre. aparece uma tela preta e fecha sozinho. seu pai disse que é virus mas eu acho que não.\n\nTentei clicar duas vezes, botao direito, arrastar pro desktop. Nada.\n\nVc pode vir aqui em casa amanha? Traz aquele pendrive que tem o antivirus tambem que o pc ta muito lento. Demora 10 minutos pra abrir o internet explorer.\n\nTem comida, vou fazer lasanha.\n\nbeijo\nmãe\n\nPS: como faz pra por foto no orkut? Carla me ensinou mas eu esqueci' },
    { id:2,  folder:'inbox',   read:false, starred:false, from:'Carla Silva',         addr:'carlinha_rj@hotmail.com',     subj:'FW: FW: FW: FW: CUIDADO leia até o final!!!!',   date:'08:47', body:'REPASSE PARA TODOS OS SEUS CONTATOS!!!\n\n>>>Essa mensagem foi enviada por um funcionario do SERASA.\n>>>Se vc receber um email com o titulo "Voce foi sorteado" NAO ABRA!!!!\n>>>Ele formata seu computador inteiro e rouba todos os seus dados do banco.\n>>>A Globo ja confirmou ontem no Jornal Nacional.\n\n>>>REPASSE PARA PELO MENOS 10 PESSOAS OU SUA CONTA SERÁ DESATIVADA EM 48 HORAS.\n\n>>>Isso é serio gente!!!!\n\n---\nNão sei se é verdade mas to repassando por via das dúvidas kkkk\nBjs Carla' },
    { id:3,  folder:'inbox',   read:false, starred:true,  from:'Lucas Ferreira',     addr:'lucas@novapay.io',            subj:'Proposta: Tech Lead backend — NovaPay',           date:'08:42', body:'Oi Matheus! Tudo bem?\n\nSou co-fundador da NovaPay, uma fintech que estamos levantando da seed agora. Vi seu GitHub e achei seu trabalho com APIs muito sólido.\n\nEstamos construindo uma plataforma de pagamentos instantâneos B2B e precisamos de alguém pra arquitetar o backend do zero. Stack: Laravel + Go para o serviço de liquidação + Redis + Kafka.\n\nA ideia é você ser o primeiro dev contratado e ajudar a montar o time. Parte do salário + equity na empresa.\n\nPode bater um papo essa semana?\n\nAbraços,\nLucas Ferreira\nCo-fundador — NovaPay\n📱 (11) 98823-4401' },
    { id:4,  folder:'inbox',   read:false, starred:false, from:'Americanas.com',     addr:'noreply@americanas.com.br',   subj:'Pedido confirmado! 🛒 #AME-2026-8841923',        date:'07:55', body:'Olá Matheus!\n\nSeu pedido foi confirmado com sucesso!\n\n══════════════════════════\n📦 PEDIDO #AME-2026-8841923\n══════════════════════════\n\n1x Box DVD Lost - 1ª Temporada Completa\n   R$ 89,90\n\n1x Fone de Ouvido Philips SHP2500\n   R$ 49,90\n\n1x Mousepad Grande Speed 70x30cm\n   R$ 24,90\n\n══════════════════════════\nSubtotal: R$ 164,70\nFrete: GRÁTIS (Sedex)\nTotal: R$ 164,70\nPagamento: Boleto bancário\n══════════════════════════\n\nPrevisão de entrega: 12 a 18 dias úteis\nEndereço: Rua das Laranjeiras, 247 — Rio de Janeiro/RJ\n\nAcompanhe seu pedido em americanas.com.br/meus-pedidos\n\nBoas compras! 🎉\n— Equipe Americanas' },
    { id:5,  folder:'inbox',   read:false, starred:false, from:'Edmundo',            addr:'edmundo.acf@gmail.com',       subj:'criança olha esse video jajaja',                  date:'02:38', body:'gordito!!\n\nson las 2 de la mañana y no puedo parar de reír jajajaja\n\nhttp://www.youtube.com/watch?v=dQw4w9WgXcQ\n\nesse cara tentando cantar no karaokê... eu tô chorando bicho kkkkkk\n\nassiste até o final que é a melhor parte\n\nps: tô com saudade. quando vc vem pra cá? ou eu vou pra aí? não aguento mais só msn 🥺\n\nte quiero mucho criança ♥\nedmundo\n\n---\nEnviado pelo MSN Hotmail Mobile' },
    // INBOX — lidos
    { id:6,  folder:'inbox',   read:true,  starred:false, from:'Orkut',              addr:'noreply@orkut.com',           subj:'Você tem 3 novos scraps e 1 depoimento!',         date:'27 fev', body:'Olá Matheus Teixeira!\n\nVocê tem novidades no orkut:\n\n📋 3 novos scraps no seu Álbum de Recados\n   • Carla Mendes deixou um scrap\n   • Edmundo Farias deixou um scrap\n   • Rafael_Dev deixou um scrap\n\n✍️ 1 novo depoimento\n   • Carla M. escreveu um depoimento sobre você\n\n👥 2 novos pedidos de amizade\n\nAcesse: www.orkut.com.br/Main#Home\n\n— Equipe orkut' },
    { id:7,  folder:'inbox',   read:true,  starred:true,  from:'Edmundo',            addr:'edmundo.acf@gmail.com',       subj:'Cusco, mi amor — vem me visitar ❤️',             date:'24 fev', body:'Mi criança,\n\nYa no aguanto más de saudade. Preciso que vc venha pra cá. Cusco tá lindo demais e eu só consigo pensar: "o Matheus precisava ver isso".\n\nA Praça de Armas de manhã cedo, com o sol batendo nos muros de pedra inca, aquele cheiro de terra e eucalipto no ar... você ia amar, gordito. É um negócio que te parte o coração de beleza.\n\nE o Machu Picchu... eu vou levar vc lá. A gente sobe o Huayna Picchu de manhã cedo, antes da neblina abrir, e quando abre... meu Deus. Eu quero estar do teu lado nessa hora. Quero ver tua cara.\n\nJá pesquisei tudo: a melhor época é junho ou julho, céu limpo, sem chuva. Vc voa pra Lima, eu te busco lá, e a gente vai juntos de avião pra Cusco (uns 70 minutos). Passa dois dias aclimatando — porque a altitude bate, fica uns 3.400m — depois a gente pega o trem até Aguas Calientes.\n\nTô falando sério, criança. Reserva as datas. Eu organizo todo. Vc só precisa aparecer.\n\nTe quiero muchísimo. Más de lo que puedo decir por email.\n\nTu Edmundo 🏔️♥️🇵🇪' },
    { id:18, folder:'inbox',   read:true,  starred:false, from:'Decolar.com',        addr:'reservas@decolar.com',        subj:'✈️ Reserva confirmada — GIG → CUZ | 14 jun',    date:'24 fev', body:'Olá, Matheus Teixeira!\n\nSua reserva foi confirmada com sucesso. Aqui estão os detalhes da sua viagem:\n\n══════════════════════════════\n✈️ VOO DE IDA\n══════════════════════════════\nOrigem: Rio de Janeiro — Galeão (GIG)\nDestino: Cusco — Alejandro Velasco Astete (CUZ)\nData: 14 de Junho de 2026\nPartida: 06h15 · Chegada: 13h40\nConexão: Lima (LIM) — 2h10 de espera\nCompanhia: LATAM Airlines\nVoo: LA3041 / LA2481\nClasse: Econômica\n\n══════════════════════════════\n✈️ VOO DE VOLTA\n══════════════════════════════\nOrigem: Cusco (CUZ)\nDestino: Rio de Janeiro — Galeão (GIG)\nData: 22 de Junho de 2026\nPartida: 15h50 · Chegada: 23h05\nConexão: Lima (LIM)\nCompanhia: LATAM Airlines\nVoo: LA2482 / LA3044\n\n══════════════════════════════\n👤 PASSAGEIRO\n══════════════════════════════\nNome: MATHEUS TEIXEIRA\nLocalizador: DCLBR-8842JK\nBagagem incluída: 1 mala 23kg + bagagem de mão\n\n══════════════════════════════\n💳 PAGAMENTO\n══════════════════════════════\nTotal pago: R$ 2.184,00\nCartão: **** **** **** 4821\n\nImportante: chegue ao aeroporto com 2h30 de antecedência.\nDúvidas? Acesse decolar.com ou ligue 0800 000 1500.\n\nBoa viagem! 🌎\n— Equipe Decolar.com' },
    { id:8,  folder:'inbox',   read:true,  starred:false, from:'Mãe',               addr:'sonia.teixeira@yahoo.com.br', subj:'RE: RE: RE: como faz pra abrir aquele arquivo',  date:'25 fev', body:'Matheus\n\nFiz o que vc falou e agora apareceu uma janela pedindo pra instalar o java. Pode instalar? Seu pai disse que não é pra instalar nada.\n\nOutra coisa: a impressora não imprime mais. Aparece \"offline\" mas ela ta ligada. O fio ta conectado, eu verifiquei.\n\nAh e vou precisar que vc me ajude a mandar um email com anexo pro trabalho. Toda vez que tento anexar ele fala que o arquivo é muito grande. É uma foto de 15 mega.\n\nQdo vc vem?\n\nbeijo\nmãe\n\nPS: a lasanha é amanha, não esquece' },
    { id:9,  folder:'inbox',   read:true,  starred:false, from:'Rafael Moreira',     addr:'rafael@vendify.com.br',       subj:'Consultoria técnica — Vendify v2.0',             date:'23 fev', body:'Oi Matheus,\n\nSou CTO da Vendify, plataforma de gestão de vendas para pequenas empresas. Estamos em migração da v1 (monolito Laravel) para uma arquitetura de microsserviços.\n\nPrecisamos de um consultor técnico por 3 meses para:\n- Definir a nova arquitetura de serviços\n- Implementar o gateway de API\n- Treinar o time interno (4 devs)\n\nOrçamento disponível: R$15.000/mês.\n\nPodemos agendar uma call?\n\nRafael Moreira\nCTO — Vendify' },
    { id:10, folder:'inbox',   read:true,  starred:false, from:'NET Vírtua',         addr:'fatura@netcombo.com.br',      subj:'Sua fatura NET Vírtua — Vencimento 05/03',       date:'21 fev', body:'Olá MATHEUS TEIXEIRA,\n\nSua fatura do mês de Março já está disponível.\n\n══════════════════════════\n📋 DETALHES DA FATURA\n══════════════════════════\n\nNET Vírtua 10 Mega: R$ 119,90\nNET Fone (fixo ilimitado): R$ 29,90\nDesconto fidelidade: -R$ 15,00\n\nTotal: R$ 134,80\nVencimento: 05/03/2026\n\nCódigo de barras:\n23793.38128 60000.000003 00134.801016 1 92680000013480\n\nPague pelo Internet Banking ou em qualquer lotérica.\n\n— NET Combo' },
    // STARRED
    { id:11, folder:'starred', read:true,  starred:true,  from:'Lucas Ferreira',     addr:'lucas@novapay.io',            subj:'NovaPay — Proposta formal + deck para você ver', date:'15 fev', body:'Matheus,\n\nSegue a proposta formal:\n\n— Cargo: Tech Lead Backend\n— Salário: R$14.000/mês CLT ou R$18.000 PJ\n— Equity: 0,8% vesting 4 anos / cliff 1 ano\n— Início: imediato ou combinado\n— Regime: 100% remoto\n\nStack atual: Laravel 11, Go 1.22, PostgreSQL, Redis, Kafka, AWS (ECS + RDS).\n\nO deck da empresa está em: novapay.io/deck-seed-2026 (senha: matheus2026)\n\nAguardo sua resposta!\n\nLucas' },
    // SENT
    { id:12, folder:'sent',    read:true,  starred:false, from:'Eu',                 addr:'contato@matheusteixeira.com.br', subj:'RE: Matheus como faz pra abrir aquele arquivo???', date:'25 fev', body:'Mãe,\n\nCalma kkkk não é virus não.\n\nO arquivo é .pdf — vc precisa do Adobe Reader pra abrir. Vou instalar amanha quando for aí.\n\nSobre a impressora: tenta desligar ela da tomada, espera 10 segundos e liga de novo. Se não funcionar eu vejo amanha.\n\nA foto de 15 mega é muito pesada pro email. Vou te ensinar a reduzir o tamanho amanha também.\n\nGuarda minha lasanha!!\n\nBeijo,\nMatheus' },
    // SPAM
    { id:13, folder:'spam',    read:false, starred:false, from:'Príncipe Al-Rashid', addr:'principe@nigeria-royal.ng',   subj:'URGENTE: R$4.500.000 aguardando transferência',  date:'Hoje',   body:'Prezado Amigo,\n\nSou o Príncipe Al-Rashid do Reino da Nigéria e preciso de sua ajuda urgente para transferir uma fortuna...' },
    { id:14, folder:'spam',    read:false, starred:false, from:'Receita Federal',    addr:'noreply@receita-br.tk',       subj:'PENDÊNCIA GRAVE NO SEU CPF — regularize agora',  date:'Hoje',  body:'Seu CPF foi suspenso por irregularidades fiscais. Acesse o link abaixo para regularizar sua situação...' },
    { id:15, folder:'spam',    read:false, starred:false, from:'PARABÉNS!!!',        addr:'premio@sorteiobrasil.vip',    subj:'🎉 Você ganhou um iPhone 16 Pro — RESGATE JÁ',  date:'Ontem',  body:'Você foi selecionado aleatoriamente para receber um iPhone 16 Pro. Resgate em até 24 horas ou perde o prêmio...' },
    { id:16, folder:'spam',    read:false, starred:false, from:'CryptoBot Pro',      addr:'bot@crypto-invest.vip',       subj:'Robô fez R$18.700 em 3 dias — acesso grátis',   date:'Ontem',  body:'Nosso robô de IA opera automaticamente e está gerando lucros absurdos. Acesso gratuito por 7 dias...' },
    { id:17, folder:'spam',    read:false, starred:false, from:'Banco Segurança',    addr:'seguranca@bb-alerta.tk',      subj:'🔐 Seu token será bloqueado em 24h',             date:'26 fev', body:'Prezado cliente, detectamos atividade suspeita na sua conta. Clique aqui para desbloqueá-la urgentemente...' },
];

let gmCurrentFolder = 'inbox';
let gmOpenId = null;
let gmSentEmails = [];

function gmInit() {
    gmRenderList();
}

function gmShowFolder(folder) {
    gmCurrentFolder = folder;
    gmOpenId = null;
    document.querySelectorAll('.gm2-ni').forEach(n => n.classList.remove('gm2-ni-active'));
    const map = { inbox:'gm2-nav-inbox' };
    if (map[folder]) document.getElementById(map[folder]).classList.add('gm2-ni-active');
    const tabs = document.getElementById('gm2-tabs');
    const pager = document.getElementById('gm2-pager');
    const reader = document.getElementById('gm2-reader');
    const list = document.getElementById('gm2-list');
    if (reader) { reader.style.display = 'none'; reader.innerHTML = ''; }
    if (list) list.style.display = 'block';
    const toolbar = document.getElementById('gm2-toolbar');
    if (toolbar) toolbar.style.display = 'flex';
    gmRenderList();
    sndClick();
}

function gmRenderList() {
    const el = document.getElementById('gm2-list');
    if (!el) return;
    let emails = gmEmails.filter(e => e.folder === gmCurrentFolder);
    if (gmCurrentFolder === 'starred') emails = gmEmails.filter(e => e.starred);
    const sent = gmSentEmails.filter(e => gmCurrentFolder === 'sent');
    emails = [...emails, ...sent].filter((e,i,a) => a.indexOf(e) === i);
    const pager = document.getElementById('gm2-pager');
    if (pager) pager.textContent = '1–' + Math.min(emails.length, 20) + ' de ' + emails.length;
    el.innerHTML = emails.map(e => `
        <div class="gm2-email-row ${e.read ? '' : 'gm2-unread'}" id="gmrow-${e.id}" onclick="gmOpenEmail(${e.id})">
            <input type="checkbox" class="gm2-chk" onclick="event.stopPropagation()">
            <span class="gm2-star-btn ${e.starred ? 'gm2-starred' : ''}" onclick="event.stopPropagation();gmToggleStar(${e.id})">${e.starred ? '★' : '☆'}</span>
            <span class="gm2-row-from">${e.from.length > 18 ? e.from.slice(0,18) + '…' : e.from}</span>
            <span class="gm2-row-subj">${e.subj}</span>
            <span class="gm2-row-date">${e.date}</span>
        </div>`).join('') || '<div style="padding:24px;text-align:center;color:#999;font-size:13px">Nenhuma mensagem aqui.</div>';
}

function gmOpenEmail(id) {
    const e = gmEmails.find(x => x.id === id) || gmSentEmails.find(x => x.id === id);
    if (!e) return;
    e.read = true;
    gmOpenId = id;
    const row = document.getElementById('gmrow-' + id);
    if (row) row.classList.remove('gm2-unread');
    const unread = gmEmails.filter(x => x.folder === 'inbox' && !x.read).length;
    const badge = document.getElementById('gm2-unread-ct');
    if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? '' : 'none'; }
    const list = document.getElementById('gm2-list');
    const reader = document.getElementById('gm2-reader');
    if (list) list.style.display = 'none';
    if (!reader) return;
    reader.style.display = 'flex';
    reader.innerHTML = `
        <div class="gm2-reader-toolbar">
            <button class="gm2-act-btn" onclick="gmShowFolder('${gmCurrentFolder}')">← Voltar</button>
            <button class="gm2-act-btn" onclick="gmArchive(${id})" title="Arquivar">📁</button>
            <button class="gm2-act-btn" onclick="gmDelete(${id})" title="Excluir">🗑️</button>
            <button class="gm2-act-btn" onclick="gmToggleStar(${id})" title="Favoritar">${e.starred ? '★' : '☆'}</button>
        </div>
        <div class="gm2-reader-header">
            <div class="gm2-reader-subj">${e.subj}</div>
            <div class="gm2-reader-meta">
                <div class="gm2-reader-avatar">${e.from.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
                <div>
                    <div class="gm2-reader-from"><b>${e.from}</b> <span class="gm2-reader-addr">&lt;${e.addr}&gt;</span></div>
                    <div class="gm2-reader-to">para: <b>contato@matheusteixeira.com.br</b> &nbsp;·&nbsp; ${e.date}</div>
                </div>
            </div>
        </div>
        <div class="gm2-reader-body">${e.body.replace(/\n/g,'<br>')}</div>
        <div class="gm2-reply-bar">
            <button class="gm2-reply-btn" onclick="gmReply(${id})">↩ Responder</button>
            <button class="gm2-reply-btn" onclick="sndClick()">↪ Encaminhar</button>
        </div>`;
    sndClick();
}

function gmReply(id) {
    const e = gmEmails.find(x => x.id === id) || gmSentEmails.find(x => x.id === id);
    if (!e) return;
    const compose = document.getElementById('gm2-compose');
    if (!compose) return;
    document.getElementById('gm2-to').value = e.addr;
    document.getElementById('gm2-subj').value = 'RE: ' + e.subj;
    document.getElementById('gm2-body').value = '\n\n--- Mensagem original de ' + e.from + ' ---\n' + e.body;
    compose.style.display = 'flex';
    sndClick();
}

function gmCompose() {
    const compose = document.getElementById('gm2-compose');
    if (!compose) return;
    document.getElementById('gm2-to').value = '';
    document.getElementById('gm2-subj').value = '';
    document.getElementById('gm2-body').value = '';
    compose.style.display = 'flex';
    sndClick();
    setTimeout(() => document.getElementById('gm2-to').focus(), 50);
}

function gmSend() {
    const to = document.getElementById('gm2-to').value.trim();
    const subj = document.getElementById('gm2-subj').value.trim();
    const body = document.getElementById('gm2-body').value.trim();
    if (!to || !subj) { showNotif('✉️ Gmail', 'Preencha o destinatário e o assunto.'); return; }
    const newId = Date.now();
    gmSentEmails.push({ id:newId, folder:'sent', read:true, starred:false, from:'Eu', addr:'contato@matheusteixeira.com.br', subj, body, date:'Agora' });
    document.getElementById('gm2-compose').style.display = 'none';
    showNotif('✉️ Gmail', 'Mensagem enviada para ' + to + '!');
    sndClick();
}

function gmToggleStar(id) {
    const e = gmEmails.find(x => x.id === id) || gmSentEmails.find(x => x.id === id);
    if (!e) return;
    e.starred = !e.starred;
    gmRenderList();
    sndClick();
}

function gmArchive(id) {
    const e = gmEmails.find(x => x.id === id);
    if (e) e.folder = 'archive';
    gmShowFolder(gmCurrentFolder);
    showNotif('📁 Gmail', 'Mensagem arquivada.');
}

function gmDelete(id) {
    const idx = gmEmails.findIndex(x => x.id === id);
    if (idx >= 0) gmEmails[idx].folder = 'trash';
    gmShowFolder(gmCurrentFolder);
    showNotif('🗑️ Gmail', 'Mensagem movida para a lixeira.');
}

function gmSearch() {
    const q = (document.getElementById('gm2-q').value || '').toLowerCase().trim();
    if (!q) { gmRenderList(); return; }
    const el = document.getElementById('gm2-list');
    const reader = document.getElementById('gm2-reader');
    if (reader) { reader.style.display = 'none'; }
    if (!el) return;
    el.style.display = 'block';
    const res = gmEmails.filter(e => e.from.toLowerCase().includes(q) || e.subj.toLowerCase().includes(q) || e.body.toLowerCase().includes(q));
    const pager = document.getElementById('gm2-pager');
    if (pager) pager.textContent = res.length + ' resultado(s)';
    el.innerHTML = res.map(e => `
        <div class="gm2-email-row ${e.read ? '' : 'gm2-unread'}" id="gmrow-${e.id}" onclick="gmOpenEmail(${e.id})">
            <input type="checkbox" class="gm2-chk" onclick="event.stopPropagation()">
            <span class="gm2-star-btn ${e.starred ? 'gm2-starred' : ''}" onclick="event.stopPropagation();gmToggleStar(${e.id})">${e.starred ? '★' : '☆'}</span>
            <span class="gm2-row-from">${e.from.length > 18 ? e.from.slice(0,18) + '…' : e.from}</span>
            <span class="gm2-row-subj">${e.subj}</span>
            <span class="gm2-row-date">${e.date}</span>
        </div>`).join('') || '<div style="padding:20px;text-align:center;color:#999">Nenhum resultado para "' + q + '".</div>';
    sndClick();
}

function gmSelectAll(chk) {
    document.querySelectorAll('.gm2-chk').forEach(c => { c.checked = chk.checked; });
    sndClick();
}

function gmRefresh() {
    gmRenderList();
    showNotif('✉️ Gmail', 'Caixa de entrada atualizada.');
    sndClick();
}

/* Orkut — abas social/profissional/pessoal */
function orkutTab(tab, el) {
    sndClick();
    document.querySelectorAll('.ok-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.ok-tab-content').forEach(c => c.style.display = 'none');
    const target = document.getElementById('ok-tab-' + tab);
    if (target) target.style.display = '';
}

function chromeTab(n) {
    document.querySelectorAll('.chrome-tab').forEach((t, i) => {
        t.classList.toggle('active', i === n);
    });
    document.querySelectorAll('.chrome-page').forEach((p, i) => {
        p.style.display = i === n ? 'block' : 'none';
    });
    const addr = document.getElementById('chrome-addr');
    if (addr) addr.value = chromeTabUrls[n] || '';
    const title = document.getElementById('chrome-title-txt');
    if (title) title.textContent = chromeTitles[n] || 'Google Chrome';
    if (n === 1) bkInit();
    if (n === 2) gmInit();
    sndClick();
}

function closeTab(n) {
    const tab = document.getElementById('ctab-' + n);
    const page = document.querySelectorAll('.chrome-page')[n];
    if (tab) tab.style.display = 'none';
    if (page) page.style.display = 'none';
    /* achar proxima aba visivel */
    const tabs = document.querySelectorAll('.chrome-tab');
    let next = -1;
    for (let i = n + 1; i < tabs.length; i++) { if (tabs[i].style.display !== 'none') { next = i; break; } }
    if (next === -1) for (let i = n - 1; i >= 0; i--) { if (tabs[i].style.display !== 'none') { next = i; break; } }
    if (next >= 0) { chromeTab(next); }
    else { closeWin('win-about'); } /* ultima aba => fecha o navegador */
    sndClick();
}

function reopenAllTabs() {
    document.querySelectorAll('.chrome-tab').forEach((t, i) => {
        t.style.display = i <= 5 ? '' : 'none'; /* abas 0-5 sempre, 6+ só pelo menu */
    });
    chromeTab(0);
}

/* ══════════════════════════════════════
   SOLITAIRE — KLONDIKE
══════════════════════════════════════ */
const SOL_SUITS = ['♠','♥','♦','♣'];
const SOL_VALS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const SOL_RED   = ['♥','♦'];
let solStock=[], solWaste=[], solFound=[[],[],[],[]], solTab=[[],[],[],[],[],[],[]];
let solSelected=null, solScore=0;

function solNewGame() {
    let deck=[];
    SOL_SUITS.forEach(s => SOL_VALS.forEach(v => deck.push({suit:s,val:v,idx:SOL_VALS.indexOf(v),faceUp:false})));
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    solStock=[...deck]; solWaste=[]; solFound=[[],[],[],[]]; solTab=[[],[],[],[],[],[],[]];
    for(let c=0;c<7;c++) for(let r=0;r<=c;r++){const cd=solStock.pop();cd.faceUp=(r===c);solTab[c].push(cd);}
    solSelected=null; solScore=0; solRender();
}
function solRender() {
    const st=document.getElementById('sol-stock');
    if(st) st.innerHTML=solStock.length>0?'<div class="sol-card sol-back">🂠</div>':'<div class="sol-pile-empty" onclick="solStockClick()" style="cursor:pointer;color:#8fc;font-size:20px;display:flex;align-items:center;justify-content:center;">↺</div>';
    const ws=document.getElementById('sol-waste');
    if(ws){ws.innerHTML='';if(solWaste.length>0)ws.appendChild(solMakeCardEl(solWaste[solWaste.length-1],'waste',0,solWaste.length-1));}
    for(let f=0;f<4;f++){const fd=document.getElementById('sol-f'+f);if(!fd)continue;fd.innerHTML=solFound[f].length===0?`<span class="sol-suit-hint">${SOL_SUITS[f]}</span>`:'';if(solFound[f].length>0)fd.appendChild(solMakeCardEl(solFound[f][solFound[f].length-1],'found',f,solFound[f].length-1));}
    const tab=document.getElementById('sol-tableau');if(!tab)return;tab.innerHTML='';
    for(let c=0;c<7;c++){
        const col=document.createElement('div');col.className='sol-col';col.style.cssText='position:relative;min-height:110px;flex:1;';
        if(solTab[c].length===0){const e=document.createElement('div');e.className='sol-pile-empty';e.onclick=()=>solColClick(c);col.appendChild(e);}
        solTab[c].forEach((card,i)=>{const el=solMakeCardEl(card,'tab',c,i);el.style.position='absolute';el.style.top=(i*22)+'px';col.appendChild(el);});
        col.style.minHeight=(Math.max(1,solTab[c].length)*22+88)+'px';tab.appendChild(col);
    }
    const sc=document.getElementById('sol-score');if(sc)sc.textContent='Pontos: '+solScore;
    if(solFound.every(f=>f.length===13))showNotif('🃏 Paciência','Você ganhou!! 🎉 Pontuação: '+solScore);
}
function solMakeCardEl(card,src,idx,pos){
    const el=document.createElement('div');
    const red=SOL_RED.includes(card.suit);
    const sel=solSelected&&solSelected.src===src&&solSelected.idx===idx&&solSelected.pos===pos;
    if(!card.faceUp){el.className='sol-card sol-back';el.innerHTML='🂠';return el;}
    el.className='sol-card'+(red?' sol-red':'')+(sel?' sol-sel':'');
    el.innerHTML=`<div class="sol-card-tl">${card.val}<br>${card.suit}</div><div class="sol-card-ctr">${card.suit}</div><div class="sol-card-br">${card.val}<br>${card.suit}</div>`;
    el.onclick=(e)=>{e.stopPropagation();solCardClick(card,src,idx,pos);};
    if(src==='tab'&&pos<solTab[idx].length-1)el.style.pointerEvents='auto';
    return el;
}
function solCardClick(card,src,idx,pos){
    sndClick();
    if(!solSelected){solSelected={card,src,idx,pos};solRender();return;}
    if(solSelected.src===src&&solSelected.idx===idx&&solSelected.pos===pos){solSelected=null;solRender();return;}
    // try move to foundation
    for(let f=0;f<4;f++){
        if(SOL_SUITS[f]===solSelected.card.suit&&solCanFound(solSelected.card,f)){
            solDoMoveFound(solSelected.src,solSelected.idx,solSelected.pos,f);
            solSelected=null;solScore+=10;solRender();return;
        }
    }
    solSelected={card,src,idx,pos};solRender();
}
function solColClick(c){
    if(!solSelected)return;sndClick();
    if(solCanTab(solSelected.card,c)){solDoMoveTab(solSelected.src,solSelected.idx,solSelected.pos,c);solSelected=null;solScore+=5;solRender();}
}
function solFoundClick(f){
    sndClick();if(!solSelected)return;
    if(solCanFound(solSelected.card,f)){solDoMoveFound(solSelected.src,solSelected.idx,solSelected.pos,f);solSelected=null;solScore+=10;solRender();}
}
function solCanTab(card,col){const pile=solTab[col];if(pile.length===0)return card.val==='K';const top=pile[pile.length-1];return top.faceUp&&top.idx===card.idx+1&&SOL_RED.includes(top.suit)!==SOL_RED.includes(card.suit);}
function solCanFound(card,f){const pile=solFound[f];if(pile.length===0)return card.val==='A'&&SOL_SUITS[f]===card.suit;const top=pile[pile.length-1];return top.suit===card.suit&&top.idx===card.idx-1;}
function solDoMoveTab(src,idx,pos,destCol){const cards=solExtract(src,idx,pos);cards.forEach(c=>solTab[destCol].push(c));solFlipTop(src,idx);}
function solDoMoveFound(src,idx,pos,f){const cards=solExtract(src,idx,pos);solFound[f].push(cards[0]);solFlipTop(src,idx);}
function solExtract(src,idx,pos){if(src==='waste')return[solWaste.pop()];if(src==='found')return[solFound[idx].pop()];return solTab[idx].splice(pos);}
function solFlipTop(src,idx){if(src==='tab'&&solTab[idx]&&solTab[idx].length>0){const t=solTab[idx][solTab[idx].length-1];if(!t.faceUp){t.faceUp=true;solScore+=5;}}}
function solStockClick(){
    sndClick();
    if(solStock.length===0){solStock=[...solWaste].reverse();solWaste=[];solStock.forEach(c=>c.faceUp=false);solScore=Math.max(0,solScore-100);}
    else{const c=solStock.pop();c.faceUp=true;solWaste.push(c);}
    solSelected=null;solRender();
}

/* ══════════════════════════════════════
   PAINEL DE CONTROLE
══════════════════════════════════════ */
const cpPrograms=[
    {name:'Google Chrome',ver:'120.0.6099.130',size:'280 MB',date:'15/01/2026'},
    {name:'Notepad++',ver:'8.6.2',size:'5 MB',date:'10/01/2026'},
    {name:'Windows Media Player',ver:'11.0',size:'20 MB',date:'01/01/2026'},
    {name:'7-Zip',ver:'23.01',size:'6 MB',date:'05/12/2025'},
    {name:'Git',ver:'2.43.0',size:'95 MB',date:'20/11/2025'},
    {name:'Node.js',ver:'20.11.0 LTS',size:'62 MB',date:'18/11/2025'},
    {name:'PHP 8.3',ver:'8.3.2',size:'42 MB',date:'10/11/2025'},
    {name:'Composer',ver:'2.6.6',size:'3 MB',date:'10/11/2025'},
    {name:'Docker Desktop',ver:'4.27.1',size:'980 MB',date:'01/11/2025'},
    {name:'Winamp',ver:'5.9.2',size:'12 MB',date:'15/10/2025'},
    {name:'CCleaner',ver:'6.20',size:'8 MB',date:'20/09/2025'},
];
function cpOpenAddRemove(){
    const el=document.getElementById('cp-programs-list');if(!el)return;
    el.innerHTML=cpPrograms.map(p=>`
        <div style="display:flex;align-items:center;padding:7px 8px;border:1px solid #ccc;background:#fff;margin-bottom:3px;gap:10px;font-family:Tahoma,Arial,sans-serif;font-size:12px;"
             onmouseover="this.style.background='#ddeeff'" onmouseout="this.style.background='#fff'">
            <div style="flex:1;font-weight:700">${p.name}</div>
            <div style="width:90px;color:#555">${p.ver}</div>
            <div style="width:60px;color:#555;text-align:right">${p.size}</div>
            <div style="width:80px;color:#888">${p.date}</div>
            <button onclick="event.stopPropagation();showNotif('📦 Remover Programa','Não é possível remover ${p.name.replace(/'/g,'')}: acesso negado pelo administrador.')" style="font-size:11px;padding:2px 8px;cursor:pointer;">Remover</button>
        </div>`).join('');
}
function cpDateTimeUpdate(){
    const d=document.getElementById('cp-date-display'),t=document.getElementById('cp-time-display');if(!d||!t)return;
    const now=new Date(),dias=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    d.textContent=dias[now.getDay()]+', '+now.getDate()+' de '+meses[now.getMonth()]+' de '+now.getFullYear();
    t.textContent=now.toLocaleTimeString('pt-BR');
}
setInterval(()=>{const w=document.getElementById('win-cp-datetime');if(w&&w.style.display!=='none')cpDateTimeUpdate();},1000);

// Hook openWindow para inicializar sub-janelas do painel
const _solOrigOpen = openWindow;
openWindow = function(id) {
    _solOrigOpen(id);
    if(id==='win-about') reopenAllTabs();
    if(id==='win-cp-addremove') setTimeout(cpOpenAddRemove,0);
    if(id==='win-cp-datetime') setTimeout(cpDateTimeUpdate,0);
    if(id==='win-solitaire'&&solTab[0].length===0) setTimeout(solNewGame,0);
    /* BSOD: se abrir janelas demais */
    const openCount = document.querySelectorAll('.xp-win[style*="display: flex"], .xp-win[style*="display:flex"]').length;
    if (openCount >= 10) { setTimeout(triggerBSOD, 1500); }
};

/* ══════════════════════════════════════
    CHKDSK — DIRTY SHUTDOWN RECOVERY
══════════════════════════════════════ */
function runChkdsk() {
    const overlay = document.getElementById('chkdsk-overlay');
    const lines = document.getElementById('chkdsk-lines');
    overlay.style.display = 'block';

    const chkLines = [
        'Verificando sistema de arquivos em C:',
        'O tipo do sistema de arquivos é NTFS.',
        '',
        'CHKDSK está verificando arquivos...',
        '  Fase 1 de 3: examinando metadados básicos...',
        '  Fase 1: 0% concluído. (0 de 98299 registros do MFT processados)',
        '  Fase 1: 13% concluído. (13012 de 98299 registros do MFT processados)',
        '  Fase 1: 45% concluído. (44234 de 98299 registros do MFT processados)',
        '  Fase 1: 79% concluído. (77651 de 98299 registros do MFT processados)',
        '  Fase 1: 100% concluído. (98299 de 98299 registros do MFT processados)',
        '  98299 registros de arquivo processados.',
        '',
        'CHKDSK está verificando a integridade do índice...',
        '  Fase 2 de 3: examinando a consistência dos nomes de arquivo...',
        '  Fase 2: 0% concluído. (0 de 95612 registros de índice processados)',
        '  Fase 2: 28% concluído. (26771 de 95612 registros de índice processados)',
        '  Fase 2: 61% concluído. (58323 de 95612 registros de índice processados)',
        '  Fase 2: 100% concluído. (95612 de 95612 registros de índice processados)',
        '  95612 registros de índice processados.',
        '',
        'CHKDSK está verificando descritores de segurança...',
        '  Fase 3 de 3: examinando descritores de segurança...',
        '  Fase 3: 100% concluído. (98299 de 98299 descritores processados)',
        '',
        'Windows fez correções no sistema de arquivos.',
        '',
        '  76.342.528 KB de espaço total em disco.',
        '  42.814.012 KB em 45.392 arquivos.',
        '   1.048.576 KB em 3.841 índices.',
        '          0 KB em setores defeituosos.',
        '     214.044 KB no sistema de arquivos em uso.',
        '  32.265.896 KB disponíveis no disco.',
        '',
        '      4.096 bytes em cada unidade de alocação.',
        ' 19.085.632 unidades de alocação totais em disco.',
        '  8.066.474 unidades de alocação disponíveis em disco.',
        '',
        'Verificação de disco concluída.',
    ];

    let i = 0;
    function printNext() {
        if (i < chkLines.length) {
            const line = document.createElement('div');
            line.textContent = chkLines[i];
            line.style.color = chkLines[i].startsWith('Windows fez') ? '#ff0' : '#aaa';
            lines.appendChild(line);
            i++;
            setTimeout(printNext, i < 6 ? 300 : i < 20 ? 120 : 200);
        } else {
            // Done, boot normally
            setTimeout(() => {
                overlay.style.display = 'none';
                showWelcome();
            }, 1500);
        }
    }
    setTimeout(printNext, 500);
}

/* ══════════════════════════════════════
    ERROR.EXE — CASCADING ERROR DIALOGS
══════════════════════════════════════ */
let _errCount = 0;
const _errMax = 10;
const _errMsgs = [
    'Ocorreu um erro inesperado no módulo ERROR.EXE\nCódigo: 0x000000FF\n\nO programa será encerrado.',
    'Falha de segmentação\nEndereço: 0xDEADBEEF\n\nDeseja enviar um relatório de erros para a Microsoft?',
    'Memória insuficiente para completar a operação.\n\nFeche outros programas e tente novamente.',
    'Este programa executou uma operação ilegal e será encerrado.',
    'Erro fatal: estouro de pilha (stack overflow)\nEm: error.exe + 0x0042AF10',
    'Arquivo de sistema corrompido: C:\\WINDOWS\\system32\\kernel32.dll\n\nExecute o CHKDSK para corrigir.',
    'Referência a objeto não definido como uma instância de objeto.',
    'Erro de E/S no disco D:\\\nO dispositivo não está pronto.',
    'IRQL_NOT_LESS_OR_EQUAL\nSTOP: 0x0000000A — reiniciando...',
    'Divisão por zero em instrução FDIV\nRegistrador EAX: 0x00000000',
];

function openErrorExe() {
    _errCount = 0;
    _spawnError();
}

function _spawnError() {
    if (_errCount >= _errMax) return;
    _errCount++;
    const id = 'err-dlg-' + _errCount + '-' + Date.now();
    const msg = _errMsgs[(_errCount - 1) % _errMsgs.length];
    const top = 60 + (_errCount % 6) * 38;
    const left = 80 + (_errCount % 5) * 48;
    const el = document.createElement('div');
    el.id = id;
    el.style.cssText = `position:fixed;top:${top}px;left:${left}px;width:380px;z-index:${9000+_errCount};background:#ece9d8;border:2px solid #0054e3;font-family:Tahoma,Arial,sans-serif;box-shadow:3px 3px 8px rgba(0,0,0,.5);`;
    el.innerHTML = `
        <div style="background:linear-gradient(180deg,#0a246a 0%,#3c72c8 100%);color:#fff;padding:4px 6px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;user-select:none;">
          <span style="display:flex;align-items:center;gap:6px;"><span style="font-size:14px;">⚠️</span> Erro de Aplicativo — ERROR.EXE</span>
          <span onclick="closeErrDlg('${id}')" style="cursor:pointer;background:#c40000;color:#fff;padding:1px 5px;border-radius:2px;font-size:13px;">✕</span>
        </div>
        <div style="padding:14px 16px;display:flex;gap:12px;align-items:flex-start;">
          <div style="font-size:32px;line-height:1;flex-shrink:0;">⛔</div>
          <div style="font-size:12px;line-height:1.6;color:#111;white-space:pre-wrap;">${msg}</div>
        </div>
        <div style="padding:8px 16px 12px;display:flex;gap:6px;justify-content:center;">
          <button onclick="closeErrDlg('${id}')" style="padding:4px 20px;font-size:12px;cursor:pointer;min-width:72px;">OK</button>
          <button onclick="closeErrDlg('${id}')" style="padding:4px 20px;font-size:12px;cursor:pointer;min-width:72px;">Cancelar</button>
        </div>`;
    document.body.appendChild(el);
    sndClick();
}

function closeErrDlg(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
    if (_errCount < _errMax) {
        setTimeout(_spawnError, 60);
        setTimeout(_spawnError, 180);
    }
}

/* ══════════════════════════════════════
    BSOD — TELA AZUL DA MORTE
══════════════════════════════════════ */
/* ══════════════════════════════════════
    VIRUS.BAT — A HISTÓRIA REAL
══════════════════════════════════════ */
function runVirusBat() {
    sndClick();
    /* Primeiro abre o "código fonte" no bloco de notas por 3s */
    openWindow('win-virus-src');
    setTimeout(() => {
        closeWin('win-virus-src');
        _startVirusSequence();
    }, 3500);
}

function _startVirusSequence() {
    const overlay = document.getElementById('virus-overlay');
    const output = document.getElementById('virus-output');
    overlay.style.display = 'flex';
    output.innerHTML = '';

    const lines = [
        { t: 0,     txt: '<span class="v-yellow">============================================</span>' },
        { t: 200,   txt: '<span class="v-yellow">  VIRUS ULTRA MEGA HACKER v1.0</span>' },
        { t: 400,   txt: '<span class="v-yellow">  por: Matheus Teixeira (o hacker, claro)</span>' },
        { t: 600,   txt: '<span class="v-yellow">  Nova Iguaçu, RJ - 2009</span>' },
        { t: 800,   txt: '<span class="v-yellow">============================================</span>' },
        { t: 1200,  txt: '' },
        { t: 1500,  txt: 'C:\\> virus.bat' },
        { t: 2000,  txt: '' },
        { t: 2300,  txt: 'Iniciando protocolo de destruicao...' },
        { t: 2800,  txt: '' },
        { t: 3200,  txt: '<span class="v-red">del /s /q C:\\Windows\\System32\\*.*</span>' },
        { t: 3500,  txt: '  Apagando kernel32.dll ...... OK' },
        { t: 3800,  txt: '  Apagando ntoskrnl.exe ...... OK' },
        { t: 4100,  txt: '  Apagando explorer.exe ...... OK' },
        { t: 4400,  txt: '  Apagando svchost.exe ....... OK' },
        { t: 4700,  txt: '  Apagando win32k.sys ........ OK' },
        { t: 5100,  txt: '' },
        { t: 5400,  txt: '<span class="v-red">del /s /q C:\\Users\\Matheus\\*.*</span>' },
        { t: 5700,  txt: '  Apagando Meus Documentos ... OK' },
        { t: 6000,  txt: '  Apagando fotos_familia.zip . OK' },
        { t: 6300,  txt: '  Apagando trabalho_escola.doc OK' },
        { t: 6600,  txt: '  Apagando musicas_limewire .. OK' },
        { t: 6900,  txt: '  Apagando saves_gta_sa ..... <span class="v-red">OK  ← NÃO!!!!</span>' },
        { t: 7300,  txt: '' },
        { t: 7600,  txt: '<span class="v-red">rd /s /q C:\\Windows</span>' },
        { t: 7900,  txt: '<span class="v-red">rd /s /q C:\\Users</span>' },
        { t: 8200,  txt: '<span class="v-red">rd /s /q D:\\Jogos</span>' },
        { t: 8500,  txt: '' },
        { t: 9000,  txt: '<span class="v-yellow">========================================</span>' },
        { t: 9300,  txt: '<span class="v-white">  HAHAHA SEU PC FOI HACKEADO!!!</span>' },
        { t: 9600,  txt: '<span class="v-white">  Assinado: Matheus, o maior hacker</span>' },
        { t: 9800,  txt: '<span class="v-white">           de Nova Iguaçu</span>' },
        { t: 10100, txt: '<span class="v-yellow">========================================</span>' },
        { t: 10500, txt: '' },
        { t: 11000, txt: '...' },
        { t: 11500, txt: '...espera.' },
        { t: 12200, txt: '' },
        { t: 12800, txt: '<span class="v-cyan">Peraí. Eu apaguei o WINDOWS?</span>' },
        { t: 13500, txt: '<span class="v-cyan">Tipo... O MEU Windows???</span>' },
        { t: 14200, txt: '<span class="v-cyan">O Windows que TÁ NESSE PC???</span>' },
        { t: 15000, txt: '' },
        { t: 15500, txt: '<span class="v-red">Meu save do GTA San Andreas...</span>' },
        { t: 16200, txt: '<span class="v-red">Minhas músicas do LimeWire...</span>' },
        { t: 16900, txt: '<span class="v-red">Meu trabalho de geografia que vale NOTA...</span>' },
        { t: 17600, txt: '<span class="v-red">As fotos da família no Natal...</span>' },
        { t: 18400, txt: '' },
        { t: 19000, txt: '<span class="v-yellow">TUDO.</span>' },
        { t: 19500, txt: '' },
        { t: 20200, txt: '<span class="v-white">O vírus funcionou perfeitamente.</span>' },
        { t: 21000, txt: '<span class="v-white">No meu próprio PC.</span>' },
        { t: 21800, txt: '<span class="v-white">No único PC da casa.</span>' },
        { t: 22600, txt: '' },
        { t: 23200, txt: '<span class="v-cyan">Eu tinha 12 anos.</span>' },
        { t: 23800, txt: '<span class="v-cyan">Achei que ia ser hacker.</span>' },
        { t: 24400, txt: '<span class="v-cyan">Virei dev.</span>' },
        { t: 25000, txt: '' },
        { t: 25600, txt: '<span class="v-yellow">Moral da história:</span>' },
        { t: 26200, txt: '<span class="v-white">sempre teste em ambiente de desenvolvimento.</span>' },
        { t: 27000, txt: '' },
        { t: 27800, txt: '<span class="v-cyan v-blink">Clique em qualquer lugar para reiniciar o PC...</span>' },
    ];

    lines.forEach(l => {
        setTimeout(() => {
            output.innerHTML += l.txt + '\n';
            overlay.scrollTop = overlay.scrollHeight;
        }, l.t);
    });

    /* Depois da última linha, permite fechar */
    setTimeout(() => {
        overlay.onclick = () => {
            overlay.onclick = null;
            overlay.style.display = 'none';
            /* Simula reboot — vai pro boot */
            localStorage.setItem('xp_dirty', '1');
            location.reload();
        };
    }, 28000);
}

function triggerBSOD() {
    const bsod = document.getElementById('bsod-overlay');
    bsod.style.display = 'flex';
    setTimeout(() => { document.getElementById('bsod-action').style.display = 'block'; }, 4000);
    document.addEventListener('keydown', function _bsodKey() {
        document.removeEventListener('keydown', _bsodKey);
        location.reload();
    });
}

/* ══════════════════════════════════════
    CLIPPY — ASSISTENTE DO OFFICE
══════════════════════════════════════ */
const clippyPhrases = [
    'Parece que você está tentando me contratar... Posso ajudar? 📎',
    'Dica: esse dev também faz café. ☕',
    'Você sabia que o Matheus começou a programar com 12 anos por causa do iCarly?',
    'Ei! Já viu o currículo dele? Tá em Curriculo.rtf no desktop!',
    'Esse site roda em um único arquivo HTML. Não me julgue.',
    'Psiu... tenta digitar "about" no Prompt de Comando. 😉',
    'O Matheus já deu aula de PHP no SENAC. Na mesma sala onde estudou!',
    'Fun fact: ele criou um dos maiores blogs da Moptop no Brasil.',
    'Quer uma dica? Abre o LimeWire. Confia.',
    'Se quiser contratar ele, manda um e-mail. Eu sou só um clipe de papel.',
];
let _clippyTimer = null;
function showClippy() {
    const el = document.getElementById('clippy');
    const txt = document.getElementById('clippy-text');
    txt.textContent = clippyPhrases[Math.floor(Math.random() * clippyPhrases.length)];
    el.style.display = 'block';
    if (_clippyTimer) clearTimeout(_clippyTimer);
    _clippyTimer = setTimeout(hideClippy, 12000);
}
function hideClippy() {
    document.getElementById('clippy').style.display = 'none';
    if (_clippyTimer) { clearTimeout(_clippyTimer); _clippyTimer = null; }
    /* agenda próxima aparição */
    setTimeout(showClippy, 30000 + Math.random() * 40000);
}

/* ══════════════════════════════════════
    WINRAR — POPUP DE LICENÇA EXPIRADA
══════════════════════════════════════ */
function showWinRAR() {
    document.getElementById('winrar-popup').style.display = 'block';
    sndClick();
}

/* ══════════════════════════════════════
    LIMEWIRE
══════════════════════════════════════ */
winMeta['win-limewire'] = { ico: '🍋', lbl: 'LimeWire' };

/* ══════════════════════════════════════
    DESFRAGMENTADOR DE DISCO
══════════════════════════════════════ */
winMeta['win-defrag'] = { ico: '🟦', lbl: 'Desfragmentador de Disco' };
function _drawDefrag(canvasId, fragmented) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    const cols = 60, rows = 12, bw = 8, bh = 8;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
            const x = col * bw, y = r * bh;
            let color;
            const pct = (r * cols + col) / (rows * cols);
            if (pct > 0.58) { color = '#111'; } /* espaço livre */
            else if (fragmented && Math.random() < 0.25) { color = '#e00'; } /* fragmentado */
            else if (Math.random() < 0.08) { color = '#0a0'; } /* sistema */
            else { color = '#22e'; } /* contíguo */
            ctx.fillStyle = color;
            ctx.fillRect(x, y, bw - 1, bh - 1);
        }
    }
}
function runDefrag() {
    const status = document.getElementById('defrag-status');
    const c = document.getElementById('defrag-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const cols = 60, rows = 12, bw = 8, bh = 8;
    let step = 0, total = cols * rows;
    status.textContent = 'Desfragmentando... 0%';
    function _step() {
        if (step >= total * 0.58) {
            status.textContent = 'Desfragmentação concluída com sucesso!';
            _drawDefrag('defrag-canvas-after', false);
            showNotif('🟦 Desfragmentador', 'Disco C: desfragmentado com sucesso!');
            return;
        }
        const r = Math.floor(step / cols), col = step % cols;
        const x = col * bw, y = r * bh;
        ctx.fillStyle = '#22e';
        ctx.fillRect(x, y, bw - 1, bh - 1);
        step += 1 + Math.floor(Math.random() * 3);
        status.textContent = 'Desfragmentando... ' + Math.min(100, Math.round(step / (total * 0.58) * 100)) + '%';
        setTimeout(_step, 20 + Math.random() * 30);
    }
    _drawDefrag('defrag-canvas', true);
    setTimeout(_step, 500);
}

/* ══════════════════════════════════════
    MSN ZUMBIDO (NUDGE)
══════════════════════════════════════ */
function msnNudge() {
    sndClick();
    const chat = document.getElementById('msn-chat');
    if (!chat || chat.style.display === 'none') return;
    chat.classList.add('msn-nudge');
    /* treme a tela toda também */
    document.body.classList.add('screen-shake');
    setTimeout(() => {
        chat.classList.remove('msn-nudge');
        document.body.classList.remove('screen-shake');
    }, 600);
    /* adiciona msg no chat */
    const log = document.getElementById('msn-chat-log');
    if (log) {
        const div = document.createElement('div');
        div.style.cssText = 'color:#888;font-style:italic;font-size:11px;padding:4px 0;';
        div.textContent = '🔔 Você enviou um zumbido!';
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    }
}

/* ══════════════════════════════════════
    MSN WEBCAM
══════════════════════════════════════ */
let _webcamStream = null;
let _webcamMsgTimer = null;
const _webcamReactions = [
    { msg: 'oi!! to te vendo!! 😍' },
    { msg: 'hahaha sua cara tá engraçada 😂' },
    { msg: 'arruma esse cabelo mds' },
    { msg: 'webcam de 2005 era assim mesmo, pixelada kk' },
    { msg: 'faz uma careta!!! 😜', screenshot: true },
    { msg: 'eita, tá bonito(a) hein 👀' },
    { msg: 'puts a qualidade tá péssima, parece MSN real kkk' },
    { msg: 'acena pra mim!! 👋' },
    { msg: 'saudades de quando webcam era evento' },
    { msg: 'mãe tá te vendo atrás de vc? kkkk' },
];

function msnOpenWebcam() {
    sndClick();
    const contact = msnChatContact.name || 'Contato';
    document.getElementById('msn-wc-name').textContent = contact;
    document.getElementById('msn-webcam').style.display = 'block';
    document.getElementById('msn-wc-overlay').classList.remove('hidden');
    document.getElementById('msn-wc-status').textContent = 'Conectando webcam...';
    document.getElementById('msn-wc-chat-msg').innerHTML = '';

    /* Adicionar mensagem no chat */
    const log = document.getElementById('msn-chat-msgs');
    const block = document.createElement('div');
    block.className = 'msn-msg-block';
    block.innerHTML = '<span class="msn-msg-name them-c">' + contact + '</span> diz:<br>aceita ver minha webcam? 📷';
    log.appendChild(block);
    log.scrollTop = log.scrollHeight;

    /* Solicitar câmera do visitante */
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            _webcamStream = stream;
            const video = document.getElementById('msn-wc-video');
            video.srcObject = stream;
            video.play().catch(() => {});
            /* Esconder overlay após conectar */
            setTimeout(() => {
                document.getElementById('msn-wc-overlay').classList.add('hidden');
                document.getElementById('msn-wc-status').textContent = '● Webcam ativa';
                /* Mensagem de reação do contato */
                _wcSendReaction(contact, _webcamReactions[0]);
                /* Iniciar mensagens periódicas */
                _startWebcamMessages(contact);
            }, 1500);
        })
        .catch(() => {
            document.getElementById('msn-wc-overlay').innerHTML = '<div class="msn-wc-connecting" style="animation:none;color:#f66;">❌ Webcam não autorizada<br><span style="font-size:10px;color:#888;">O contato não vai conseguir te ver!</span></div>';
            document.getElementById('msn-wc-status').textContent = '● Sem webcam';
        });
}

function _wcSendReaction(contact, reaction) {
    const text = reaction.msg;
    /* Mostrar na janela da webcam */
    document.getElementById('msn-wc-chat-msg').innerHTML = '<span class="them-c">' + contact + ' diz: ' + text + '</span>';

    /* Sincronizar com o chat do MSN */
    const log = document.getElementById('msn-chat-msgs');
    const block = document.createElement('div');
    block.className = 'msn-msg-block';
    block.innerHTML = '<span class="msn-msg-name them-c">' + contact + '</span> diz:<br>' + text;
    log.appendChild(block);
    log.scrollTop = log.scrollHeight;
    sndMsg();

    /* Se é a mensagem de careta, tira screenshot após 3s */
    if (reaction.screenshot) {
        setTimeout(() => _wcTakeScreenshot(contact), 3000);
    }
}

function _wcTakeScreenshot(contact) {
    const video = document.getElementById('msn-wc-video');
    if (!video || !video.srcObject) return;

    /* Capturar frame do vídeo num canvas */
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    sndNotif();

    /* Mandar a "foto" no chat do MSN */
    const log = document.getElementById('msn-chat-msgs');

    /* Mensagem do contato avisando que tirou print */
    const msgBlock = document.createElement('div');
    msgBlock.className = 'msn-msg-block';
    msgBlock.innerHTML = '<span class="msn-msg-name them-c">' + contact + '</span> diz:<br>HAHAHA PRINTEI!! 📸 olha sua cara:';
    log.appendChild(msgBlock);

    /* A imagem capturada */
    const imgBlock = document.createElement('div');
    imgBlock.className = 'msn-msg-block msn-msg-screenshot';
    imgBlock.innerHTML = '<img src="' + dataUrl + '" alt="Screenshot da webcam" style="max-width:200px;border:2px solid #7a96bb;border-radius:3px;margin-top:4px;box-shadow:1px 1px 4px rgba(0,0,0,0.2);">';
    log.appendChild(imgBlock);
    log.scrollTop = log.scrollHeight;

    /* Mostrar na webcam também */
    document.getElementById('msn-wc-chat-msg').innerHTML = '<span class="them-c">' + contact + ' diz: HAHAHA PRINTEI!! 📸</span>';
}

function _startWebcamMessages(contact) {
    let idx = 1;
    _webcamMsgTimer = setInterval(() => {
        if (idx >= _webcamReactions.length) idx = 1;
        _wcSendReaction(contact, _webcamReactions[idx]);
        idx++;
    }, 6000 + Math.random() * 4000);
}

function msnCloseWebcam() {
    sndClick();
    document.getElementById('msn-webcam').style.display = 'none';
    if (_webcamStream) {
        _webcamStream.getTracks().forEach(t => t.stop());
        _webcamStream = null;
    }
    if (_webcamMsgTimer) {
        clearInterval(_webcamMsgTimer);
        _webcamMsgTimer = null;
    }
    document.getElementById('msn-wc-video').srcObject = null;
}

/* ══════════════════════════════════════
    CMD — COMANDOS EXTRAS DO PORTFÓLIO
══════════════════════════════════════ */
const _cmdExtras = {
    'about': `
    Matheus Teixeira dos Santos, 26 anos
    Natural de Nova Iguaçu/RJ | Mora em São Paulo/SP
    Desenvolvedor Full Stack | PHP/Laravel specialist

    Comecei a programar aos 12 anos, inspirado pelo iCarly.
    Minha mãe me deu um livro de PHP e MySQL e eu criei
    meu primeiro blog nesse Windows XP.

    Hoje sou fundador do Mestre Oficina (SaaS) e atuo como
    dev pleno na MUPER, trabalhando com Laravel, Docker,
    Python, React e integrações com IA.
`,
    'skills': `
    ═══════════════════════════════════════
    HABILIDADES TÉCNICAS
    ═══════════════════════════════════════
    Backend:    PHP, Laravel, NodeJS, Python
    Frontend:   React, Vue, Next, Livewire
    Banco:      MySQL, Postgres, MongoDB, SQL Server
    DevOps:     Docker, GitHub Actions, Ubuntu Server
    Cloud:      AWS (em estudo), Kubernetes (em estudo)
    Automação:  n8n, webhooks, filas/jobs
    Conceitos:  SOLID, Clean Code, REST, CI/CD
    Normas:     LGPD, ISO 27001
`,
    'projects': `
    ═══════════════════════════════════════
    PROJETOS
    ═══════════════════════════════════════
    [1] Mestre Oficina (SaaS)
        Plataforma de gestão para oficinas mecânicas.
        Laravel + MySQL + APIs WhatsApp + NF-e (945 municípios)
        → mestreoficina.com.br

    [2] Orquestrador (BPO Innova → Agilizza)
        Plataforma de automação com robôs fiscais/contábeis.
        Economizou milhares de horas de trabalho manual.

    [3] Targon (BPO Innova)
        Sistema de controle financeiro e gestão de horas.
        Trouxe transparência e eficiência para a operação.

    [4] Este site (Windows XP Portfolio)
        Simulação completa do Windows XP em HTML/CSS/JS.
        Um único arquivo. Nostalgia pura.
`,
    'history': `
    ═══════════════════════════════════════
    TRAJETÓRIA PROFISSIONAL
    ═══════════════════════════════════════
    2018     SC Brasil — Estagiário de Suporte
    2019-20  CEBRAT Educação — Suporte & Dev
    2020-22  BPO Innova — Dev Backend Júnior → Pleno
    2023-24  SENAC Rio — Instrutor de Programação
    2023-24  Agilizza — Dev Full Stack Pleno
    2024+    MUPER — Dev Full Stack Pleno
    2024+    Mestre Oficina — Fundador & Dev Principal

    Formação:
    • ADS — Estácio de Sá (2023)
    • Pós-grad Cloud Computing — Gran (em andamento)
`,
    'contact': `
    ═══════════════════════════════════════
    CONTATO
    ═══════════════════════════════════════
    Email:    contato.matheusteixeira@gmail.com
    Site:     matheusteixeira.com.br
    LinkedIn: linkedin.com/in/aeusteixeira
    Tel:      (21) 99428-2445
`,
    'limewire': `
    Iniciando LimeWire 4.18.8...
    Conectando à rede Gnutella...
    Conectado! 47 fontes encontradas.
`,
    'defrag': `
    Iniciando Desfragmentador de Disco...
`,
    'bsod': `
    *** AVISO: executando diagnóstico do sistema...
    *** ERRO CRITICO DETECTADO
`,
};

/* Hook no processador de comandos do CMD */
const _origCmdProcess = typeof cmdProcess === 'function' ? cmdProcess : null;