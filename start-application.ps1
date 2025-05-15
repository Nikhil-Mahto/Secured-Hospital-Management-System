# Secure Hospital Management System Starter

function Write-Header {
    param ([string]$Message)
    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-CommandExists {
    param ([string]$Command)
    $exists = $false
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            $exists = $true
        }
    } catch {
        $exists = $false
    }
    return $exists
}

Write-Header "Secure Hospital Management System Starter"

# Check if Node.js is installed
if (-not (Test-CommandExists "node")) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js first: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press ENTER to exit"
    exit 1
} else {
    $nodeVersion = (node -v)
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
}

# Check if Maven is installed
if (-not (Test-CommandExists "mvn")) {
    Write-Host "WARNING: Maven not found in PATH, using local Maven..." -ForegroundColor Yellow
    $env:PATH += ";C:\maven\apache-maven-3.9.6\bin"
    
    if (-not (Test-CommandExists "mvn")) {
        Write-Host "ERROR: Maven is not installed or not in path" -ForegroundColor Red
        Write-Host "Please install Maven first or verify the installation path" -ForegroundColor Yellow
        Read-Host "Press ENTER to exit"
        exit 1
    } else {
        Write-Host "Local Maven found and added to PATH" -ForegroundColor Green
    }
} else {
    $mvnVersion = (mvn -v) | Select-Object -First 1
    Write-Host "Maven version: $mvnVersion" -ForegroundColor Green
}

# Ensure we're in the project root
$projectRoot = $PSScriptRoot
Set-Location $projectRoot

# Update frontend API URLs if needed
Write-Host "Checking and updating frontend API URLs..." -ForegroundColor Yellow
$frontendDir = Join-Path -Path $projectRoot -ChildPath "frontend"
$find = "http://localhost:8080"
$replace = "http://localhost:8081"

# Update API URLs in service files
$serviceFiles = @(
    "src\services\auth.service.ts",
    "src\services\medical-record.service.ts",
    "src\services\doctor.service.ts"
)

foreach ($file in $serviceFiles) {
    $filePath = Join-Path -Path $frontendDir -ChildPath $file
    if (Test-Path $filePath) {
        (Get-Content $filePath) -replace $find, $replace | Set-Content $filePath
        Write-Host "Updated API URL in $file" -ForegroundColor Green
    } else {
        Write-Host "Warning: File $file not found" -ForegroundColor Yellow
    }
}

# Install frontend dependencies if needed
if (-not (Test-Path (Join-Path -Path $frontendDir -ChildPath "node_modules"))) {
    Write-Header "Installing frontend dependencies"
    Set-Location $frontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press ENTER to exit"
        exit 1
    }
    Set-Location $projectRoot
}

# Start the application
Write-Header "Starting Application"

$backendDir = Join-Path -Path $projectRoot -ChildPath "backend"

# Function to check if port is in use
function Test-PortInUse {
    param ([int]$Port)
    $PortInUse = $null
    $PortInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $PortInUse -ne $null
}

# Check if ports are already in use
if (Test-PortInUse 8081) {
    Write-Host "WARNING: Port 8081 is already in use. Backend may fail to start." -ForegroundColor Yellow
}

if (Test-PortInUse 3000) {
    Write-Host "WARNING: Port 3000 is already in use. Frontend may fail to start." -ForegroundColor Yellow
}

# Start backend
Write-Host "Starting backend (Spring Boot) on port 8081..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd $backendDir && mvn spring-boot:run" -PassThru

Write-Host "Waiting for backend to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start frontend
Write-Host "Starting frontend (React) on port 3000..." -ForegroundColor Yellow
Set-Location $frontendDir
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -Wait

# Clean up
Write-Host "Frontend server has stopped. Stopping backend..." -ForegroundColor Yellow
Stop-Process -Id $backendJob.Id -Force

Write-Host "Application shutdown complete." -ForegroundColor Green
Read-Host "Press ENTER to exit" 