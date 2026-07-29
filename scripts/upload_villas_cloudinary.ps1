# ============================================================
#  UPLOAD 3 BEST PHOTOS per Villa -> Cloudinary
#  Then generate SQL UPDATE statements with real URLs
#  Usage: powershell -ExecutionPolicy Bypass -File scripts\upload_villas_cloudinary.ps1
# ============================================================

# Fix SSL/TLS issue on Windows PowerShell 5
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Net.Http

$CLOUD_NAME    = "dorxkrf4i"
$UPLOAD_PRESET = "live in marrakech"
$UPLOAD_URL    = "https://api.cloudinary.com/v1_1/$CLOUD_NAME/image/upload"
$BIENS_DIR     = "$PSScriptRoot\..\BIENS"
$OUTPUT_SQL    = "$PSScriptRoot\..\supabase\migrations\update_villas_photos.sql"

function Upload-Photo {
    param([string]$FilePath, [string]$Folder)

    $fileName = [System.IO.Path]::GetFileName($FilePath)
    Write-Host "  -> Uploading: $fileName" -ForegroundColor Cyan

    # Use curl.exe (built-in on Windows 10+) for reliable HTTPS/SSL support
    $result = & curl.exe -s `
        -F "upload_preset=$UPLOAD_PRESET" `
        -F "folder=villas/$Folder" `
        -F "file=@`"$FilePath`"" `
        "$UPLOAD_URL"

    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrEmpty($result)) {
        Write-Host "  ERREUR: curl failed for $fileName" -ForegroundColor Red
        return $null
    }

    try {
        $json = $result | ConvertFrom-Json
        if ($json.secure_url) {
            return $json.secure_url
        } else {
            Write-Host "  ERREUR: No URL in response: $result" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "  ERREUR: Could not parse response: $result" -ForegroundColor Red
        return $null
    }
}

function Get-BestPhotos {
    param([string]$FolderPath, [int]$Count = 3)

    $allPhotos = @()
    foreach ($ext in @("*.jpg", "*.jpeg", "*.png", "*.webp", "*.avif")) {
        $allPhotos += Get-ChildItem -Path $FolderPath -Filter $ext -File -ErrorAction SilentlyContinue
    }
    if ($allPhotos.Count -eq 0) { return @() }

    # Score photos by name keywords (facade, piscine, salon, jardin = best shots)
    $priority = @("facade", "piscine", "salon", "jardin", "vue", "exterieur", "principale", "pool", "garden", "exterior")

    $scored = $allPhotos | ForEach-Object {
        $name  = $_.Name.ToLower()
        $score = 0
        foreach ($p in $priority) { if ($name -like "*$p*") { $score += 10 } }
        # Prefer larger files (better quality)
        $score += [math]::Min(10, [math]::Floor($_.Length / 50000))
        [PSCustomObject]@{ File = $_; Score = $score }
    } | Sort-Object Score -Descending

    return ($scored | Select-Object -First $Count).File
}

