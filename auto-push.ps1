# JusticeFlow Auto-Git-Push Watcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " JusticeFlow Auto-Git-Push Watcher Started" -ForegroundColor Green
Write-Host " Any file save will be automatically committed & pushed!" -ForegroundColor Yellow
Write-Host " Press Ctrl+C in this terminal anytime to stop." -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan

while ($true) {
    # Check if there are modified or untracked files
    $status = git status --porcelain
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] Detected code changes! Syncing to GitHub..." -ForegroundColor Yellow
        git add .
        git commit -m "auto-sync: code update at $timestamp"
        git push origin main
        Write-Host "[$timestamp] Pushed to GitHub successfully! Jenkins CI will trigger." -ForegroundColor Green
    }
    # Check every 10 seconds
    Start-Sleep -Seconds 10
}
