Get-ChildItem -Directory | ForEach-Object {
    $dirName = $_.Name
    $files = Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue
    $totalBytes = ($files | Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{
        Directory = $dirName
        SizeMB    = [math]::Round(($totalBytes / 1MB), 2)
        FileCount = $files.Count
    }
} | Sort-Object -Property SizeMB -Descending | Format-Table -AutoSize
