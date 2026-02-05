export function log(step, msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${step}] ${msg}`);
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function humanDelay(min = 250, max = 900) {
  const ms = Math.floor(min + Math.random() * (max - min + 1));
  await sleep(ms);
}

export async function waitForAnySelector(page, selectors, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    for (const sel of selectors) {
      const el = await page.$(sel);
      if (el) return el;
    }
    await sleep(250);
  }
  return null;
}

export async function elementWithText(page, selector, text) {
  const handle = await page.evaluateHandle(
    ({ selector, text }) => {
      const els = Array.from(document.querySelectorAll(selector));
      const t = text.toLowerCase();
      return (
        els.find((el) => (el.innerText || "").toLowerCase().includes(t)) || null
      );
    },
    { selector, text },
  );

  const el = handle.asElement();
  if (!el) {
    await handle.dispose();
    return null;
  }
  return el;
}
