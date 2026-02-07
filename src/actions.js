import {
  log,
  sleep,
  humanDelay,
  waitForAnySelector,
  closeCommonPopups,
} from "./utils.js";

async function findLikeButton(page) {
  const selectors = [
    'button[data-e2e="like-icon"]',
    '[data-e2e="like-icon"] button',
    'button[aria-label*="Like"]',
    'button[aria-label*="like"]',
    'button[type="button"][aria-pressed]',
  ];
  return await waitForAnySelector(page, selectors, 12000);
}

async function isAlreadyLiked(page, btn) {
  try {
    const pressed = await page.evaluate(
      (el) => el.getAttribute("aria-pressed"),
      btn,
    );
    return pressed === "true";
  } catch {
    return false;
  }
}

async function scrollNext(page) {
  const r = Math.random();
  if (r < 0.55) {
    await page.keyboard.press("ArrowDown");
    log("SCROLL", "ArrowDown");
  } else if (r < 0.85) {
    await page.keyboard.press("PageDown");
    log("SCROLL", "PageDown");
  } else {
    await page.mouse.wheel({ deltaY: 900 + Math.floor(Math.random() * 800) });
    log("SCROLL", "MouseWheel");
  }
}

export async function scrollAndLike(page, { likeTarget = 8, maxSteps = 60 }) {
  let liked = 0;
  let steps = 0;

  log("FLOW", `Start. Target likes=${likeTarget}, maxSteps=${maxSteps}`);

  // tunggu ada video
  await waitForAnySelector(page, ["video"], 20000);
  await humanDelay(800, 1600);

  while (steps < maxSteps && liked < likeTarget) {
    steps++;

    await closeCommonPopups(page);

    // watch time 2.5s–7s
    const watchMs = 2500 + Math.random() * 4500;
    log("WATCH", `${Math.round(watchMs / 1000)}s`);
    await sleep(watchMs);

    const btn = await findLikeButton(page);

    if (btn) {
      const already = await isAlreadyLiked(page, btn);

      // biar lebih manusia: gak semua di-like
      const shouldLike = Math.random() < 0.7;

      if (!already && shouldLike) {
        await humanDelay(250, 900);
        try {
          await btn.click({ delay: 80 });
          liked++;
          log("LIKE", `✅ ${liked}/${likeTarget}`);
        } catch {
          log("LIKE", "Click failed");
        }
        await humanDelay(900, 2000);
      } else if (already) {
        log("LIKE", "Already liked → skip");
      } else {
        log("LIKE", "Skip (human moment)");
      }
    } else {
      log("LIKE", "Like button not found → skip");
    }

    await humanDelay(500, 1200);
    await scrollNext(page);
    await humanDelay(1200, 2200);
  }

  log("DONE", `Finished. liked=${liked}, steps=${steps}`);
}
