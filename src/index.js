import puppeteer from "puppeteer";
import { config } from "./config.js";
import { log } from "./utils.js";
import { doLoginIfNeeded } from "./auth.js";
import { scrollAndLike } from "./actions.js";

(async () => {
  log("BOOT", "Launching Puppeteer…");

  const browser = await puppeteer.launch({
    headless: config.headless,
    defaultViewport: null,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Slightly realistic UA (not magic, just less “bot vibes”)
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  );

  // LOGIN (cookie reuse OR manual login once)
  await doLoginIfNeeded(page, {
    email: config.email,
    password: config.password,
    cookiesPath: config.cookiesPath,
  });

  // SCROLL + LIKE
  await scrollAndLike(page, config.likeTarget);

  await browser.close();
  log("EXIT", "Done.");
})();
