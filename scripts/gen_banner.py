"""Gera o banner.svg do README: um cmd.exe do Windows XP (barra Luna) com
saida estilo neofetch. Rode: python scripts/gen_banner.py
"""
import html, os

ART = [
    '::::-----------------================+++++++++++++++++',
    ':::----------------========--==+++++++++++++++++++****',
    ':::--------------====-:         .-+++++++++++++*******',
    '::-------------====-. .:. ..       :++++++++**********',
    '-------------=====-:=****++=--.      :++++************',
    '-----------======-=*######*+=-::..    :***************',
    '---------=======-+#%%%%%###*+=-::.     +**************',
    '--------=========++=++%@%%#=:.         -**************',
    '-------=========+##*+=*%%*-:-=-::.     :**************',
    '------==========**=+=:=#*: :==.  .      =************',
    '-----==========+#####%%#=..:+++==:       *************',
    '---============*@@%##%%%= :.+%%*=:       *********####',
    '--===========++#%@*#%#++-  .:=+*=.      -*******######',
    '-==========+++=*%%*==%%#*=-. .-++.    -=*******#######',
    '===========++++==*#%%%@%#*-::=+=:     *#*****#########',
    '==========+++++=.-#%@@*+*+=---:      :#***############',
    '=========+++++++=..=##*++==:.        +################',
    '========+++++++++=   :-:.            +++*#############',
    '=======++++++++++*+=.                    =############',
    '======+++++++++++=:*%#+=-:.  ....         +###########',
    '======+++++++++=-: +%@@%#*+**+=-:..        :=*########',
    '====++++=--:..   -. +%@@%%@#-.   ......       -+*#####',
    '===+=-:.        : .:.=%@@@#          .    ..     -*###',
    '==-..    ..  :::-. .-.=%#-     .....:  . :.        :+#',
    '=.  . .... .:::--=: .: .   ..:::.:::   .:.           :',
    '-  ...:...::::::--::=.::::::-::::::.  .-.    ..       ',
    ': :::::.:::::::--..-::=-:::-:::::-.  :-.   .. ...     ',
    ':::--::--------:::==: :-:--::--:-:. --:.....:....     ',
    '.-:--:-------:.:-===: :----------- .-:.::::::...      ',
    ':::-:-=-----:.:--===::##*+++=----- .::--:::::..       ',
]

# tipos: ('head',t) regua-titulo | ('sec',t) regua de secao |
#        ('kv',label,valor) campo pontilhado | ('gap',) branco
ROWS = [
    ('head', 'matheus@xp'),
    ('gap',),
    ('kv', 'OS', 'Ubuntu, Windows 11, Docker'),
    ('kv', 'Uptime', '8+ anos (desde 2013)'),
    ('kv', 'Host', 'Mestre Oficina (SaaS)'),
    ('kv', 'Kernel', 'Back-End Developer & Fundador'),
    ('kv', 'IDE', 'PhpStorm, VS Code, Notepad++'),
    ('gap',),
    ('kv', 'Languages.Backend', 'PHP, Laravel, Node.js, Python'),
    ('kv', 'Languages.Frontend', 'Livewire, Filament, Vue/React'),
    ('kv', 'Languages.Database', 'MySQL, Postgres, Redis, Mongo'),
    ('kv', 'Languages.DevOps', 'Docker, AWS, n8n, CI/CD'),
    ('kv', 'Languages.Real', 'Português, Inglês'),
    ('gap',),
    ('kv', 'Hobbies.Offline', 'Mergulho, Moto, Fotografia'),
    ('kv', 'Hobbies.Online', 'Criar ferramentas pra mim mesmo'),
    ('gap',),
    ('sec', 'Trivia'),
    ('kv', 'Fun.Fact', 'Codo desde os 12, culpa do iCarly'),
    ('gap',),
    ('sec', 'Contact'),
    ('kv', 'LinkedIn', 'aeusteixeira'),
    ('kv', 'Twitter', 'aeusteixeira'),
    ('kv', 'Site', 'matheusteixeira.com.br'),
]

# cores
C_ART    = '#7a7a7a'
C_LABEL  = '#ff8a2b'   # laranja neon dos labels
C_DOT    = '#3a3a3a'   # pontilhado discreto
C_VALUE  = '#dcdcdc'   # valores claros (cmd branco)
C_PROMPT = '#c9c9c9'
C_BG     = '#0c0c0c'   # preto do cmd
C_FRAME  = '#0a4fca'   # moldura azul XP

FS = 13.0
CW = FS * 0.60
LH = 16.0
PAD_X = 22
H_TB = 30              # altura da barra de titulo
ART_W = max(len(a) for a in ART)
INFO_X = PAD_X + (ART_W + 3) * CW

