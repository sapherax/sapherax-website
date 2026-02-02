# Basisverzeichnis (bitte anpassen, falls nötig)
$basePath = "C:\Users\jbarg\OneDrive\SapheraX\02 Präsentation\website\sapherax-website"

# Ordnerstruktur anlegen
New-Item -ItemType Directory -Force -Path "$basePath\src"
New-Item -ItemType Directory -Force -Path "$basePath\src\assets"
New-Item -ItemType Directory -Force -Path "$basePath\src\assets\images"
New-Item -ItemType Directory -Force -Path "$basePath\src\assets\fonts"
New-Item -ItemType Directory -Force -Path "$basePath\src\assets\icons"
New-Item -ItemType Directory -Force -Path "$basePath\src\css"
New-Item -ItemType Directory -Force -Path "$basePath\src\js"
New-Item -ItemType Directory -Force -Path "$basePath\src\components"
New-Item -ItemType Directory -Force -Path "$basePath\public"

# index.html erzeugen
$indexContent = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SapheraX Systems GmbH</title>
</head>
<body>
    <h1>Willkommen bei SapheraX Systems</h1>
    <p>Die Website wird aktuell aufgebaut.</p>
</body>
</html>
"@

Set-Content -Path "$basePath\public\index.html" -Value $indexContent -Encoding UTF8

# README.md erzeugen
$readmeContent = @"
# SapheraX Website

Dieses Repository enthält die Website-Struktur für die SapheraX Systems GmbH.

## Struktur

- **src/** – Quellcode
  - **assets/** – Bilder, Icons, Fonts
  - **css/** – Stylesheets
  - **js/** – JavaScript
  - **components/** – wiederverwendbare HTML-Bausteine
- **public/** – Ausgelieferte Dateien (Startpunkt: index.html)

## Hinweise

Die Website wird mit GitHub Pages getestet und später auf IONOS deployed.
"@

Set-Content -Path "$basePath\README.md" -Value $readmeContent -Encoding UTF8

Write-Host "Struktur erfolgreich erstellt."
