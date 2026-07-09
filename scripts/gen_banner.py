"""Gera o banner.svg (cartao neofetch) do README. Rode: python scripts/gen_banner.py"""
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

# info alinhado por linha da arte. (label, valor) -> label laranja, valor claro.
# ('title', txt) = destaque branco. ('rule', txt) = separador. (None) = vazia.
INFO = {
    0:  ('title', 'aeusteixeira'),
    1:  ('rule',  '--------------------'),
    2:  ('OS',        'Sao Paulo, Brasil'),
    3:  ('Uptime',    '8+ anos PHP/Laravel'),
    4:  ('Host',      'MTDS Software'),
    5:  ('Kernel',    'Fundador @ Mestre Oficina'),
    7:  ('Backend',   'PHP 8.x, Laravel, Node.js'),
    8:  ('Frontend',  'Livewire, FilamentPHP, Vue/React'),
    9:  ('Banco',     'MySQL, PostgreSQL, Redis, Mongo'),
    10: ('Infra',     'Docker, Kubernetes, AWS, CI/CD'),
    11: ('Automacao', 'n8n, Python'),
    13: ('Formacao',  'Analise e Desenvolvimento de Sistemas'),
    15: ('Comunidade','PHPSP, PHP Rio, Hack in Rio'),
}
LABEL_W = 11  # largura do campo label+pontos antes do valor

C_ART = '#8b8b8b'
C_LABEL = '#ff8a2b'
C_TEXT = '#d8d8d8'
C_TITLE = '#f0f6fc'

FS = 13.0
CW = FS * 0.60
LH = 15.5
PAD_X = 22
PAD_TOP = 46
INFO_X = PAD_X + (max(len(a) for a in ART) + 3) * CW

def esc(s):
    return html.escape(s).replace(' ', '&#160;')

def info_len(v):
    kind, val = v
    if kind in ('title', 'rule'):
        return len(val)
    return LABEL_W + 1 + len(val)
max_info = max(info_len(v) for v in INFO.values())
W = int(INFO_X + (max_info + 2) * CW) + 8
H = int(PAD_TOP + len(ART) * LH + 18)

o = []
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
         f'font-family="\'JetBrains Mono\',\'Cascadia Code\',\'DejaVu Sans Mono\',\'Consolas\',monospace">')
o.append(f'<rect x="0" y="0" width="{W}" height="{H}" rx="10" fill="#0d1117"/>')
o.append(f'<rect x="0.5" y="0.5" width="{W-1}" height="{H-1}" rx="10" fill="none" stroke="#30363d"/>')
o.append(f'<rect x="1" y="1" width="{W-2}" height="30" rx="10" fill="#161b22"/>')
o.append(f'<rect x="1" y="16" width="{W-2}" height="15" fill="#161b22"/>')
for i, c in enumerate(['#ff5f56', '#ffbd2e', '#27c93f']):
    o.append(f'<circle cx="{18+i*18}" cy="16" r="6" fill="{c}"/>')
o.append(f'<text x="{W/2}" y="20" fill="#8b949e" font-size="12" text-anchor="middle">aeusteixeira@github</text>')

y = PAD_TOP + FS
for i, art in enumerate(ART):
    o.append(f'<text x="{PAD_X}" y="{y:.1f}" font-size="{FS}" fill="{C_ART}" xml:space="preserve">{esc(art)}</text>')
    if i in INFO:
        kind, val = INFO[i]
        if kind == 'title':
            o.append(f'<text x="{INFO_X:.1f}" y="{y:.1f}" font-size="{FS}" fill="{C_TITLE}" font-weight="bold" xml:space="preserve">{esc(val)}</text>')
        elif kind == 'rule':
            o.append(f'<text x="{INFO_X:.1f}" y="{y:.1f}" font-size="{FS}" fill="{C_TEXT}" xml:space="preserve">{esc(val)}</text>')
        else:
            dots = '.' * max(0, LABEL_W - len(kind))
            o.append(f'<text x="{INFO_X:.1f}" y="{y:.1f}" font-size="{FS}" xml:space="preserve">'
                     f'<tspan fill="{C_LABEL}">{esc(kind)}</tspan>'
                     f'<tspan fill="{C_TEXT}">{esc(dots)} {esc(val)}</tspan></text>')
    y += LH
o.append('</svg>')

dst = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'banner.svg')
open(dst, 'w', encoding='utf-8').write('\n'.join(o))
print('SVG gerado:', dst, f'({W}x{H})')
