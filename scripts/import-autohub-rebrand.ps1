param(
    [string]$SourceDirectory = 'C:\Users\marti\OneDrive\Desktop\Autohub rebrand',
    [switch]$IncludeReferenceGallery
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskRepo = Split-Path $PSScriptRoot -Parent
$taskAssetRoot = Join-Path $taskRepo 'public\brand\autohub'
$taskDocs = Join-Path $taskRepo 'docs\rebrand'
$taskReferenceRoot = Join-Path $taskRepo 'scratch\autohub-references'
New-Item -ItemType Directory -Force -Path $taskAssetRoot,$taskDocs | Out-Null
$taskRows = @()
$taskAssets = @{}
foreach ($taskZip in (Get-ChildItem -LiteralPath $SourceDirectory -Filter '*.zip' | Sort-Object Name)) {
    $taskArchive = [IO.Compression.ZipFile]::OpenRead($taskZip.FullName)
    try {
        $taskEntry = $taskArchive.Entries | Where-Object FullName -like '*.dc.html' | Select-Object -First 1
        $taskReader = [IO.StreamReader]::new($taskEntry.Open())
        try { $taskHtml = $taskReader.ReadToEnd() } finally { $taskReader.Dispose() }
        $taskLogic = [regex]::Match($taskHtml,'(?s)<script type="text/x-dc"[^>]*>(.*?)</script>').Groups[1].Value.Trim()
        $taskId = $taskZip.Name.Substring(0,2)
        if ($IncludeReferenceGallery) {
            $taskReferenceDirectory = Join-Path $taskReferenceRoot $taskId
            [IO.Compression.ZipFile]::ExtractToDirectory($taskZip.FullName,$taskReferenceDirectory,$true)
        }
        $taskRows += [pscustomobject]@{
            id=$taskId; archive=$taskZip.Name; sha256=(Get-FileHash -LiteralPath $taskZip.FullName).Hash.ToLower()
            html=$taskEntry.FullName
            assets=@($taskArchive.Entries | Where-Object FullName -like 'assets/*').Count
            preview=[regex]::Match($taskHtml,'"\$preview":\{[^}]+\}').Value
            keyframes=@([regex]::Matches($taskHtml,'@keyframes\s+([\w-]+)') | ForEach-Object {$_.Groups[1].Value} | Sort-Object -Unique)
            motionDeclarations=@([regex]::Matches($taskHtml,'(?:animation(?:-[\w-]+)?|transition(?:-[\w-]+)?)\s*:[^;}"\r\n]+') | ForEach-Object {$_.Value} | Sort-Object -Unique)
            mediaQueries=@([regex]::Matches($taskHtml,'@media[^\{]+') | ForEach-Object {$_.Value} | Sort-Object -Unique)
            fonts=@([regex]::Matches($taskHtml,'font-family\s*:[^;}"\r\n]+') | ForEach-Object {$_.Value} | Sort-Object -Unique)
            logicLength=$taskLogic.Length; logicExcerpt=$taskLogic.Substring(0,[Math]::Min(1000,$taskLogic.Length))
            placeholderLinks=[regex]::Matches($taskHtml,'href="#"').Count
            externalUrls=@([regex]::Matches($taskHtml,'https?://[^"''<>\s]+') | ForEach-Object {$_.Value} | Sort-Object -Unique)
        }
        foreach ($taskAsset in ($taskArchive.Entries | Where-Object FullName -like 'assets/*')) {
            $taskName = [IO.Path]::GetFileName($taskAsset.FullName)
            if (!$taskName) { continue }
            $taskBuffer = [IO.MemoryStream]::new()
            $taskStream = $taskAsset.Open()
            try { $taskStream.CopyTo($taskBuffer); $taskBytes=$taskBuffer.ToArray() } finally { $taskStream.Dispose(); $taskBuffer.Dispose() }
            $taskSha=[Security.Cryptography.SHA256]::Create()
            try { $taskHash=([BitConverter]::ToString($taskSha.ComputeHash($taskBytes))).Replace('-','').ToLower() } finally { $taskSha.Dispose() }
            if ($taskAssets.ContainsKey($taskName)) {
                if ($taskAssets[$taskName].sha256 -ne $taskHash) { throw "Different contents share asset name: $taskName" }
                $taskAssets[$taskName].references += $taskId
            } else {
                [IO.File]::WriteAllBytes((Join-Path $taskAssetRoot $taskName),$taskBytes)
                $taskAssets[$taskName]=[pscustomobject]@{file=$taskName;sha256=$taskHash;bytes=$taskBytes.Length;references=@($taskId)}
            }
        }
    } finally { $taskArchive.Dispose() }
}
$taskRows | ConvertTo-Json -Depth 8 | Set-Content (Join-Path $taskDocs 'autohub-export-inventory.json') -Encoding utf8
@($taskAssets.Values | Sort-Object file) | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $taskAssetRoot 'manifest.json') -Encoding utf8
if ($IncludeReferenceGallery) {
    $taskCards = $taskRows | ForEach-Object {
        $taskTitle = [Net.WebUtility]::HtmlEncode($_.archive.Replace('-html.zip',''))
        $taskHref = $_.id + '/' + [Uri]::EscapeDataString($_.html)
        '<a href="' + $taskHref + '"><b>' + $taskTitle + '</b><span>' + $_.assets + ' assets · ' + $_.motionDeclarations.Count + ' CSS prehodov</span></a>'
    }
    $taskGallery = '<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AutoHub — 74 izvornih referenc</title><style>body{margin:0;padding:40px;font:15px/1.5 system-ui;background:#e8f1fb;color:#0c1b30}main{max-width:1200px;margin:auto}h1{font-size:32px;margin:0}p{color:#5a6b83}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px;margin-top:32px}a{display:flex;flex-direction:column;gap:12px;background:white;border-radius:24px;padding:24px;color:inherit;text-decoration:none;box-shadow:0 12px 32px -14px #0c1b3029}a:hover{outline:2px solid #2563eb}span{font-size:12px;color:#5a6b83}</style></head><body><main><h1>AutoHub — izvorne reference</h1><p>74 originalnih Claude Design izvozov. Odprite izbrani zaslon za pregled dizajna in izvoženih stanj. Izvorne datoteke so ločene od produkcijske platforme.</p><section>' + ($taskCards -join '') + '</section></main></body></html>'
    [IO.File]::WriteAllText((Join-Path $taskReferenceRoot 'index.html'),$taskGallery,[Text.UTF8Encoding]::new($false))
}
Write-Output ("Imported {0} references and {1} unique assets." -f $taskRows.Count,$taskAssets.Count)
