@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish_release.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Release failed with error code %ERRORLEVEL%
    echo.
)
pause
