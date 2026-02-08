# TikTok Automation Test — Puppeteer (Edge Profile Mode)

This project automates TikTok browsing using **Node.js + Puppeteer + Microsoft Edge**, with support for manual login, persistent sessions, and human-like automation behavior.

This approach avoids automated login to reduce account lock risk and ensures stable session reuse.

---

# Features

- Opens TikTok `/foryou` feed
- Detects login status automatically
- Supports manual login once, then reuses saved session
- Human-like scrolling behavior
- Optional auto-like functionality
- Terminal trigger control (Press Enter to start)
- Guest mode support (scroll without login)
- No credentials stored in code or `.env`

---

# Tech Stack

- Node.js
- Puppeteer
- Microsoft Edge
- async / await
- dotenv

---

# Prerequisites

Install the following:

- Node.js (recommended: v18–v22 LTS)
- npm
- Microsoft Edge browser

Verify Edge path:

```bash
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --version
```

---

# Setup

## 1. Install dependencies

```bash
npm install
```

## 2. Create environment file

```bash
cp .env.example .env
```

Example `.env`:

```bash
EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

EDGE_USER_DATA_DIR=E:\Coding\tiktok-automation-test\.edge-profile

LIKE_TARGET=5
MAX_STEPS=60
```

---

## First Run (Manual Login Required)

Run:

```bash
npm start
```

Microsoft Edge will open automatically.
