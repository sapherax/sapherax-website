# SapheraX Website

Neuer Seitenaufbau, ersetzt schrittweise die IONOS-Baukasten-Seite. URLs sind identisch zur Live-Seite gehalten (SEO-Kontinuitaet).

## Struktur

* URLs entsprechen exakt der aktuellen Live-Seite (z.B. /einsatzbereiche-1/, /systeme-and-loesungen/, /service/, /unternehmen/, /kontakt/)
* Neu: eigene Zielgruppen-Landingpages unter /einsatzbereiche-1/{gastronomie,hotellerie,handel,pflege,reinigung}/
* Neu: /faq/ mit FAQPage-Structured-Data
* Jede Seite hat Meta-Description, kanonische URL und passende JSON-LD-Daten (Organization, Service, Product oder FAQPage) fuer bessere Lesbarkeit durch Suchmaschinen und KI-Systeme
* robots.txt erlaubt explizit gaengige KI-Crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
* llms.txt fasst die Seitenstruktur fuer KI-Systeme zusammen
* sitemap.xml listet alle Seiten.

## Assets - wo liegt was

* SharePoint (SapheraX/Website-Assets/): Rohdaten - Original-Fotos, Logo-Masterdateien, Druckvorlagen, Rohvideos
* Dieses Repo (assets/): nur finale, web-optimierte Exporte
* YouTube-Kanal (@SapheraX): Produktvideos per Embed

## Alte Seiten

about.html, contact.html, industries.html, services.html, faq.html, impressum.html, datenschutz.html sind als Weiterleitungen auf die neuen URLs stehen geblieben (kein toter Link, falls irgendwo verlinkt).

## Offene Punkte vor Go-Live

* Bilder sind noch von der bestehenden IONOS-Seite verlinkt (muessen lokal/optimiert eingebunden werden)
* Kontaktformular ohne Funktion (Formular-Service noetig)
* Rechtstexte (AGB, Impressum, Datenschutz, Bildnachweise) sind Platzhalter
* Mehrsprachigkeit (EN) noch nicht umgesetzt

