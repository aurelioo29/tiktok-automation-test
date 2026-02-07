import puppeteer from "puppeteer";
import { config } from "./config.js";
import { log, waitForEnter, closeCommonPopups, humanDelay } from "./utils.js";
import { scrollAndLike } from "./actions.js";

async function hasLoginText(page) {
  return await page.evaluate(() => {
    const texts = ["Log in", "Login", "Masuk"];
    const els = Array.from(document.querySelectorAll("a,button"));
    return els.some((el) =>
      texts.some((t) => (el.innerText || "").trim().includes(t)),
    );
  });
}

(async () => {
  log("BOOT", "Launching Edge (project profile) …");

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: config.edgePath,

    // ✅ profile khusus project (stabil)
    userDataDir: config.userDataDir,

    args: ["--start-maximized"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  );

  // ✅ buka /foryou (bukan explore)
  const startUrl = "https://www.tiktok.com/foryou";
  log("NAV", `Opening: ${startUrl}`);
  await page.goto(startUrl, { waitUntil: "networkidle2" });
  await humanDelay(800, 1400);

  await closeCommonPopups(page);

  // ✅ kalau masih ada login button/text -> pause biar kamu login manual
  const needsLogin = await hasLoginText(page);

  if (needsLogin) {
    log("LOGIN", "Kamu belum login. Silakan LOGIN manual di browser dulu.");
    log("LOGIN", "Setelah berhasil, kembali ke feed /foryou.");
    await waitForEnter("✅ Kalau sudah login, tekan Enter untuk ARM mode.");
  } else {
    log("LOGIN", "Session terdeteksi (kemungkinan sudah login).");
  }

  // refresh biar UI/session kebaca clean
  await page.goto(startUrl, { waitUntil: "networkidle2" });
  await humanDelay(800, 1400);
  await closeCommonPopups(page);

  // ✅ trigger manual start
  log("WAIT", "Armed. Automation belum jalan sampai kamu tekan Enter lagi.");
  await waitForEnter("🚀 Press Enter untuk START auto scroll + like.");

  await scrollAndLike(page, {
    likeTarget: config.likeTarget,
    maxSteps: config.maxSteps,
  });

  await browser.close();
  log("EXIT", "Browser closed. Done.");
})();
