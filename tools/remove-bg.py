"""チェッカー柄（透明表現の市松模様）が焼き込まれたキャラクター画像を透過PNGにする。

使い方:
    python tools/remove-bg.py <入力画像> <出力PNG> [--size 320]

処理:
  1. 外周から塗りつぶし（BFS）で「明るい無彩色」(市松の白/灰) を背景と判定し透明化
  2. 背景に接する JPEG のにじみ（明るい無彩色）を数回だけ追加で透明化
  3. 不透明部分のバウンディングボックスで切り抜き、元画像の長辺=size となる共通倍率で縮小保存
"""
import sys
from collections import deque

from PIL import Image


def is_bg(rgb, bright=196, chroma=26):
    r, g, b = rgb[:3]
    return min(r, g, b) >= bright and (max(r, g, b) - min(r, g, b)) <= chroma


def remove_bg(src, dst, size=320):
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(px[x, y]):
            seen[i] = 2  # 前景の境界
            continue
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))

    # にじみ除去：透明に接する明るい無彩色を少しだけ削る
    for _ in range(3):
        kill = []
        for y in range(1, h - 1):
            for x in range(1, w - 1):
                p = px[x, y]
                if p[3] == 0 or not is_bg(p, bright=170, chroma=40):
                    continue
                if any(px[nx, ny][3] == 0 for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))):
                    kill.append((x, y))
        for x, y in kill:
            px[x, y] = (0, 0, 0, 0)

    bbox = im.getbbox()
    # 元画像の長辺を size に合わせる倍率（立ち絵・移動絵で同じ倍率にするため、切り抜き前のサイズ基準）
    scale = size / max(w, h)
    im = im.crop(bbox)
    nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    # 半透明ふちを二値化してドット絵らしく
    px = im.load()
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255 if a >= 128 else 0)
    im.save(dst)
    print(f"{src} -> {dst} bbox={bbox} size={im.size}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    size = 320
    if "--size" in sys.argv:
        size = int(sys.argv[sys.argv.index("--size") + 1])
        args = [a for a in args if a != str(size)]
    if len(args) != 2:
        print(__doc__)
        sys.exit(1)
    remove_bg(args[0], args[1], size)
