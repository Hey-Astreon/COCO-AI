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

Write-Host "[1/5] Checking version status for package.json ($tag)..." -ForegroundColor Cyan

# Check if tag already exists in git
$existingTags = git tag
if ($existingTags -contains $tag) {
    Write-Host "Tag $tag already exists in git history. Auto-bumping patch version..." -ForegroundColor Yellow
    npm version patch --no-git-tag-version | Out-Null
    $packageJson = Get-Content -Raw -Path $packageJsonPath | ConvertFrom-Json
    $version = $packageJson.version
    $tag = "v$version"
    Write-Host "New version set to: $tag" -ForegroundColor Green
} else {
    Write-Host "Publishing existing package.json version: $tag" -ForegroundColor Green
}

# 2. Stage & Commit
Write-Host ""
Write-Host "[2/5] Staging files and creating git commit..." -ForegroundColor Cyan
git add .
try {
    git commit -m "release: $tag - Global auto-update release" | Out-Null
} catch {
    Write-Host "No uncommitted code changes found. Proceeding with release..." -ForegroundColor Yellow
}

# 3. Create Tag
Write-Host ""
Write-Host "[3/5] Tagging release $tag..." -ForegroundColor Cyan
git tag -a $tag -m "Release $tag"

# 4. Push main & tag
Write-Host ""
Write-Host "[4/5] Pushing main branch and tag $tag to GitHub..." -ForegroundColor Cyan
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

# 5. Run Release
Write-Host ""
Write-Host "[5/5] Building installer and publishing $tag globally to GitHub Releases..." -ForegroundColor Magenta
npm run release

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Release $tag published globally!" -ForegroundColor Green
Write-Host "  Auto-updater will now deliver this update to all users." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