def _kv_need(label, value):
    return 2 + len(label) + 1 + 2 + 1 + len(value)

def _head_need(title):
    return len(title) + 1 + 4

TOTAL = 0
for r in ROWS:
    if r[0] == 'kv':
        TOTAL = max(TOTAL, _kv_need(r[1], r[2]))
    elif r[0] == 'head':
        TOTAL = max(TOTAL, _head_need(r[1]))
    elif r[0] == 'sec':
        TOTAL = max(TOTAL, _head_need('- ' + r[1]))
TOTAL += 1

def esc(s):
    return html.escape(s).replace(' ', '&#160;')

def span(color, text, extra=''):
    return f'<tspan fill="{color}"{extra}>{esc(text)}</tspan>'

PROMPT = r'C:\Documents and Settings\Matheus>'
MS1 = 'Microsoft Windows XP [Versão 5.1.2600]'
MS2 = '(C) Copyright 1985-2001 Microsoft Corp.'
C_CMD = '#c6c6c6'   # prata do texto padrao do cmd
SB_W = 17           # largura da barra de rolagem

CONTENT_R = INFO_X + TOTAL * CW
W = int(CONTENT_R + 14 + SB_W + 5)

# layout vertical
ms1_y = H_TB + 20
ms2_y = ms1_y + LH
prompt1_y = ms2_y + int(LH * 1.9)
art_y0 = prompt1_y + int(LH * 1.6)
art_bottom = art_y0 + len(ART) * LH
prompt2_y = art_bottom + int(LH * 1.2)
H = int(prompt2_y + 16)

o = []
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'font-family="\'JetBrains Mono\',\'Cascadia Code\',\'DejaVu Sans Mono\',\'Consolas\',monospace">')

# --- gradientes ---
o.append('<defs>')
o.append('<linearGradient id="luna" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="#3f93f5"/><stop offset="0.09" stop-color="#2d86f2"/>'
         '<stop offset="0.5" stop-color="#0d5fdc"/><stop offset="1" stop-color="#0a49c0"/>'
         '</linearGradient>')
o.append('<linearGradient id="btnBlue" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="#6fb2fb"/><stop offset="1" stop-color="#1663d2"/></linearGradient>')
o.append('<linearGradient id="btnRed" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="#f6a58c"/><stop offset="0.5" stop-color="#e2603f"/>'
         '<stop offset="1" stop-color="#c22e18"/></linearGradient>')
o.append('</defs>')

# --- janela ---
o.append(f'<rect x="1.5" y="1.5" width="{W-3}" height="{H-3}" rx="7" fill="{C_BG}" stroke="{C_FRAME}" stroke-width="3"/>')
# barra de titulo Luna
o.append(f'<path d="M2.5 9 Q2.5 2.5 9 2.5 L{W-9} 2.5 Q{W-2.5} 2.5 {W-2.5} 9 L{W-2.5} {H_TB} L2.5 {H_TB} Z" fill="url(#luna)"/>')
o.append(f'<rect x="2.5" y="3" width="{W-5}" height="1.3" fill="#bcd8ff" opacity="0.55"/>')
# icone do cmd
o.append(f'<rect x="9" y="8" width="16" height="14" rx="1.5" fill="#000" stroke="#8fb6ef"/>')
o.append(f'<text x="11" y="19" font-size="10" fill="#e8e8e8" font-family="monospace">&gt;_</text>')
o.append(f'<text x="31" y="20" font-size="12.5" fill="#ffffff" font-family="Tahoma,\'Segoe UI\',sans-serif" '
         f'font-weight="bold">C:\\WINDOWS\\System32\\cmd.exe</text>')
# botoes XP (min, max, close)
bw, bh, by = 21, 18, 5
cx = W - 6 - bw
mx = cx - bw - 2
nx = mx - bw - 2
for bx, grad in [(nx, 'url(#btnBlue)'), (mx, 'url(#btnBlue)'), (cx, 'url(#btnRed)')]:
    o.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="3" fill="{grad}" stroke="#cfe3fb" stroke-opacity="0.7"/>')
    o.append(f'<rect x="{bx+1.5}" y="{by+1}" width="{bw-3}" height="1.4" rx="0.7" fill="#ffffff" opacity="0.55"/>')
