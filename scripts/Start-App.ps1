param([switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Push-Location $taskRoot
try {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $taskNodeDirectory = Join-Path $env:ProgramFiles 'nodejs'
        $env:PATH = "$taskNodeDirectory;$env:PATH"
    }
    if (-not $SkipBuild) {
        Push-Location frontend
        try {
            & npm.cmd ci
            if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
            & npm.cmd run build
            if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
        } finally { Pop-Location }
        & dotnet build backend/Enrollment.Api
        if ($LASTEXITCODE -ne 0) { throw 'API build failed.' }
    }
    if (-not (Test-Path -LiteralPath 'frontend/dist/index.html')) { throw 'Build the frontend before using -SkipBuild.' }
    $taskStaticPath = Join-Path $taskRoot 'backend/Enrollment.Api/wwwroot'
    New-Item -ItemType Directory -Path $taskStaticPath -Force | Out-Null
    Copy-Item -Path 'frontend/dist/*' -Destination $taskStaticPath -Recurse -Force
    $env:Database__Initialize = 'true'
    Write-Host 'Starting NISM Enrollment at http://localhost:5080. Press Ctrl+C to stop.'
    & dotnet run --project backend/Enrollment.Api --no-build
} finally { Pop-Location }
