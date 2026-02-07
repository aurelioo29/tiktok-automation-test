import "dotenv/config";

export const config = {
  edgePath:
    process.env.EDGE_PATH ||
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",

  // ✅ profile khusus project (default)
  userDataDir:
    process.env.EDGE_USER_DATA_DIR ||
    "E:\\Coding\\tiktok-automation-test\\.edge-profile",

  likeTarget: Number(process.env.LIKE_TARGET || 8),
  maxSteps: Number(process.env.MAX_STEPS || 60),
};
