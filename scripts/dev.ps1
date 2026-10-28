$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory "..")).Path
$backendDirectory = Join-Path $repositoryRoot "backend"
$frontendDirectory = Join-Path $repositoryRoot "frontend"
$backendPython = Join-Path $backendDirectory ".venv\Scripts\python.exe"
$vite = Join-Path $frontendDirectory "node_modules\vite\bin\vite.js"
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not (Test-Path $backendPython)) {
    [Console]::Error.WriteLine("Development startup failed: backend environment is missing; run scripts\setup.ps1 first.")
    exit 1
}
if ($null -eq $node -or -not (Test-Path $vite)) {
    [Console]::Error.WriteLine("Development startup failed: frontend dependencies are missing; run scripts\setup.ps1 first.")
    exit 1
}

$hasSupabaseUrl = -not [string]::IsNullOrWhiteSpace($env:SUPABASE_URL)
$hasSupabaseKey = -not [string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)
if ($hasSupabaseUrl -ne $hasSupabaseKey) {
    [Console]::Error.WriteLine("Development startup failed: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together.")
    exit 1
}

$processes = [Collections.Generic.List[Diagnostics.Process]]::new()
try {
    $backend = Start-Process -FilePath $backendPython `
        -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000") `
        -WorkingDirectory $backendDirectory -NoNewWindow -PassThru
    $processes.Add($backend)

    $frontend = Start-Process -FilePath $node.Source `
        -ArgumentList @($vite, "--host", "127.0.0.1") `
        -WorkingDirectory $frontendDirectory -NoNewWindow -PassThru
    $processes.Add($frontend)

    Start-Sleep -Seconds 1
    foreach ($process in $processes) {
        $process.Refresh()
        if ($process.HasExited) {
            throw "A development service exited during startup (exit code $($process.ExitCode))."
        }
    }

    Write-Host "Frontend: http://127.0.0.1:5173"
    Write-Host "Backend:  http://127.0.0.1:8000"
    Write-Host "API docs: http://127.0.0.1:8000/api/docs"
    Write-Host "Press Ctrl+C to stop both services."

    while ($true) {
        foreach ($process in $processes) {
            $process.Refresh()
            if ($process.HasExited) {
                throw "A development service exited unexpectedly (exit code $($process.ExitCode))."
            }
        }
        Start-Sleep -Seconds 1
    }
} catch [System.Management.Automation.PipelineStoppedException] {
    Write-Host "Stopping development services..."
} catch {
    [Console]::Error.WriteLine("Development startup failed: $($_.Exception.Message)")
    exit 1
} finally {
    foreach ($process in $processes) {
        try {
            $process.Refresh()
            if (-not $process.HasExited) {
                Stop-Process -Id $process.Id -ErrorAction Stop
                $process.WaitForExit(5000) | Out-Null
            }
        } catch {
            [Console]::Error.WriteLine("Could not stop child process $($process.Id): $($_.Exception.Message)")
        }
        $process.Dispose()
    }
}
