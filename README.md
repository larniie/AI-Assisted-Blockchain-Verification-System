# AI-Assisted Blockchain Certificate Verification System

This project is a Flask-based certificate verification backend with a modern frontend dashboard.

It supports:
- Online mode (real backend API + blockchain verification)
- Offline Demo mode (no API required, browser localStorage simulation)
- AI-style assistance (risk/confidence insights + section explanations + next-step guidance)

---

## Project Structure

```
Backend/
  app.py
  blockchain.py
  cli.py
  utils.py
Frontend/
  index.html
  app.js
  styles.css
  requirements.txt
scripts/
  install_deps.ps1
  start_server.ps1
  stop_server.ps1
  start_server.bat
  stop_server.bat
SHELL_USAGE.md
README.md
```

---

## Features

### Backend
- Issue certificate hashes to blockchain (`/issue`)
- Verify certificate authenticity (`/verify`)
- Inspect chain state (`/chain`)
- Blockchain integrity checks
- Waitress WSGI runtime for production-style serving

### Frontend
- Modern UI dashboard
- API settings (save/reset/test)
- Online vs Offline mode switch
- AI Insights panel (confidence, risk, recommendations)
- AI Help Assistant:
  - explain each section on demand
  - “What should I do next?” guidance

---

## Requirements

- Python 3.10+
- Windows PowerShell (recommended for scripts)

Install dependencies:

```powershell
.\scripts\install_deps.ps1
```

---

## Run (Online Mode)

### 1) Start backend

```powershell
.\scripts\start_server.ps1
```

Backend runs on:

```text
http://127.0.0.1:5000
```

### 2) Start frontend static server

```powershell
python -m http.server 5500 -d Frontend
```

Open:

```text
http://127.0.0.1:5500
```

### 3) Stop backend

```powershell
.\scripts\stop_server.ps1
```

---

## Run Without API (Offline Demo Mode)

1. Start only frontend:

```powershell
python -m http.server 5500 -d Frontend
```

2. Open `http://127.0.0.1:5500`
3. In API Settings:
   - set Mode to Offline Demo (No API)
   - click Save URL

In this mode, issue/verify/chain uses browser `localStorage`.

> Note: Offline mode is for demos/testing only (not production secure).

---

## CLI Usage (Backend API)

Issue certificate:

```powershell
python Backend\cli.py issue "Alice BSc Computer Science 2026"
```

Verify certificate:

```powershell
python Backend\cli.py verify "Alice BSc Computer Science 2026"
```

Show chain:

```powershell
python Backend\cli.py chain
```

---

## API Endpoints

- `POST /issue`
  - body: `{ "certificate": "..." }`
- `POST /verify`
  - body: `{ "certificate": "..." }`
- `GET /chain`

---

## Troubleshooting

### Shell Integration Unavailable
- Use PowerShell terminal directly
- If needed:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Backend not reachable (connection refused)
- Ensure backend is running:

```powershell
.\scripts\start_server.ps1
```

### Missing waitress
- Reinstall deps:

```powershell
.\scripts\install_deps.ps1
```

---

## Security Notes (Next Steps)

For production readiness, add:
- Issuer authentication/authorization
- Digital signatures for certificates
- Persistent storage (DB)
- HTTPS + rate limiting + audit logs
