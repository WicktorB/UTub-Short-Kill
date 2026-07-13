#!/usr/bin/env python3
"""Génère les icônes de l'extension (PNG) sans dépendance externe.

Motif : panneau d'interdiction rouge barrant un triangle « play »,
sur un fond sombre à coins arrondis. Rends icons/icon-48.png et icon-128.png.
"""
import math
import os
import struct
import zlib

BG = (24, 24, 27, 255)      # #18181b
RED = (239, 68, 68, 255)    # #ef4444
WHITE = (244, 244, 245, 255)
CLEAR = (0, 0, 0, 0)


def blend(dst, src):
    """Alpha-compositing simple de src au-dessus de dst."""
    sa = src[3] / 255.0
    da = dst[3] / 255.0
    out_a = sa + da * (1 - sa)
    if out_a == 0:
        return (0, 0, 0, 0)
    out = []
    for i in range(3):
        c = (src[i] * sa + dst[i] * da * (1 - sa)) / out_a
        out.append(int(round(c)))
    out.append(int(round(out_a * 255)))
    return tuple(out)


def in_rounded_rect(x, y, n, radius):
    r = radius
    if r <= x <= n - 1 - r or r <= y <= n - 1 - r:
        return 0 <= x <= n - 1 and 0 <= y <= n - 1
    cx = r if x < r else n - 1 - r
    cy = r if y < r else n - 1 - r
    return math.hypot(x - cx, y - cy) <= r


def point_in_triangle(px, py, a, b, c):
    def sign(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])

    d1 = sign((px, py), a, b)
    d2 = sign((px, py), b, c)
    d3 = sign((px, py), c, a)
    has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    return not (has_neg and has_pos)


def render(n):
    cx = cy = (n - 1) / 2.0
    corner = 0.20 * n
    ro = 0.40 * n          # rayon extérieur de l'anneau
    ri = ro - 0.095 * n    # rayon intérieur de l'anneau
    slash_half = 0.05 * n  # demi-épaisseur de la barre

    # Triangle « play »
    w = 0.28 * n
    h = 0.34 * n
    tx = cx - 0.02 * n
    a = (tx - w / 2, cy - h / 2)
    b = (tx - w / 2, cy + h / 2)
    c = (tx + w / 2, cy)

    # Direction de la barre (haut-gauche -> bas-droite)
    dx, dy = math.cos(math.pi / 4), math.sin(math.pi / 4)

    pixels = []
    for y in range(n):
        for x in range(n):
            px, py = x + 0.5, y + 0.5
            col = CLEAR

            if in_rounded_rect(px, py, n, corner):
                col = BG

                # Triangle play (blanc)
                if point_in_triangle(px, py, a, b, c):
                    col = blend(col, WHITE)

                dist = math.hypot(px - cx, py - cy)

                # Anneau rouge
                if ri <= dist <= ro:
                    col = blend(col, RED)

                # Barre diagonale rouge (dans le disque)
                perp = abs((px - cx) * (-dy) + (py - cy) * dx)
                if perp <= slash_half and dist <= ro:
                    col = blend(col, RED)

            pixels.append(col)
    return pixels


def write_png(path, n, pixels):
    raw = bytearray()
    for y in range(n):
        raw.append(0)  # filtre "none"
        for x in range(n):
            raw.extend(pixels[y * n + x])

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        c += struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        return c

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", n, n, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


def main():
    out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")
    os.makedirs(out, exist_ok=True)
    for n in (48, 128):
        write_png(os.path.join(out, "icon-%d.png" % n), n, render(n))
        print("écrit icons/icon-%d.png" % n)


if __name__ == "__main__":
    main()