# glifos: minimizar
o.append(f'<rect x="{nx+6}" y="{by+bh-6}" width="9" height="2.4" fill="#fff"/>')
# maximizar
o.append(f'<rect x="{mx+5}" y="{by+4}" width="11" height="9" fill="none" stroke="#fff" stroke-width="1.6"/>')
o.append(f'<rect x="{mx+5}" y="{by+4}" width="11" height="2.6" fill="#fff"/>')
# fechar (X)
o.append(f'<g stroke="#fff" stroke-width="1.9" stroke-linecap="round">'
         f'<line x1="{cx+6}" y1="{by+5}" x2="{cx+bw-6}" y2="{by+bh-5}"/>'
         f'<line x1="{cx+bw-6}" y1="{by+5}" x2="{cx+6}" y2="{by+bh-5}"/></g>')

# --- cabecalho do cmd + prompt ---
o.append(f'<text x="{PAD_X}" y="{ms1_y}" font-size="{FS}" fill="{C_CMD}" xml:space="preserve">{esc(MS1)}</text>')
o.append(f'<text x="{PAD_X}" y="{ms2_y}" font-size="{FS}" fill="{C_CMD}" xml:space="preserve">{esc(MS2)}</text>')
o.append(f'<text x="{PAD_X}" y="{prompt1_y}" font-size="{FS}" xml:space="preserve">'
         + span(C_CMD, PROMPT) + span(C_VALUE, ' aboutme') + '</text>')

# --- arte + info ---
y = art_y0 + FS
for i, art in enumerate(ART):
    o.append(f'<text x="{PAD_X}" y="{y:.1f}" font-size="{FS}" fill="{C_ART}" xml:space="preserve">{esc(art)}</text>')
    if i < len(ROWS):
        r = ROWS[i]
        parts = []
        if r[0] in ('head', 'sec'):
            title = r[1] if r[0] == 'head' else '- ' + r[1]
            dashes = '-' * max(4, TOTAL - len(title) - 1)
            parts.append(span(C_LABEL, title, ' font-weight="bold"'))
            parts.append(span(C_DOT, ' ' + dashes))
        elif r[0] == 'kv':
            label, value = r[1] + ':', r[2]
            n_dots = TOTAL - len(label) - len(value) - 4
            parts.append(span(C_DOT, '. '))
            parts.append(span(C_LABEL, label))
            parts.append(span(C_DOT, ' ' + ('.' * max(2, n_dots)) + ' '))
            parts.append(span(C_VALUE, value))
        if parts:
            o.append(f'<text x="{INFO_X:.1f}" y="{y:.1f}" font-size="{FS}" xml:space="preserve">' + ''.join(parts) + '</text>')
    y += LH

# --- prompt final com cursor piscando ---
o.append(f'<text x="{PAD_X}" y="{prompt2_y}" font-size="{FS}" xml:space="preserve">' + span(C_CMD, PROMPT) + '</text>')
cur_x = PAD_X + (len(PROMPT) + 0.4) * CW
o.append(f'<rect x="{cur_x:.1f}" y="{prompt2_y-FS+2:.1f}" width="{CW*0.9:.1f}" height="{FS-1:.1f}" fill="{C_VALUE}">'
         f'<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite"/></rect>')

# --- barra de rolagem XP (prata 3D) ---
def raised(x, y, w, h, face='#d4d0c8'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{face}"/>'
            f'<path d="M{x} {y+h} L{x} {y} L{x+w} {y}" fill="none" stroke="#ffffff"/>'
            f'<path d="M{x} {y+h} L{x+w} {y+h} L{x+w} {y}" fill="none" stroke="#7f7f79"/>')

sbx = W - 3 - SB_W
sb_top = H_TB
sb_bot = H - 3
mid = sbx + SB_W / 2
o.append(f'<rect x="{sbx}" y="{sb_top}" width="{SB_W}" height="{sb_bot - sb_top}" fill="#e6e3da"/>')
# seta cima
o.append(raised(sbx, sb_top, SB_W, SB_W))
o.append(f'<path d="M{mid} {sb_top+5} L{mid-4} {sb_top+11} L{mid+4} {sb_top+11} Z" fill="#3a3a3a"/>')
# seta baixo
dby = sb_bot - SB_W
o.append(raised(sbx, dby, SB_W, SB_W))
o.append(f'<path d="M{mid} {dby+12} L{mid-4} {dby+6} L{mid+4} {dby+6} Z" fill="#3a3a3a"/>')
# thumb (perto do topo, pois estamos no inicio da saida)
track_h = (dby) - (sb_top + SB_W)
thumb_h = max(28, track_h * 0.42)
o.append(raised(sbx + 1, sb_top + SB_W + 2, SB_W - 2, thumb_h))

o.append('</svg>')

dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'banner.svg')
open(dst, 'w', encoding='utf-8').write('\n'.join(o))
print('SVG gerado:', dst, f'({W}x{H}) TOTAL={TOTAL}')
