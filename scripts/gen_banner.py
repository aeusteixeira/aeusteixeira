"""Gera o banner.svg (cartao estilo neofetch) do README.
Estilo inspirado no perfil do Andrew6rant: secoes agrupadas, lideres
pontilhados e valores alinhados a direita. Rode: python scripts/gen_banner.py
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

# tipos de linha:
#   ('head', 'matheus@teixeira')   regua-titulo (user@host)
#   ('sec',  'Contact')            regua de secao (- Contact ----)
#   ('kv',   'OS', 'valor')        campo: label pontilhado + valor a direita
#   ('gap',)                       linha em branco
ROWS = [
    ('head', 'matheus@teixeira'),
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
    ('kv', 'Languages.Real', 'Portugues, Ingles'),
    ('gap',),
    ('kv', 'Hobbies.Offline', 'Mergulho, Moto, Fotografia'),
    ('kv', 'Hobbies.Online', 'Listas, One Direction'),
    ('gap',),
    ('sec', 'Contact'),
    ('kv', 'LinkedIn', 'aeusteixeira'),
    ('kv', 'Twitter', 'aeusteixeira'),
    ('kv', 'Site', 'matheusteixeira.com.br'),
]

# cores
C_ART   = '#8b8b8b'
C_LABEL = '#ff8a2b'   # laranja neon dos labels
C_DOT   = '#3d444d'   # pontilhado / dashes discretos
C_VALUE = '#e6edf3'   # valores claros
C_BG    = '#0d1117'
C_BORDER= '#30363d'

FS = 13.0
CW = FS * 0.60
LH = 16.0
PAD_X = 22
PAD_TOP = 22
ART_W = max(len(a) for a in ART)
INFO_X = PAD_X + (ART_W + 3) * CW

def _kv_need(label, value):
    # '. ' + label + ' ' + (>=2 dots) + ' ' + value
    return 2 + len(label) + 1 + 2 + 1 + len(value)

def _head_need(title):
    return len(title) + 1 + 4  # titulo + espaco + minimo de dashes

TOTAL = 0
for r in ROWS:
    if r[0] == 'kv':
        TOTAL = max(TOTAL, _kv_need(r[1], r[2]))
    elif r[0] == 'head':
        TOTAL = max(TOTAL, _head_need(r[1]))
    elif r[0] == 'sec':
        TOTAL = max(TOTAL, _head_need('- ' + r[1]))
TOTAL += 1  # respiro

def esc(s):
    return html.escape(s).replace(' ', '&#160;')

def span(color, text, extra=''):
    return f'<tspan fill="{color}"{extra}>{esc(text)}</tspan>'

W = int(INFO_X + TOTAL * CW) + PAD_X
H = int(PAD_TOP + len(ART) * LH + 18)

o = []
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'font-family="\'JetBrains Mono\',\'Cascadia Code\',\'DejaVu Sans Mono\',\'Consolas\',monospace">')
o.append(f'<rect x="0" y="0" width="{W}" height="{H}" rx="10" fill="{C_BG}"/>')
o.append(f'<rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="10" fill="none" stroke="{C_BORDER}"/>')

y = PAD_TOP + FS
for i, art in enumerate(ART):
    o.append(f'<text x="{PAD_X}" y="{y:.1f}" font-size="{FS}" fill="{C_ART}" xml:space="preserve">{esc(art)}</text>')
    if i < len(ROWS):
        r = ROWS[i]
        parts = []
        if r[0] == 'head':
            title = r[1]
            dashes = '-' * max(4, TOTAL - len(title) - 1)
            parts.append(span(C_LABEL, title, ' font-weight="bold"'))
            parts.append(span(C_DOT, ' ' + dashes))
        elif r[0] == 'sec':
            head = '- ' + r[1]
            dashes = '-' * max(4, TOTAL - len(head) - 1)
            parts.append(span(C_LABEL, head, ' font-weight="bold"'))
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
o.append('</svg>')

dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'banner.svg')
open(dst, 'w', encoding='utf-8').write('\n'.join(o))
print('SVG gerado:', dst, f'({W}x{H}) TOTAL={TOTAL} cols')
