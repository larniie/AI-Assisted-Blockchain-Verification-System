# Shell Integration Guide

## If VS Code shows "Shell Integration Unavailable"

Use **PowerShell** and run commands manually in terminal.

1. Open PowerShell terminal in VS Code.
2. If scripts are blocked in your session, run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

3. If your path contains an apostrophe (`'`) like `Yolanda S'phesihle`, use a **double-quoted** literal path:

```powershell
Set-Location -LiteralPath "C:\Users\Yolanda S'phesihle M\Documents\AI-Assisted Blockchain Certificate Verification System"
```

4. Then use the commands below.

## 1) Install dependencies

```powershell
.\scripts\install_deps.ps1
```

## 2) Start backend server (Waitress) - PowerShell (recommended)

```powershell
.\scripts\start_server.ps1
```

If dependencies are missing, the script will tell you to run:

```powershell
.\scripts\install_deps.ps1
```

## 3) Stop backend server - PowerShell (recommended)

```powershell
.\scripts\stop_server.ps1
```

## 4) Start/Stop using .bat (fallback)

```bat
scripts\start_server.bat
```

```bat
scripts\stop_server.bat
```

## 5) Use CLI from shell

Issue certificate:

```powershell
python Backend\cli.py issue "Alice BSc 2026"
```

Verify certificate:

```powershell
python Backend\cli.py verify "Alice BSc 2026"
```

Show chain:

```powershell
python Backend\cli.py chain
```

Use custom base URL:

```powershell
python Backend\cli.py --base-url http://127.0.0.1:5000 verify "Alice BSc 2026"
```

## 6) Direct API shell/curl examples

Issue:

```bat
curl -X POST http://127.0.0.1:5000/issue -H "Content-Type: application/json" -d "{\"certificate\":\"Alice BSc 2026\"}"
```

Verify:

```bat
curl -X POST http://127.0.0.1:5000/verify -H "Content-Type: application/json" -d "{\"certificate\":\"Alice BSc 2026\"}"
```

Chain:

```bat
curl http://127.0.0.1:5000/chain
```

## 7) Run frontend in browser

From project root, start a static file server:

```powershell
python -m http.server 5500 -d Frontend
```

Then open:

```text
http://127.0.0.1:5500
```

Make sure backend is running on `http://127.0.0.1:5000` (default in the UI).

## 8) Use frontend without API (Offline Demo Mode)

If you want the app to work **without backend/API**:

1. Open frontend:

```powershell
python -m http.server 5500 -d Frontend
```

2. In browser, open `http://127.0.0.1:5500`
3. In **API Settings**:
   - set **Mode** to **Offline Demo (No API)**
   - click **Save URL** (saves mode + URL)

In Offline Demo Mode:
- Issue/Verify/Chain actions run from browser `localStorage`
- No backend server is required
- Data is demo-only (not production secure)
