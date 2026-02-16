$gh = "C:\Program Files\GitHub CLI\gh.exe"
$SourceRepo = "sasha-thecornerspore-dev/Brenner_Schatz"
$DestRepo = "sasha-thecornerspore-dev/LegalMind-Release"

Write-Host "Fetching workflow runs..."
# Get JSON directly
$json = & $gh run list --workflow release.yml --repo $SourceRepo --limit 5 --json "databaseId,conclusion,status"

if (-not $json) {
    Write-Error "Failed to fetch runs."
    exit 1
}

# Parse JSON in PowerShell
$runs = $json | ConvertFrom-Json

# Find latest success
$latestRun = $runs | Where-Object { $_.conclusion -eq "success" } | Select-Object -First 1

if (-not $latestRun) {
    Write-Error "No successful run found in the last 5 runs."
    exit 1
}

$runId = $latestRun.databaseId
Write-Host "Found successful Run ID: $runId"

Write-Host "Downloading artifacts..."
if (Test-Path temp_artifacts) { Remove-Item -Recurse -Force temp_artifacts }
New-Item -ItemType Directory -Force temp_artifacts | Out-Null

# Download artifacts
& $gh run download $runId --repo $SourceRepo --pattern "LegalMind-*" --dir temp_artifacts

# Find executable files
$releaseFiles = Get-ChildItem temp_artifacts -Recurse | Where-Object { $_.Name -like "*.exe" -or $_.Name -like "*.dmg" }

if ($releaseFiles.Count -eq 0) {
    Write-Error "No .exe or .dmg files found in artifacts. (Did the build finish?)"
    exit 1
}

Write-Host "Found files to upload:"
$releaseFiles.Name

# Get version from package.json
$pkg = Get-Content package.json | ConvertFrom-Json
$version = "v" + $pkg.version
Write-Host "Detected version from package.json: $version"

# Check if release exists
$existing = & $gh release view $version --repo $DestRepo 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Warning "Release $version already exists. Deleting it to re-upload..."
    & $gh release delete $version --repo $DestRepo --yes --cleanup-tag
    Start-Sleep -Seconds 2
}

Write-Host "Creating Release $version in $DestRepo..."
# Create release and upload files
# Join paths with space is not enough for arguments, pass as array matching gh syntax
$fileArgs = $releaseFiles.FullName
& $gh release create $version $fileArgs --repo $DestRepo --title "LegalMind $version Release" --notes "Release version $version"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success! Release v1.0.0 created."
    Write-Host "Check it out here: https://github.com/sasha-thecornerspore-dev/LegalMind-Release/releases"
    Remove-Item -Recurse -Force temp_artifacts
}
else {
    Write-Error "Failed to create release."
}
