import re, json
from PIL import Image

data = open('ROCKY.acd', 'rb').read().decode('latin-1')
anim_pat = re.compile(r'DefineAnimation "(.*?)"(.*?)EndAnimation', re.S)
frame_pat = re.compile(r'DefineFrame(.*?)EndFrame', re.S)
# cada DefineImage com filename e offsets opcionais (offset fica DENTRO do bloco)
img_blk = re.compile(r'DefineImage(.*?)EndImage', re.S)
fn_pat = re.compile(r'(\d+)\.bmp')
ox_pat = re.compile(r'OffsetX = (-?\d+)')
oy_pat = re.compile(r'OffsetY = (-?\d+)')
dur_pat = re.compile(r'Duration = (\d+)')

CW, CH = 124, 93

def is_magenta(r, g, b):
    return r > 180 and b > 180 and g < 100

_cache = {}
def keyed(idx):
    if idx in _cache:
        return _cache[idx]
    im = Image.open('Images/%04d.bmp' % idx).convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if is_magenta(r, g, b):
                px[x, y] = (0, 0, 0, 0)
    _cache[idx] = im
    return im

def composite(layers):
    """layers = [(bmpIdx, ox, oy), ...] desenhadas em ordem."""
    canvas = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    for idx, ox, oy in layers:
        canvas.alpha_composite(keyed(idx), (ox, oy))
    return canvas

anims = {}
for m in anim_pat.finditer(data):
    name = m.group(1); body = m.group(2); seq = []
    for fm in frame_pat.finditer(body):
        fb = fm.group(1)
        layers = []
        for ib in img_blk.finditer(fb):
            blk = ib.group(1)
            fn = fn_pat.search(blk)
            if not fn:
                continue
            ox = int(ox_pat.search(blk).group(1)) if ox_pat.search(blk) else 0
            oy = int(oy_pat.search(blk).group(1)) if oy_pat.search(blk) else 0
            layers.append((int(fn.group(1)), ox, oy))
        if not layers:
            continue  # frame so de branching/som, sem imagem
        dur = dur_pat.search(fb)
        ms = (int(dur.group(1)) * 10) if dur else 0
        if ms <= 0:
            ms = 90
        ms = min(ms, 1600)
        seq.append((tuple(layers), ms))
    if seq:
        anims[name] = seq

# composites unicos (assinatura = tupla de camadas)
sigs = []
sigmap = {}
for s in anims.values():
    for sig, ms in s:
        if sig not in sigmap:
            sigmap[sig] = len(sigs)
            sigs.append(sig)

COLS = 26
ROWS = (len(sigs) + COLS - 1) // COLS
atlas = Image.new('RGBA', (COLS * CW, ROWS * CH), (0, 0, 0, 0))
for i, sig in enumerate(sigs):
    atlas.paste(composite(sig), ((i % COLS) * CW, (i // COLS) * CH))
atlas.save('../../rocky-anim.png')

out = {n: [[sigmap[sig], ms] for sig, ms in s] for n, s in anims.items()}
js = ("window.ROCKY_ANIM_COLS=%d;\nwindow.ROCKY_ANIM_CW=%d;\nwindow.ROCKY_ANIM_CH=%d;\nwindow.ROCKY_ANIMS=%s;\n"
      % (COLS, CW, CH, json.dumps(out, separators=(',', ':'), ensure_ascii=True)))
open('../../../rocky-anims.js', 'w', encoding='utf-8').write(js)

multi = sum(1 for sig in sigs if len(sig) > 1)
print("animacoes:", len(out), "| composites unicos:", len(sigs),
      "(%d compostos)" % multi, "| atlas:", atlas.size, "ROWS", ROWS)
