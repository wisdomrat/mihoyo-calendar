from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(r"D:\work\coding\mihoyo-calendar")
BASE = ROOT / "docs/calendar-redesign/candidates/candidate-GPT-01/concept-v3-GPT"
OUT = ROOT / "docs/calendar-redesign/candidates/candidate-GPT-01-revision-01"
OUT.mkdir(parents=True, exist_ok=True)

# The source image is deliberately kept intact: it is the GPT-01 visual reference.
canvas = Image.open(BASE / "02-sumeru-filter-GPT.png").convert("RGBA")
tiny = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 10)

def avatar(path, cx, cy, size, ring, width=2):
    src = Image.open(path).convert("RGBA")
    src.thumbnail((size - 4, size - 4), Image.Resampling.LANCZOS)
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((2, 2, size - 2, size - 2), fill=255)
    layer.alpha_composite(src, ((size - src.width) // 2, (size - src.height) // 2))
    layer.putalpha(mask)
    canvas.alpha_composite(layer, (int(cx - size / 2), int(cy - size / 2)))
    ImageDraw.Draw(canvas).ellipse((cx - size / 2 + 1, cy - size / 2 + 1, cx + size / 2 - 2, cy + size / 2 - 2), outline=ring, width=width)

def avatar_group(cx, cy, paths, size, ring, more=None):
    overlap = 0.30
    step = size * (1 - overlap)
    start = cx - (len(paths) - 1) * step / 2
    for index, path in enumerate(paths):
        avatar(path, start + index * step, cy, size, ring)
    if more is not None:
        ImageDraw.Draw(canvas).text((start + len(paths) * step + 3, cy - 7), f"+{more}", font=tiny, fill="#b5f7e3")

nahida = BASE / "nahida.webp"
furina = BASE / "furina.webp"
kafka = BASE / "kafka.webp"
arlecchino = BASE / "arlecchino.webp"

# C6 density samples in otherwise empty October cells.
# The dates and grid anchors remain untouched; portraits occupy only the lower cell area.
avatar(nahida, 820, 473, 44, "#54e9c8")                       # 07: one large avatar
avatar_group(1020, 545, [nahida, furina], 28, "#ffb777")       # 16: two-person birthday stack
avatar_group(1020, 689, [arlecchino, nahida, kafka], 24, "#54e9c8", more=2)  # 30: 4+ release sample

output = OUT / "revision-01-sumeru-gpt-baseline.png"
canvas.convert("RGB").save(output, quality=96)

# A separate raster callout map makes the changed cells easy to inspect without relying on SVG rendering.
map_image = canvas.copy()
md = ImageDraw.Draw(map_image, "RGBA")
label_font = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 15)
label_small = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 12)

def callout(box, label, target):
    x0, y0, x1, y1 = box
    md.rounded_rectangle(box, radius=8, outline=(240, 201, 138, 245), width=3)
    tx, ty = target
    md.line((x1, y0 + 10, tx, ty), fill=(240, 201, 138, 245), width=2)
    md.rounded_rectangle((x1, y0 - 30, x1 + 190, y0 - 2), radius=6, fill=(21, 21, 38, 235), outline=(240, 201, 138, 245), width=1)
    md.text((x1 + 10, y0 - 25), label, font=label_font, fill=(255, 248, 235, 255))

callout((790, 442, 850, 503), "A1  单角色", (820, 473))
callout((980, 515, 1065, 574), "A2  2–3 角色", (1020, 545))
callout((968, 660, 1088, 718), "A3  4+ / +2", (1020, 689))
md.rounded_rectangle((55, 120, 355, 205), radius=10, fill=(16, 25, 35, 225), outline=(125, 229, 207, 220), width=2)
md.text((75, 140), "本版只新增 C6 头像密度样本", font=label_font, fill=(255, 248, 235, 255))
md.text((75, 170), "L1 / L2 / L3 / T2 / C4 均保持原样", font=label_small, fill=(181, 247, 227, 255))
map_output = OUT / "revision-01-density-callout-map.png"
map_image.convert("RGB").save(map_output, quality=96)

# Side-by-side comparison: original GPT-01 Sumeru on the left, this revision on the right.
original = Image.open(BASE / "02-sumeru-filter-GPT.png").convert("RGB")
revised = Image.open(output).convert("RGB")
compare = Image.new("RGB", (2880, 980), "#0b0d18")
compare.paste(original, (0, 60))
compare.paste(revised, (1440, 60))
cd = ImageDraw.Draw(compare)
head = ImageFont.truetype(r"C:\Windows\Fonts\msyhbd.ttc", 24)
body = ImageFont.truetype(r"C:\Windows\Fonts\msyh.ttc", 15)
cd.text((24, 18), "原始 GPT-01 / 02-sumeru-filter", font=head, fill="#f6f1e9")
cd.text((1464, 18), "Revision 01 / 仅加入 C6 头像密度示意", font=head, fill="#f6f1e9")
cd.line((1440, 0, 1440, 980), fill="#f0c98a", width=3)
cd.text((1464, 930), "保留：L1 光晕 · L2 渐变 · L3 压暗 · S1/C0 圆角与留白 · T2 裸文字导航", font=body, fill="#b5f7e3")
compare_output = OUT / "revision-01-before-after.png"
compare.save(compare_output, quality=94)
print(output)
print(map_output)
print(compare_output)
