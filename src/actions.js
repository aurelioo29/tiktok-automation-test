import { humanDelay, log, sleep, waitForAnySelector } from "./utils.js";

async function findLikeButton(page) {
  // TikTok DOM can vary; we keep it robust-ish
  const selectors = [
    'button[data-e2e="like-icon"]',
    'button[aria-label*="Like"]',
    'button[aria-label*="like"]',
  ];
  return await waitForAnySelector(page, selectors, 6000);
}

async function isAlreadyLiked(page, btn) {
  try {
    const pressed = await page.evaluate(
      (el) => el.getAttribute("aria-pressed"),
      btn,
    );
    if (pressed === "true") return true;
  } catch {}
  return false;
}

export async function scrollAndLike(page, likeTarget = 5) {
  let likedCount = 0;
  let safetySteps = 0;

  log("FLOW", `Start scrolling & liking. Target: ${likeTarget}`);

  await page.goto("https://www.tiktok.com", { waitUntil: "networkidle2" });
  await humanDelay(900, 1500);

  while (likedCount < likeTarget && safetySteps < 80) {
    safetySteps++;

    // let video render
    await sleep(1200);

    const likeBtn = await findLikeButton(page);

    if (likeBtn) {
      const already = await isAlreadyLiked(page, likeBtn);

      if (!already) {
        await humanDelay(250, 650);
        await likeBtn.click({ delay: 60 });
        likedCount++;
        log("LIKE", `Liked video ✅ (${likedCount}/${likeTarget})`);
        await humanDelay(900, 1500);
      } else {
        log("LIKE", "Already liked, skipping.");
      }
    } else {
      log("LIKE", "Like button not found on this view, skipping.");
    }

    // scroll next
    await humanDelay(400, 900);
    await page.keyboard.press("ArrowDown");
    log("SCROLL", "Next video (ArrowDown)");
    await humanDelay(1000, 1800);
  }

  log("DONE", `Finished. Total likes: ${likedCount}/${likeTarget}`);
}
