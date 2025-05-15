@echo off
echo =======================================================
echo    Secure Hospital Management System Starter
echo =======================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Node.js is not installed or not in PATH
  echo Please install Node.js first: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

REM Check if Maven is installed
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Maven not found in PATH, using local Maven...
  set PATH=%PATH%;C:\maven\apache-maven-3.9.6\bin
  
  where mvn >nul 2>&1
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in path
    echo Please install Maven first or verify the installation path
    echo.
    pause
    exit /b 1
  ) else (
    echo Local Maven found and added to PATH
  )
)

REM Update frontend API URLs if needed
echo Checking and updating frontend API URLs...
cd frontend
set "find=http://localhost:8080"
set "replace=http://localhost:8081"

REM Update auth.service.ts
powershell -Command "(Get-Content src\services\auth.service.ts) -replace '%find%', '%replace%' | Set-Content src\services\auth.service.ts"

REM Update medical-record.service.ts
powershell -Command "(Get-Content src\services\medical-record.service.ts) -replace '%find%', '%replace%' | Set-Content src\services\medical-record.service.ts"

REM Update doctor.service.ts
powershell -Command "(Get-Content src\services\doctor.service.ts) -replace '%find%', '%replace%' | Set-Content src\services\doctor.service.ts"

echo Frontend API URLs updated to use port 8081

REM Check if NPM dependencies are installed
if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm install
  if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
  )
)

echo.
echo =======================================================
echo Starting backend (Spring Boot)
echo =======================================================
echo.

REM Start backend in a new command window
start cmd /k "cd backend && mvn spring-boot:run"

REM Wait for backend to start
echo Waiting for backend to start (10 seconds)...
timeout /t 10 /nobreak

echo.
echo =======================================================
echo Starting frontend (React)
echo =======================================================
echo.

REM Start frontend server
cd frontend
call npm start

REM If frontend terminates, keep the window open
pause 