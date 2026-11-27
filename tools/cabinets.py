import sys, os
from PIL import Image, ImageFilter
import numpy as np
src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
im = Image.open(src).convert('RGB')
W, H = 1400, 2100
im = im.resize((W, H), Image.LANCZOS)
hsv = np.asarray(im.convert('HSV')).astype(np.float32)
h = hsv[..., 0] / 255 * 360
s = hsv[..., 1]
# masque de teinte : plage verte, bords doux (bois ~30-40° préservé)
def ramp(x, a, b):
    return np.clip((x - a) / (b - a), 0, 1)
mh = ramp(h, 44, 56) * (1 - ramp(h, 195, 215))
# masque spatial : intérieur de l'armoire, bords doux
yy, xx = np.mgrid[0:H, 0:W]
xs, ys = xx / W, yy / H
ms = ramp(xs, 0.085, 0.105) * (1 - ramp(xs, 0.895, 0.915)) * ramp(ys, 0.035, 0.05) * (1 - ramp(ys, 0.93, 0.97))
mask = mh * ms
mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
variants = {'green': (None, 1.0, 1.0), 'amber': (38, 1.45, 1.18), 'blue': (198, 1.1, 1.05), 'plum': (284, 0.95, 1.04)}
for name, (dh, sat, val) in variants.items():
    out = hsv.copy()
    if dh is None:
        nh = h
    else:
        r = np.radians(h); t = np.radians(dh)
        cx = np.cos(r) * (1 - mask) + np.cos(t) * mask
        cy = np.sin(r) * (1 - mask) + np.sin(t) * mask
        nh = np.degrees(np.arctan2(cy, cx)) % 360
    out[..., 0] = nh / 360 * 255
    out[..., 1] = np.clip(s * (1 + (sat - 1) * mask), 0, 255)
    out[..., 2] = np.clip(hsv[..., 2] * (1 + (val - 1) * mask), 0, 255)
    rgb = Image.fromarray(out.astype(np.uint8), 'HSV').convert('RGB')
    rgb.save(os.path.join(outdir, f'cabinet-{name}.jpg'), quality=80, optimize=True, progressive=True)
    rgb.resize((467, 700), Image.LANCZOS).save(os.path.join(outdir, f'thumb-{name}.jpg'), quality=72)
print('ok')
