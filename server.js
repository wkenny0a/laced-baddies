const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");
const crypto = require("node:crypto");
const https = require("node:https");
const { getPublicSwellConfig } = require("./lib/swell-config");

function hashValue(val) {
  if (!val) return null;
  const normalized = val.trim().toLowerCase().replace(/\s+/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function hashPhone(val) {
  if (!val) return null;
  const normalized = val.trim().replace(/\D/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function hashGeneric(val) {
  if (!val) return null;
  const normalized = val.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

async function sendMetaCapiEvent(payload, request) {
  const pixelId = process.env.META_PIXEL_ID || "1656782318888778";
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn("Meta CAPI warning: META_ACCESS_TOKEN environment variable is missing. CAPI tracking is disabled.");
    return { status: "skipped", reason: "missing_access_token" };
  }

  const clientIp = request.headers["x-forwarded-for"] || request.socket.remoteAddress || "";
  const userAgent = request.headers["user-agent"] || "";

  const userData = {};
  if (payload.user_data?.email) userData.em = [hashValue(payload.user_data.email)];
  if (payload.user_data?.phone) userData.ph = [hashPhone(payload.user_data.phone)];
  if (payload.user_data?.first_name) userData.fn = [hashGeneric(payload.user_data.first_name)];
  if (payload.user_data?.last_name) userData.ln = [hashGeneric(payload.user_data.last_name)];
  if (payload.user_data?.city) userData.ct = [hashGeneric(payload.user_data.city)];
  if (payload.user_data?.state) userData.st = [hashGeneric(payload.user_data.state)];
  if (payload.user_data?.zip) userData.zp = [hashGeneric(payload.user_data.zip)];
  if (payload.user_data?.country) {
    userData.country = [hashGeneric(payload.user_data.country)];
  } else if (payload.user_data?.email || payload.user_data?.phone) {
    userData.country = [hashGeneric("us")];
  }

  if (payload.user_data?.fbp) userData.fbp = payload.user_data.fbp;
  if (payload.user_data?.fbc) userData.fbc = payload.user_data.fbc;

  userData.client_ip_address = clientIp;
  userData.client_user_agent = userAgent;

  const capiPayload = {
    data: [
      {
        event_name: payload.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.event_id,
        action_source: "website",
        event_source_url: payload.event_source_url || "",
        user_data: userData,
        custom_data: payload.custom_data || {}
      }
    ]
  };

  const testCode = process.env.META_TEST_EVENT_CODE || payload.test_event_code;
  if (testCode) {
    capiPayload.test_event_code = testCode;
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(capiPayload);
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const req = https.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Meta API error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on("error", (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

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
  const url = new URL(request.url, `http://${HOST}:${PORT}`);

  if (request.method === "POST" && url.pathname === "/api/meta-capi") {
    let body = "";
    request.on("data", chunk => {
      body += chunk.toString();
    });
    request.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const capiResponse = await sendMetaCapiEvent(payload, request);
        response.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        response.end(JSON.stringify({ status: "success", data: capiResponse }));
      } catch (error) {
        console.error("Meta CAPI Server Error:", error);
        response.writeHead(400, {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        });
        response.end(JSON.stringify({ status: "error", message: error.message }));
      }
    });
    return;
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Method Not Allowed");
    return;
  }

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
