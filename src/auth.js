import fs from "fs";
import {
  elementWithText,
  humanDelay,
  log,
  sleep,
  waitForAnySelector,
} from "./utils.js";

export async function loadCookies(page, cookiesPath) {
  if (!fs.existsSync(cookiesPath)) return false;

  const cookies = JSON.parse(fs.readFileSync(cookiesPath, "utf-8"));
  if (!Array.isArray(cookies) || cookies.length === 0) return false;

  await page.setCookie(...cookies);
  log("LOGIN", `Loaded cookies from ${cookiesPath}`);
  return true;
}

export async function saveCookies(page, cookiesPath) {
  const cookies = await page.cookies();
  fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
  log("LOGIN", `Saved cookies to ${cookiesPath}`);
}

async function hasAuthCookie(page) {
  const cookies = await page.cookies();
  const names = new Set(cookies.map((c) => c.name));

  // TikTok auth-ish cookies commonly seen
  return (
    names.has("sessionid") ||
    names.has("sessionid_ss") ||
    names.has("sid_tt") ||
    names.has("ttwid") ||
    names.has("uid_tt") ||
    names.has("passport_csrf_token")
  );
}

async function waitForManualLogin(page, timeoutMs = 3 * 60 * 1000) {
  const start = Date.now();
  log(
    "LOGIN",
    `Waiting for manual login (timeout ${Math.round(timeoutMs / 1000)}s)...`,
  );

  while (Date.now() - start < timeoutMs) {
    if (await hasAuthCookie(page)) {
      log("LOGIN", "Detected auth cookie ✅");
      return true;
    }

    // weak fallback: video exists + no login link
    const hasVideo = await page.$("video");
    const loginLink = await page.$('a[href*="/login"]');
    if (hasVideo && !loginLink) {
      log("LOGIN", "Feed detected + no login link ✅");
      return true;
    }

    await sleep(2000);
  }
  return false;
}

export async function isLoggedIn(page) {
  // If login link exists, likely logged out
  const loginLink = await page.$('a[href*="/login"]');
  if (loginLink) return false;

  // If button text says login, likely logged out
  const loginBtn1 = await elementWithText(page, "button", "log in");
  const loginBtn2 = await elementWithText(page, "button", "login");
  if (loginBtn1 || loginBtn2) return false;

  // If auth cookie exists, likely logged in
  if (await hasAuthCookie(page)) return true;

  // Fallback: if video exists, assume OK enough to scroll/like (not perfect)
  const hasVideo = await page.$("video");
  return Boolean(hasVideo);
}

export async function doLoginIfNeeded(page, { email, password, cookiesPath }) {
  // 1) Try cookies first
  await loadCookies(page, cookiesPath);

  await page.goto("https://www.tiktok.com", { waitUntil: "networkidle2" });
  await humanDelay(900, 1500);

  if (await isLoggedIn(page)) {
    log("LOGIN", "Already logged in (via cookies/session).");
    return;
  }

  // 2) Go to login page
  log("LOGIN", "Not logged in. Going to login page…");
  await page.goto("https://www.tiktok.com/login", {
    waitUntil: "networkidle2",
  });
  await humanDelay(900, 1500);

  // If env creds missing -> manual
  if (!email || !password) {
    log("LOGIN", "No credentials in .env. Please login manually.");
    const ok = await waitForManualLogin(page, 3 * 60 * 1000);
    if (ok) {
      await saveCookies(page, cookiesPath);
      return;
    }
    throw new Error("Manual login not completed within timeout.");
  }

  // 3) Try to find inputs and type (best-effort)
  log("LOGIN", "Trying to enter credentials automatically…");

  const emailInput = await waitForAnySelector(
    page,
    [
      'input[name="username"]',
      'input[autocomplete="username"]',
      'input[type="text"]',
    ],
    10000,
  );

  const passInput = await waitForAnySelector(
    page,
    ['input[type="password"]', 'input[autocomplete="current-password"]'],
    10000,
  );

  if (!emailInput || !passInput) {
    log("LOGIN", "Could not detect login inputs reliably.");
    log(
      "LOGIN",
      "Please login manually in the opened browser (captcha/MFA if shown).",
    );

    const ok = await waitForManualLogin(page, 3 * 60 * 1000);
    if (ok) {
      await saveCookies(page, cookiesPath);
      return;
    }
    throw new Error("Manual login not completed within timeout.");
  }

  // Type creds
  await emailInput.click({ clickCount: 3 });
  await humanDelay(200, 500);
  await page.keyboard.type(email, { delay: 45 });

  await humanDelay(350, 800);

  await passInput.click({ clickCount: 3 });
  await humanDelay(200, 500);
  await page.keyboard.type(password, { delay: 55 });

  await humanDelay(500, 1100);
  await page.keyboard.press("Enter");
  log(
    "LOGIN",
    "Submitted credentials. If captcha/MFA appears, solve it manually.",
  );

  // Wait for login to complete (cookie-based)
  const ok = await waitForManualLogin(page, 3 * 60 * 1000);
  if (ok) {
    log("LOGIN", "Login confirmed ✅ Saving cookies…");
    await saveCookies(page, cookiesPath);
    return;
  }

  throw new Error("Login failed / not confirmed within timeout.");
}