# ─── Villa definitions ────────────────────────────────────────────────────────
$villas = @(
    @{ Ref = "DP-26-VILLA1";  Titre = "Villa Douar Ra9";               Folder = "Villa douar ra9 25k";           SubDir = "villa oss sghira" },
    @{ Ref = "DP-26-VILLA2";  Titre = "Villa Chakip";                  Folder = "villas chakip";                  SubDir = "" },
    @{ Ref = "DP-26-VILLA3";  Titre = "Villa Swigya Karim";            Folder = "villa kar im 30 k";             SubDir = "" },
    @{ Ref = "DP-26-VILLA4";  Titre = "Villa Plain-Pied Appel Garden"; Folder = "villa 2 appel garden 20 k";     SubDir = "" },
    @{ Ref = "DP-26-VILLA5";  Titre = "Villa Sidi Rahal";              Folder = "villa sidi rahal 20 k";         SubDir = "" },
    @{ Ref = "DP-26-VILLA6";  Titre = "Villa Moderne 21 Garden";       Folder = "villa 21 lghizioui";            SubDir = "" },
    @{ Ref = "DP-26-VILLA7";  Titre = "Villa Zineb Appel Garden";      Folder = "villa zineb appel garden";      SubDir = "" },
    @{ Ref = "DP-26-VILLA8";  Titre = "Villa Amelkis";                 Folder = "amelkis villa";                 SubDir = "" },
    @{ Ref = "DP-26-VILLA9";  Titre = "Villa Luxe Dipo";               Folder = "VILLA 45 K dipo";              SubDir = "" },
    @{ Ref = "DP-26-VILLA10"; Titre = "Villa Palmeraie";               Folder = "villa palemeraie";              SubDir = "" },
    @{ Ref = "DP-26-VILLA11"; Titre = "Villa Hmoude";                  Folder = "villa hmoude 2";                SubDir = "" },
    @{ Ref = "DP-26-VILLA12"; Titre = "Villa 26 Appel Garden";         Folder = "villa 26 appel garden";        SubDir = "" },
    @{ Ref = "DP-26-VILLA13"; Titre = "Villa Bensilam";                Folder = "villa bensilam";                SubDir = "" },
    @{ Ref = "DP-26-MAISON1"; Titre = "Maison Traditionnelle Ennakhil"; Folder = "maison cha3bi";               SubDir = "" }
)

# ─── Main loop ────────────────────────────────────────────────────────────────
$sqlLines = @()
$sqlLines += "-- ============================================================"
$sqlLines += "-- UPDATE VILLAS PHOTOS - Marrakech Opus"
$sqlLines += "-- Generated automatically with Cloudinary"
$sqlLines += "-- Run this SQL in the Supabase SQL Editor after inserting rows"
$sqlLines += "-- ============================================================"
$sqlLines += ""

foreach ($v in $villas) {
    Write-Host ""
    Write-Host "[$($v.Ref)] $($v.Titre)" -ForegroundColor Yellow

    $folderPath = Join-Path $BIENS_DIR $v.Folder
    if ($v.SubDir -ne "") {
        $subPath = Join-Path $folderPath $v.SubDir
        if (Test-Path $subPath) { $folderPath = $subPath }
    }

    if (-not (Test-Path $folderPath)) {
        Write-Host "  ERREUR: Dossier introuvable -> $folderPath" -ForegroundColor Red
        continue
    }

    $photos = Get-BestPhotos -FolderPath $folderPath -Count 3

    if ($photos.Count -eq 0) {
        Write-Host "  ERREUR: Aucune photo trouvee dans $folderPath" -ForegroundColor Red
        continue
    }

    Write-Host "  Photos choisies:" -ForegroundColor Gray
    foreach ($p in $photos) { Write-Host "    - $($p.Name) ($([math]::Round($p.Length/1024))KB)" -ForegroundColor Gray }

    $urls = @()
    $cloudFolder = ($v.Folder -replace " ", "_") -replace "[^a-zA-Z0-9_-]", ""

    foreach ($photo in $photos) {
        $url = Upload-Photo -FilePath $photo.FullName -Folder $cloudFolder
        if ($url) {
            $urls += $url
            Write-Host "  OK: $url" -ForegroundColor Green
        }
    }

    if ($urls.Count -eq 0) {
        Write-Host "  ERREUR: Aucune photo uploadee" -ForegroundColor Red
        continue
    }

    # Build PostgreSQL array literal
    $pgArray   = "ARRAY[" + (($urls | ForEach-Object { "'" + $_ + "'" }) -join ", ") + "]"
    $mainPhoto = "'" + $urls[0] + "'"

    $sqlLines += "-- $($v.Titre)"
    $sqlLines += "UPDATE public.properties_v2"
    $sqlLines += "SET photos = $pgArray, photo_principale = $mainPhoto"
    $sqlLines += "WHERE reference = '$($v.Ref)';"
    $sqlLines += ""
}

Set-Content -Path $OUTPUT_SQL -Value ($sqlLines -join "`n") -Encoding UTF8

Write-Host ""
Write-Host "DONE! SQL file: $OUTPUT_SQL" -ForegroundColor Green
Write-Host "  -> Paste this SQL in the Supabase SQL Editor and execute it." -ForegroundColor Green
