$targetPath = "C:\Program Files\nodejs"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$targetPath*") {
    Write-Host "Node.js path missing. Adding to User PATH..."
    $newPath = $currentPath + ";$targetPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Success! Added '$targetPath' to PATH."
} else {
    Write-Host "Node.js path already exists in User PATH."
}

# Verify Git
$gitPath = "C:\Program Files\Git\cmd"
if ($currentPath -notlike "*$gitPath*") {
    Write-Host "Git path missing. Adding to User PATH..."
    $newPath = $currentPath + ";$gitPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "Success! Added '$gitPath' to PATH."
} else {
    Write-Host "Git path already exists in User PATH."
}

Write-Host "Environment variables updated. You may need to restart your terminal or VS Code for changes to take effect."
Write-Host "Current User PATH: $newPath"
