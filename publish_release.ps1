# ═══════════════════════════════════════════════════════════════════
# Coco AI — 1-Click Global Auto-Release Publisher (PowerShell v3.0)
# ═══════════════════════════════════════════════════════════════════
$ErrorActionPreference = 'Stop'
$env:GIT_REDIRECT_STDERR = '2>&1'

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   COCO AI -- 1-CLICK GLOBAL RELEASE PUBLISHER" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 0. Load GH_TOKEN from .env file
$envFilePath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFilePath) {
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            if ($key -eq "GH_TOKEN") {
                $env:GH_TOKEN = $val
            }
        }
    }
}

if (-not $env:GH_TOKEN) {
    Write-Error "GH_TOKEN not found in environment or .env file. Release cannot proceed."
    exit 1
}

# 1. Fetch ALL tags from GitHub remote
Write-Host "[1/6] Syncing tags with GitHub remote..." -ForegroundColor Cyan
git fetch --tags --force origin 2>&1 | Out-Null
$allTags = git tag -l

# Read current version from package.json
$packageJsonPath = Join-Path $PSScriptRoot "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "package.json not found in $PSScriptRoot"
    exit 1
}

$packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
$version = $packageJson.version
$tag = "v$version"

# Auto-bump version until we hit a clean, unused tag
while ($allTags -contains $tag) {
    Write-Host "Tag $tag already exists in git history. Auto-bumping patch version..." -ForegroundColor Yellow
    npm version patch --no-git-tag-version | Out-Null
    $packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
    $version = $packageJson.version
    $tag = "v$version"
}

Write-Host "Target Release Version: $tag" -ForegroundColor Green

# 2. Stage & Commit
Write-Host ""
Write-Host "[2/6] Staging files and creating git commit..." -ForegroundColor Cyan
git add . 2>&1 | Out-Null
git commit -m "release: $tag - Global auto-update release" 2>&1 | Out-Null

# 3. Create Local Tag
Write-Host ""
Write-Host "[3/6] Tagging release $tag locally..." -ForegroundColor Cyan
git tag -a $tag -m "Release $tag" 2>&1 | Out-Null

# 4. Push Main and Tag to GitHub
Write-Host ""
Write-Host "[4/6] Pushing main branch and tag $tag to GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "git push origin main failed. Aborting release."
    exit 1
}

git push origin $tag
if ($LASTEXITCODE -ne 0) {
    Write-Error "git push origin $tag failed. Aborting release."
    exit 1
}

# 5. Build Package Locally (no publish flag)
Write-Host ""
Write-Host "[5/6] Building Electron installer package locally..." -ForegroundColor Magenta
npx electron-builder --publish never
if ($LASTEXITCODE -ne 0) {
    Write-Error "electron-builder build failed."
    exit 1
}

# 6. Publish Assets to GitHub Releases via REST API
Write-Host ""
Write-Host "[6/6] Publishing release $tag to GitHub Releases..." -ForegroundColor Magenta

$headers = @{
    "Authorization" = "token $env:GH_TOKEN"
    "Accept"        = "application/vnd.github+json"
}

# Check if Release already exists for tag
$releaseUrl = "https://api.github.com/repos/Hey-Astreon/COCO-AI/releases/tags/$tag"
$release = $null

try {
    $release = Invoke-RestMethod -Uri $releaseUrl -Headers $headers -Method Get
    Write-Host "Found existing release for $tag." -ForegroundColor Yellow
} catch {
    # Create Release
    Write-Host "Creating new GitHub release for $tag..." -ForegroundColor Cyan
    $createUrl = "https://api.github.com/repos/Hey-Astreon/COCO-AI/releases"
    $body = @{
        tag_name   = $tag
        name       = "Release $tag"
        body       = "Coco AI Release $tag - Automatic Build"
        draft      = $false
        prerelease = $false
    } | ConvertTo-Json

    $release = Invoke-RestMethod -Uri $createUrl -Headers $headers -Method Post -Body $body
}

$uploadUrlBase = $release.upload_url -replace '\{\?name,label\}', ''

# Define files to upload
$distDir = Join-Path $PSScriptRoot "dist"
$installerFile = Join-Path $distDir "CocoAI_Installer_${tag}.exe"
$blockmapFile  = Join-Path $distDir "CocoAI_Installer_${tag}.exe.blockmap"
$latestYmlFile = Join-Path $distDir "latest.yml"

$filesToUpload = @(
    @{ Path = $installerFile; Name = "CocoAI_Installer_${tag}.exe"; ContentType = "application/octet-stream" },
    @{ Path = $blockmapFile;  Name = "CocoAI_Installer_${tag}.exe.blockmap"; ContentType = "application/octet-stream" },
    @{ Path = $latestYmlFile;  Name = "latest.yml"; ContentType = "text/yaml" }
)

foreach ($file in $filesToUpload) {
    if (Test-Path $file.Path) {
        Write-Host "Uploading $($file.Name)..." -ForegroundColor Cyan
        $uploadUrl = "${uploadUrlBase}?name=$($file.Name)"
        $bytes = [System.IO.File]::ReadAllBytes($file.Path)
        
        $uploadHeaders = @{
            "Authorization" = "token $env:GH_TOKEN"
            "Content-Type"  = $file.ContentType
        }

        try {
            $response = Invoke-RestMethod -Uri $uploadUrl -Headers $uploadHeaders -Method Post -Body $bytes
            Write-Host "Uploaded $($file.Name) successfully!" -ForegroundColor Green
        } catch {
            Write-Host "Asset $($file.Name) already attached or upload warning: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Warning: File $($file.Path) not found!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Release $tag published globally!" -ForegroundColor Green
Write-Host "  Auto-updater will now deliver this update to all users." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
