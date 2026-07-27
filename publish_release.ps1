# ═══════════════════════════════════════════════════════════════════
# Coco AI — 1-Click Global Auto-Release Publisher (PowerShell)
# ═══════════════════════════════════════════════════════════════════
$ErrorActionPreference = 'Stop'

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

# 1. Read current version from package.json
$packageJsonPath = Join-Path $PSScriptRoot "package.json"
if (-not (Test-Path $packageJsonPath)) {
    Write-Error "package.json not found in $PSScriptRoot"
    exit 1
}

$packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
$version = $packageJson.version
$tag = "v$version"

Write-Host "[1/4] Checking version status for package.json ($tag)..." -ForegroundColor Cyan

# Fetch remote tags to ensure no collision
git fetch --tags origin | Out-Null
$remoteTags = git ls-remote --tags origin

if ($remoteTags -match "refs/tags/$tag") {
    Write-Host "Tag $tag already exists on GitHub remote. Auto-bumping patch version..." -ForegroundColor Yellow
    npm version patch --no-git-tag-version | Out-Null
    $packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
    $version = $packageJson.version
    $tag = "v$version"
    Write-Host "New version set to: $tag" -ForegroundColor Green
} else {
    Write-Host "Publishing version: $tag" -ForegroundColor Green
}

# 2. Stage & Commit
Write-Host ""
Write-Host "[2/4] Staging files and creating git commit..." -ForegroundColor Cyan
git add .
try {
    git commit -m "release: $tag - Global auto-update release" | Out-Null
} catch {
    Write-Host "No uncommitted code changes found. Proceeding with release..." -ForegroundColor Yellow
}

# 3. Push main branch
Write-Host ""
Write-Host "[3/4] Pushing main branch to GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Error "git push origin main failed. Aborting release."
    exit 1
}

# 4. Run Electron Builder Release (Handles Tagging + GitHub Release Creation natively)
Write-Host ""
Write-Host "[4/4] Building installer and publishing $tag globally to GitHub Releases..." -ForegroundColor Magenta
npm run release
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run release failed."
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Release $tag published globally!" -ForegroundColor Green
Write-Host "  Auto-updater will now deliver this update to all users." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
