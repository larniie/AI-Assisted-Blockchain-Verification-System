@echo off
setlocal

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    set PID=%%a
)

if not defined PID (
    echo No process is listening on port 5000.
    goto :eof
)

echo Stopping process on port 5000 (PID: %PID%)...
taskkill /PID %PID% /F

endlocal
