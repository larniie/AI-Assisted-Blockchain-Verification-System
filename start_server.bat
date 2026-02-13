@echo off
setlocal

cd /d "%~dp0.."

echo Starting certificate verification backend on http://127.0.0.1:5000 ...
python Backend\app.py

endlocal
