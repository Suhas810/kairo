$ErrorActionPreference = "Stop"
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory "..")).Path
$backendDirectory = Join-Path $repositoryRoot "backend"
$sandboxDirectory = Join-Path $repositoryRoot "sandbox"
$frontendDirectory = Join-Path $repositoryRoot "frontend"

function Stop-Setup([string] $Message) {
    [Console]::Error.WriteLine("Setup failed: $Message")
    exit 1
}

function Invoke-Checked([string] $Executable, [string[]] $Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) {
        Stop-Setup "Command '$Executable $($Arguments -join ' ')' failed with exit code $LASTEXITCODE."
    }
}

$git = Get-Command git -ErrorAction SilentlyContinue
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($null -eq $git) { Stop-Setup "Required command 'git' was not found." }
if ($null -eq $node) { Stop-Setup "Required command 'node' was not found." }
if ($null -eq $npm) { Stop-Setup "Required command 'npm' was not found." }

$python = Get-Command python -ErrorAction SilentlyContinue
$pythonArguments = @()
if ($null -eq $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
    if ($null -eq $python) { Stop-Setup "Python 3.11 or newer is required." }
    $pythonArguments = @("-3")
}

$pythonVersion = & $python.Source @pythonArguments -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
if ($LASTEXITCODE -ne 0) { Stop-Setup "Could not determine the Python version." }
$pythonParts = $pythonVersion.Trim().Split(".")
if ([int]$pythonParts[0] -lt 3 -or ([int]$pythonParts[0] -eq 3 -and [int]$pythonParts[1] -lt 11)) {
    Stop-Setup "Python 3.11 or newer is required (found $pythonVersion)."
}

$nodeVersion = & $node.Source -p "process.versions.node"
if ($LASTEXITCODE -ne 0) { Stop-Setup "Could not determine the Node.js version." }
if ([int]$nodeVersion.Split(".")[0] -lt 20) {
    Stop-Setup "Node.js 20 or newer is required (found $nodeVersion)."
}

Write-Host "Using Python $pythonVersion, Node.js $nodeVersion, npm $(& $npm.Source --version)"
if ($LASTEXITCODE -ne 0) { Stop-Setup "Could not determine the npm version." }
& $git.Source --version | Out-Null
if ($LASTEXITCODE -ne 0) { Stop-Setup "Git is unavailable." }

$hasSupabaseUrl = -not [string]::IsNullOrWhiteSpace($env:SUPABASE_URL)
$hasSupabaseKey = -not [string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)
if ($hasSupabaseUrl -ne $hasSupabaseKey) {
    Stop-Setup "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together."
}

function Initialize-Venv([string] $Directory) {
    $pythonPath = Join-Path $Directory "Scripts\python.exe"
    if (Test-Path $pythonPath) {
        Write-Host "Reusing $($Directory.Substring($repositoryRoot.Length + 1))"
    } elseif (Test-Path $Directory) {
        Stop-Setup "Found an incomplete virtual environment at $Directory; move or repair it before setup."
    } else {
        Write-Host "Creating $($Directory.Substring($repositoryRoot.Length + 1))"
        Invoke-Checked $python.Source ($pythonArguments + @("-m", "venv", $Directory))
    }
}

$backendVenv = Join-Path $backendDirectory ".venv"
$sandboxVenv = Join-Path $sandboxDirectory ".venv"
Initialize-Venv $backendVenv
Initialize-Venv $sandboxVenv

$backendPython = Join-Path $backendVenv "Scripts\python.exe"
$sandboxPython = Join-Path $sandboxVenv "Scripts\python.exe"
Write-Host "Installing backend development dependencies..."
Invoke-Checked $backendPython @("-m", "pip", "install", "-r", (Join-Path $backendDirectory "requirements-dev.txt"))
Write-Host "Installing sandbox development dependencies..."
Invoke-Checked $sandboxPython @("-m", "pip", "install", "-r", (Join-Path $sandboxDirectory "requirements-dev.txt"))

Write-Host "Installing frontend dependencies..."
Push-Location $frontendDirectory
try {
    if (Test-Path (Join-Path $frontendDirectory "package-lock.json")) {
        Invoke-Checked $npm.Source @("ci")
    } else {
        Invoke-Checked $npm.Source @("install")
    }
} finally {
    Pop-Location
}

Invoke-Checked $backendPython @("-c", "import fastapi, pytest")
Invoke-Checked $sandboxPython @("-c", "import pydantic, pytest")
if (-not (Test-Path (Join-Path $frontendDirectory "node_modules\.bin\vite.cmd"))) {
    Stop-Setup "Frontend dependencies were not installed correctly (Vite is missing)."
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Docker is available; sandbox container tests can be enabled when its images are built."
} else {
    Write-Host "Docker is not installed; local unit tests and development services do not require it."
}

$examples = @(
    (Join-Path $repositoryRoot ".env.example"),
    (Join-Path $backendDirectory ".env.example"),
    (Join-Path $frontendDirectory ".env.example")
)
if (-not ($examples | Where-Object { Test-Path $_ })) {
    Write-Host "No .env.example is present. No environment file was created or modified."
    Write-Host "Backend integrations are optional; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY together, and optionally GITHUB_WEBHOOK_SECRET in the process environment."
}

Write-Host "Setup checks passed. Run scripts\dev.ps1 to start local development."
