#!/usr/bin/env python3
"""Einmalige Umstellung: Seiten mit <section class="hero hero-bg"> (ohne postcard) auf den geteilten Hero.
Das Hintergrundbild wandert als CSS-Variable an die Section, die Klasse hero-split kommt dazu."""
import os, re, sys
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEC = re.compile(r'<section class="hero hero-bg(?P<extra>[^"]*)">\s*<div class="wrap" style="background-image:url\((?P<url>[^)]*)\)(?:;background-position:(?P<pos>[^"]*))?">')
n = 0
for root, dirs, files in os.walk(REPO):
    dirs[:] = [d for d in dirs if d not in (".git", "scripts")]
    for fn in files:
        if fn != "index.html": continue
        p = os.path.join(root, fn)
        s = open(p, encoding="utf-8").read()
        def rep(m):
            if "postcard" in m.group("extra"): return m.group(0)
            pos = m.group("pos") or "center"
            return f'<section class="hero hero-bg hero-split{m.group("extra")}" style="--hero-img:url({m.group("url")});--hero-pos:{pos}">\n  <div class="wrap">'
        t = SEC.sub(rep, s)
        if t != s:
            open(p, "w", encoding="utf-8").write(t); n += 1; print("split:", os.path.relpath(p, REPO))
print(n, "Seiten")
