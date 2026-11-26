/**
 * Production server for the portfolio — Node's built-in http module only, no dependencies.
 *
 *   npm run build   (creates frontend/dist)
 *   npm start       (serves it on http://localhost:3000, or $PORT)
 *
 * - Serves the built frontend with correct MIME types and caching
 *   (hashed /assets/* cached for a year; HTML always revalidated).
 * - GET /api/health for uptime checks on hosts like Render or Railway.
 * - Sends basic security headers and blocks path traversal.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(here, "../frontend/dist");
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
  res.end(body);
}

function serveFile(req, res, file) {
  const ext = path.extname(file).toLowerCase();
  const hashed = file.includes(`${path.sep}assets${path.sep}`);
  const headers = {
    ...SECURITY_HEADERS,
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
  };
  if (ext === ".pdf") headers["Content-Disposition"] = `attachment; filename="${path.basename(file)}"`;
  res.writeHead(200, headers);
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method not allowed", { Allow: "GET, HEAD" });
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return send(res, 400, "Bad request");
  }

  if (pathname === "/api/health") {
    return send(res, 200, JSON.stringify({ ok: true, uptime: Math.round(process.uptime()) }), {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
  }

  const file = path.resolve(DIST, "." + pathname);
  if (!file.startsWith(DIST)) return send(res, 403, "Forbidden");

  fs.stat(file, (err, stat) => {
    if (!err && stat.isFile()) return serveFile(req, res, file);
    // Single-page app: anything that isn't a real file gets index.html.
    const index = path.join(DIST, "index.html");
    if (fs.existsSync(index)) return serveFile(req, res, index);
    send(res, 503, "The site has not been built yet. Run `npm run build` first.", {
      "Content-Type": "text/plain; charset=utf-8",
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});
