#!/usr/bin/env node
/**
 * EcoKit — start the site locally and open it in the browser.
 *
 *   node scripts/dev-open.mjs              dev server (hot reload)
 *   node scripts/dev-open.mjs --prod       production build, then serve it
 *   node scripts/dev-open.mjs --lan        also reachable from your phone
 *   node scripts/dev-open.mjs --port=4000  pin a port
 *   node scripts/dev-open.mjs --no-open    don't launch the browser
 *
 * Installs dependencies on first run, picks a free port if the default is
 * taken, waits until the server actually answers before opening the browser
 * (so you never land on a connection-refused page), and shuts the server down
 * cleanly on Ctrl+C.
 */

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const IS_WIN = process.platform === "win32";

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const PROD = has("--prod") || has("--build");
const LAN = has("--lan");
const NO_OPEN = has("--no-open");
const portArg = argv.find((a) => a.startsWith("--port"));
const WANTED = Number(portArg?.split("=")[1] ?? portArg?.match(/\d+/)?.[0]) || 3000;

const c = {
  g: (s) => `\x1b[32m${s}\x1b[0m`,
  y: (s) => `\x1b[33m${s}\x1b[0m`,
  r: (s) => `\x1b[31m${s}\x1b[0m`,
  b: (s) => `\x1b[1m${s}\x1b[0m`,
  d: (s) => `\x1b[90m${s}\x1b[0m`,
};

function die(msg, hint) {
  console.error(`\n${c.r("✖")} ${msg}`);
  if (hint) console.error(`  ${c.d(hint)}`);
  process.exit(1);
}

/* ---- preflight ---------------------------------------------------------- */

const major = Number(process.versions.node.split(".")[0]);
if (major < 20) {
  die(
    `Node ${process.versions.node} is too old — this project needs Node 20 or newer.`,
    "Install the LTS build from https://nodejs.org, then run this again."
  );
}

if (!existsSync(join(ROOT, "package.json"))) {
  die(`No package.json in ${ROOT}`, "Keep this script inside the project's scripts/ folder.");
}

// Install when node_modules is missing OR when package.json has gained a
// dependency that isn't installed yet (e.g. after pulling new code).
function missingDeps() {
  try {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    return names.filter((n) => !existsSync(join(ROOT, "node_modules", ...n.split("/"))));
  } catch {
    return [];
  }
}

const missing = missingDeps();
if (missing.length > 0) {
  console.log(
    existsSync(join(ROOT, "node_modules"))
      ? `${c.y("→")} New dependencies to install (${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""})…\n`
      : `${c.y("→")} First run — installing dependencies (a few minutes, once only)…\n`
  );
  const npm = IS_WIN ? "npm.cmd" : "npm";
  const res = spawnSync(npm, ["install"], { cwd: ROOT, stdio: "inherit", shell: IS_WIN });
  if (res.status !== 0) die("npm install failed.", "Check your internet connection and try again.");
  console.log();
}

const NEXT_BIN = join(ROOT, "node_modules", "next", "dist", "bin", "next");
if (!existsSync(NEXT_BIN)) die("Next.js is not installed correctly.", "Delete node_modules and run this again.");

/* ---- pick a port -------------------------------------------------------- */

const isFree = (port) =>
  new Promise((done) => {
    const s = createServer();
    s.once("error", () => done(false));
    s.once("listening", () => s.close(() => done(true)));
    s.listen(port, "127.0.0.1");
  });

let PORT = WANTED;
for (let i = 0; i < 25; i++) {
  if (await isFree(PORT)) break;
  if (i === 0) console.log(`${c.y("→")} Port ${WANTED} is busy, looking for a free one…`);
  PORT = WANTED + i + 1;
  if (i === 24) die(`No free port between ${WANTED} and ${PORT}.`);
}

function lanAddress() {
  for (const list of Object.values(networkInterfaces())) {
    for (const n of list ?? []) {
      if (n.family === "IPv4" && !n.internal) return n.address;
    }
  }
  return null;
}

const LOCAL_URL = `http://localhost:${PORT}`;

/* ---- production build (optional) ---------------------------------------- */

function runNext(args, opts = {}) {
  return spawn(process.execPath, [NEXT_BIN, ...args], { cwd: ROOT, stdio: "inherit", ...opts });
}

if (PROD) {
  console.log(`${c.y("→")} Building for production…\n`);
  const build = spawnSync(process.execPath, [NEXT_BIN, "build"], { cwd: ROOT, stdio: "inherit" });
  if (build.status !== 0) die("The production build failed.", "Fix the errors above, then run this again.");
  console.log();
}

/* ---- start -------------------------------------------------------------- */

const mode = PROD ? "start" : "dev";
const args = [mode, "--port", String(PORT)];
if (LAN) args.push("--hostname", "0.0.0.0");

console.log(
  `${c.g("▲")} EcoKit — ${c.b(PROD ? "production build" : "dev server (hot reload)")}\n` +
    `${c.d("  " + ROOT)}\n`
);

const child = runNext(args);
child.on("error", (e) => die(`Could not start Next.js: ${e.message}`));

/* ---- wait for it to answer, then open the browser ----------------------- */

async function waitUntilUp(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) return false;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch {
      /* not listening yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function openBrowser(url) {
  try {
    const [cmd, cmdArgs] = IS_WIN
      ? ["cmd", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
    spawn(cmd, cmdArgs, { stdio: "ignore", detached: true }).unref();
  } catch {
    /* opening the browser is a convenience, never fatal */
  }
}

const up = await waitUntilUp(LOCAL_URL);

if (up) {
  const lan = LAN ? lanAddress() : null;
  console.log(
    `\n${c.g("✓")} Ready\n` +
      `    ${c.b("Local")}    ${LOCAL_URL}\n` +
      (lan ? `    ${c.b("Phone")}    http://${lan}:${PORT}  ${c.d("(same Wi-Fi)")}\n` : "") +
      (LAN && !lan ? `    ${c.y("Phone")}    no network address found\n` : "") +
      `\n${c.d("    Ctrl+C to stop")}\n`
  );
  if (!NO_OPEN) openBrowser(LOCAL_URL);
} else if (child.exitCode === null) {
  console.log(`\n${c.y("!")} Server is slow to start. Try ${LOCAL_URL} in your browser.\n`);
}

/* ---- clean shutdown ----------------------------------------------------- */

let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  if (child.exitCode === null) {
    if (IS_WIN) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else child.kill("SIGTERM");
  }
}
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });
process.on("exit", stop);
child.on("exit", (code) => process.exit(code ?? 0));
