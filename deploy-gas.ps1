# GAS Deployment Script

# 1. Vite Build
Write-Host "Starting Vite build..." -ForegroundColor Cyan
npm run build:local

# 2. Prepare Directory
Write-Host "Preparing deployment directory..." -ForegroundColor Cyan
if (Test-Path "dist-gas") {
    Remove-Item -Recurse -Force "dist-gas"
}
New-Item -ItemType Directory -Path "dist-gas"

# 3. Copy Files
Write-Host "Copying files..." -ForegroundColor Cyan
Copy-Item "dist-local\index.html" "dist-gas\index.html"
Copy-Item "GAS\*.gs" "dist-gas\"
Copy-Item "appsscript.json" "dist-gas\"

# 4. Clasp Push
Write-Host "Pushing to GAS..." -ForegroundColor Cyan
npx -y @google/clasp push -f

Write-Host "Done!" -ForegroundColor Green
