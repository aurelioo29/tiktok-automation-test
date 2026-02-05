# TikTok Automation Test — Puppeteer

This project automates the following flow (per the test requirements):

1. Open TikTok
2. Ensure the session is logged in (via saved cookies, or manual login once)
3. Scroll through videos
4. Like 5 different videos while scrolling

It uses:

- **Node.js + Puppeteer**
- **async/await**
- **human-like delays**
- **action logging** (login, scroll, like)
- **no hardcoded credentials** (reads from `.env`)

---

## Prerequisites

- **Node.js** (recommended: Node 18+)
- **npm** (comes with Node)

---

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Copy the example file:

```bash
cp .env.example .env
```

### 3) Fill your test credentials in `.env`

Example:

```bash
TIKTOK_EMAIL="your_test_email@example.com"
TIKTOK_PASSWORD="your_password_here"

LIKE_TARGET=5
HEADLESS=false
COOKIES_PATH="./tiktok-cookies.json"
```

---

## Run

Start the script

```bash
npm start
```
