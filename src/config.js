import dotenv from "dotenv";
dotenv.config();

export const config = {
  email: process.env.TIKTOK_EMAIL || "",
  password: process.env.TIKTOK_PASSWORD || "",
  likeTarget: Number(process.env.LIKE_TARGET || 5),
  headless: (process.env.HEADLESS || "false").toLowerCase() === "true",
  cookiesPath: process.env.COOKIES_PATH || "./tiktok-cookies.json",
};
