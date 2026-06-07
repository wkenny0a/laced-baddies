const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");
const { getPublicSwellConfig } = require("./lib/swell-config");

const ROOT_DIR = __dirname;

function loadLocalEnv() {
  const envPath = path.join(ROOT_DIR, ".env");

  if (!fsSync.existsSync(envPath)) return;

  const envFile = fsSync.readFileSync(envPath, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function sendJson(response, body) {
  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function getSafeFilePath(requestUrl) {
  const url = new URL(requestUrl, `http://${HOST}:${PORT}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const pathname = decodedPath === "/" ? "/index.html" : decodedPath;
  const normalizedPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT_DIR, normalizedPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    return null;
  }

  return filePath;
}

async function serveFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || "application/octet-stream";
  const isHtmlOrCss = extension === ".html" || extension === ".css" || extension === ".js";
  const body = await fs.readFile(filePath);

  response.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": isHtmlOrCss ? "no-store" : "public, max-age=3600"
  });
  response.end(body);
}

const server = http.createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method Not Allowed");
    return;
  }

  const url = new URL(request.url, `http://${HOST}:${PORT}`);

  if (url.pathname === "/api/swell-config") {
    sendJson(response, getPublicSwellConfig());
    return;
  }

  const filePath = getSafeFilePath(request.url);

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  try {
    await serveFile(response, filePath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      try {
        await serveFile(response, path.join(ROOT_DIR, "index.html"));
      } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not Found");
      }
      return;
    }

    console.error(error);
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Laced Baddies site running at http://${HOST}:${PORT}`);
});
