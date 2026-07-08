#!/usr/bin/env python3
"""
Single-source-of-truth generator for the site-wide header and footer.

Problem this solves: header/footer markup used to be hand-copied into every
index.html file. That meant 30+ near-identical copies that could (and did)
drift apart or get corrupted independently.

How it works: this script owns the ONE canonical HEADER_TMPL / FOOTER_TMPL
below. It walks every index.html in the repo, works out how many directory
levels deep the file is (to get the right "../" prefix) and which top-level
section it belongs to (to highlight the right nav item), and replaces
whatever currently sits between <header class="site"> ... </header> and
<footer class="site"> ... </footer> with a freshly rendered copy.

Usage:
    python3 scripts/build.py            # rewrite all pages in place
    python3 scripts/build.py --check    # exit 1 if anything would change (CI)

To change the header or footer site-wide: edit HEADER_TMPL / FOOTER_TMPL
below, then run this script once. Do NOT hand-edit <header>/<footer> blocks
inside individual index.html files - they will be overwritten on the next run.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Top-level directory -> nav item that should get class="active"
ACTIVE_MAP = {
    "einsatzbereiche-1": "einsatzbereiche",
    "systeme-and-loesungen": "systeme",
    "service": "service",
    "roi-rechner": "roi-rechner",
    "faq": "faq",
    "unternehmen": "unternehmen",
    "kontakt": "unternehmen",  # Kontakt lives under the Unternehmen dropdown now
}

# Product pages that additionally need the image-gallery script
GALLERY_SLUGS = {
    "dinerbot-t10", "dinerbot-t11", "dinerbot-t9", "dinerbot-t9-pro",
    "kleenbot-c30", "kleenbot-c40", "butlerbot-w3",
    "transportroboter-s100", "transportroboter-s300",
}

SOCIAL_LINKS = (
    '<div class="social-links">'
    '<a href="https://www.facebook.com/profile.php?id=61578538902775" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z"/></svg></a>'
    '<a href="https://www.instagram.com/sapherax/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.07 4.849-.07Zm0 2.16c-3.15 0-3.499.012-4.733.068-2.104.096-3.008 1.003-3.104 3.103-.056 1.234-.067 1.583-.067 4.734 0 3.152.011 3.5.067 4.734.096 2.099 1 3.007 3.104 3.103 1.234.057 1.583.068 4.733.068 3.152 0 3.5-.011 4.734-.068 2.1-.096 3.007-1.003 3.104-3.103.056-1.234.068-1.582.068-4.734 0-3.15-.012-3.5-.068-4.734-.097-2.098-1.003-3.007-3.104-3.103-1.234-.056-1.582-.068-4.734-.068ZM12 6.865a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27Zm0 2.163a2.972 2.972 0 1 0 0 5.944 2.972 2.972 0 0 0 0-5.944Zm5.406-2.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/></svg></a>'
    '<a href="https://www.linkedin.com/company/sapherax-systems-gmbh/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.452 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.137 1.447-2.137 2.94v5.666H9.355V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126ZM7.114 20.452H3.558V9h3.556v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg></a>'
    '<a href="https://www.youtube.com/@SapheraX/" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg></a>'
    '</div>'
)


def header_html(rel, active):
    def cls(key):
        return ' class="active"' if active == key else ""

    return (
        '<header class="site">\n'
        '  <div class="wrap">\n'
        f'    <a href="{rel}index.html" class="logo logo-mark"><img src="{rel}assets/img/logo/icon-96.png" alt="" class="logo-icon"><img src="{rel}assets/img/logo/wordmark.svg" alt="SapheraX" class="logo-word"></a>\n'
        '<button class="nav-toggle" aria-label="Menü öffnen" onclick="document.querySelector(\'nav.main\').classList.toggle(\'open\')">&#9776;</button>\n'
        '    <nav class="main">\n'
        f'      <div class="has-submenu"><a href="{rel}einsatzbereiche-1/index.html"{cls("einsatzbereiche")}>Einsatzbereiche</a><div class="submenu"><a href="{rel}einsatzbereiche-1/gastronomie/index.html">Gastronomie</a><a href="{rel}einsatzbereiche-1/hotellerie/index.html">Hospitality / Hotels</a><a href="{rel}einsatzbereiche-1/handel/index.html">Handel &amp; Marketing</a><a href="{rel}einsatzbereiche-1/pflege/index.html">Pflege &amp; Betreuung</a><a href="{rel}einsatzbereiche-1/reinigung/index.html">Reinigung &amp; Hygiene</a><a href="{rel}einsatzbereiche-1/transportieren/index.html">Transport &amp; Logistik</a></div></div>\n'
        f'      <div class="has-submenu"><a href="{rel}systeme-and-loesungen/index.html"{cls("systeme")}>Systeme &amp; Lösungen</a><div class="submenu"><a href="{rel}systeme-and-loesungen/dinerbot-t10/index.html">DINERBOT T10</a><a href="{rel}systeme-and-loesungen/dinerbot-t11/index.html">DINERBOT T11</a><a href="{rel}systeme-and-loesungen/dinerbot-t9/index.html">DINERBOT T9</a><a href="{rel}systeme-and-loesungen/dinerbot-t9-pro/index.html">DINERBOT T9 Pro</a><a href="{rel}systeme-and-loesungen/kleenbot-c30/index.html">KLEENBOT C30</a><a href="{rel}systeme-and-loesungen/kleenbot-c40/index.html">KLEENBOT C40</a><a href="{rel}systeme-and-loesungen/butlerbot-w3/index.html">BUTLERBOT W3</a><a href="{rel}systeme-and-loesungen/transportroboter-s100/index.html">Transportroboter S100</a><a href="{rel}systeme-and-loesungen/transportroboter-s300/index.html">Transportroboter S300</a></div></div>\n'
        f'      <a href="{rel}service/index.html"{cls("service")}>Leistungen</a>\n'
        f'      <a href="{rel}roi-rechner/index.html"{cls("roi-rechner")}>ROI-Rechner</a>\n'
        f'      <a href="{rel}faq/index.html"{cls("faq")}>FAQ</a>\n'
        f'      <div class="has-submenu"><a href="{rel}unternehmen/index.html"{cls("unternehmen")}>Unternehmen</a><div class="submenu"><a href="{rel}unternehmen/ansprechpartner/index.html">Ansprechpartner</a><a href="{rel}unternehmen/jobs/index.html">Jobs</a><a href="{rel}kontakt/index.html">Kontakt</a></div></div>\n'
        '    </nav>\n'
        f'    <a href="{rel}kontakt/termin/index.html" class="btn btn-primary">Beratung anfragen</a>\n'
        '  </div>\n'
        '</header>'
    )


def footer_html(rel):
    return (
        '<footer class="site">\n'
        '  <div class="wrap">\n'
        '    <div>\n'
        f'      <div class="logo logo-mark"><img src="{rel}assets/img/logo/icon-96.png" alt="" class="logo-icon"><span class="logo-text">SapheraX</span></div>\n'
        '      <p style="max-width:280px;font-size:13px;margin-top:10px;opacity:.85">KEENON-Systempartner für Servicerobotik, Reinigungsrobotik und Transportrobotik in Rheinland-Pfalz, Hessen und NRW.</p>\n'
        '    </div>\n'
        '    <div>\n'
        '      <div style="font-weight:600;color:#fff;margin-bottom:10px;font-size:13px">Kontakt</div>\n'
        '      <p>info@sapherax.com</p>\n'
        '      <p>Showroom an der A3, Westerwald</p>\n'
        '    </div>\n'
        '    <div>\n'
        '      <div style="font-weight:600;color:#fff;margin-bottom:10px;font-size:13px">Folgen</div>\n'
        f'      {SOCIAL_LINKS}\n'
        '    </div>\n'
        '  </div>\n'
        '  <div class="wrap legal">\n'
        '    <span>&copy; 2026 SapheraX Systems GmbH</span>\n'
        f'    <a href="{rel}kontakt/agb/index.html">AGB</a><a href="{rel}kontakt/impressum/index.html">Impressum</a><a href="{rel}kontakt/datenschutz/index.html">Datenschutz</a><a href="{rel}kontakt/bild-und-medienachweis/index.html">Bild- und Mediennachweise</a>\n'
        '  </div>\n'
        '</footer>'
    )


def scripts_html(rel, slug):
    lines = []
    if slug in GALLERY_SLUGS:
        lines.append(f'<script src="{rel}assets/js/gallery.js" defer></script>')
    lines.append(f'<script src="{rel}assets/js/consent.js" defer></script>')
    return "\n".join(lines)


HEADER_RE = re.compile(r'<header class="site">.*?</header>', re.DOTALL)
FOOTER_RE = re.compile(r'<footer class="site">.*?</footer>', re.DOTALL)
SCRIPTS_RE = re.compile(
    r'(?:<script src="(?:\.\./)*assets/js/gallery\.js"[^>]*></script>\s*)?'
    r'<script src="(?:\.\./)*assets/js/consent\.js"[^>]*></script>'
)
# Prototype banner shown while the new site was being built alongside the old
# IONOS site. Not needed once this version replaces IONOS - stripped site-wide.
PROTO_BANNER_RE = re.compile(r'[ \t]*<div class="proto-banner">.*?</div>\n?', re.DOTALL)


def process(path, check_only):
    rel_path = os.path.relpath(path, REPO)
    parts = rel_path.split(os.sep)
    depth = len(parts) - 1  # index.html itself doesn't count
    rel = "../" * depth
    top = parts[0] if depth >= 1 else None
    active = "home" if depth == 0 else ACTIVE_MAP.get(top)
    slug = parts[-2] if len(parts) >= 2 else None

    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    content, n_header = HEADER_RE.subn(lambda m: header_html(rel, active), content, count=1)
    content, n_footer = FOOTER_RE.subn(lambda m: footer_html(rel), content, count=1)
    if n_header and n_footer:
        content, n_scripts = SCRIPTS_RE.subn(lambda m: scripts_html(rel, slug), content, count=1)
    content = PROTO_BANNER_RE.sub("", content)

    if content != original:
        if check_only:
            print(f"WOULD UPDATE: {rel_path}")
            return True
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"updated: {rel_path}")
        return True
    return False


def main():
    check_only = "--check" in sys.argv
    changed = False
    for root, dirs, files in os.walk(REPO):
        if os.sep + ".git" in root + os.sep:
            continue
        dirs[:] = [d for d in dirs if d not in (".git", "scripts")]
        for fn in files:
            if fn != "index.html":
                continue
            path = os.path.join(root, fn)
            if process(path, check_only):
                changed = True
    if check_only and changed:
        print("Header/footer out of sync with template - run scripts/build.py")
        sys.exit(1)
    print("Done." if not check_only else "All pages match the template.")


if __name__ == "__main__":
    main()
