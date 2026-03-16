import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

rmSync("release", { recursive: true, force: true });

execSync("npm version patch", { stdio: "inherit" });
execSync("npm run build:renderer", { stdio: "inherit" });
execSync("npm run build:electron", { stdio: "inherit" });
execSync("npx electron-builder --publish always", { stdio: "inherit" });
execSync("git push --follow-tags", { stdio: "inherit" });

