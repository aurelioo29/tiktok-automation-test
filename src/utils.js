import readline from "readline";

export function log(step, msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${step}] ${msg}`);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function humanDelay(min = 400, max = 1600) {
  const ms = Math.floor(min + Math.random() * (max - min));
  await sleep(ms);
}

export async function waitForEnter(message = "Press Enter to continue...") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise((resolve) => rl.question(`\n${message}\n`, resolve));
  rl.close();
}

export async function waitForAnySelector(page, selectors, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const selector of selectors) {
      const el = await page.$(selector);
      if (el) return el;
    }
    await sleep(300);
  }
  return null;
}

export async function closeCommonPopups(page) {
  const texts = [
    "Accept",
    "Agree",
    "OK",
    "Not now",
    "Later",
    "Skip",
    "Cancel",
    "Close",
  ];

  for (const text of texts) {
    const clicked = await page.evaluate((t) => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find((b) =>
        (b.innerText || "").toLowerCase().includes(t.toLowerCase()),
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, text);

    if (clicked) {
      log("UI", `Closed popup: ${text}`);
      await humanDelay(500, 1200);
      return true;
    }
  }
  return false;
}
