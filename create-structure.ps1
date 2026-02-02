# SapheraX Website Struktur Generator

$root = "."  # aktueller Ordner

# Ordnerstruktur
$folders = @(
    "$root/assets",
    "$root/assets/css",
    "$root/assets/js",
    "$root/assets/content"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder | Out-Null
    }
}

# HTML-Dateien
$htmlFiles = @(
    "index.html",
    "about.html",
    "services.html",
    "industries.html",
    "faq.html",
    "contact.html",
    "impressum.html",
    "datenschutz.html"
)

foreach ($file in $htmlFiles) {
    if (-not (Test-Path "$root/$file")) {
        New-Item -ItemType File -Path "$root/$file" | Out-Null
    }
}

# CSS & JS
if (-not (Test-Path "$root/assets/css/style.css")) {
    New-Item -ItemType File -Path "$root/assets/css/style.css" | Out-Null
}

if (-not (Test-Path "$root/assets/js/main.js")) {
    New-Item -ItemType File -Path "$root/assets/js/main.js" | Out-Null
}

# Content-Dateien mit Textbasis
$content = @{
    "startseite.md" = @"
$(Get-Content "02_Startseite_Textbasis.md" -Raw)
"@

    "ueber-sapherax.md" = @"
$(Get-Content "03_Ueber_mich_SapheraX.md" -Raw)
"@

    "branchen.md" = @"
$(Get-Content "01_Website_Struktur.md" -Raw)
"@

    "faq.md" = @"
$(Get-Content "08_FAQ_Textbasis.md" -Raw)
"@
}

foreach ($entry in $content.GetEnumerator()) {
    $path = "$root/assets/content/$($entry.Key)"
    if (-not (Test-Path $path)) {
        $entry.Value | Out-File -FilePath $path -Encoding UTF8
    }
}
