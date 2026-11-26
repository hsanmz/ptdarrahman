#!/usr/bin/env node
/**
 * Lightweight SPA Static File Server (Zero Dependencies)
 * Serves single-page applications with HTML5 history fallback (SPA routing).
 * 
 * Usage: node spa-server.js <port> <static_root_directory>
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = parseInt(process.argv[2] || "8080", 10);
const rootDir = path.resolve(process.argv[3] || ".");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".wasm": "application/wasm",
  ".pdf": "application/pdf",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

const server = http.createServer((req, res) => {
  // Hanya layani GET dan HEAD
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method Not Allowed");
  }

  // Parse path tanpa query string
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  let filePath = path.join(rootDir, urlPath);

  // Pencegahan Directory Traversal
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    // Jika path adalah direktori, cari index.html
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      return serveFile(filePath, req, res, true);
    }

    // Jika file ditemukan, layani file
    if (!err && stats.isFile()) {
      return serveFile(filePath, req, res, false);
    }

    // SPA fallback: Jika file tidak ditemukan, fallback ke /index.html
    const fallbackPath = path.join(rootDir, "index.html");
    serveFile(fallbackPath, req, res, true);
  });
});

function serveFile(filePath, req, res, isFallback) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not Found");
    }

    const headers = {
      "Content-Type": contentType,
      "Content-Length": stats.size,
    };

    // Cache-Control: Hashed assets dapat di-cache lama; index.html tidak boleh di-cache
    if (ext === ".html" || isFallback) {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    } else {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      return res.end();
    }

    fs.createReadStream(filePath).pipe(res);
  });
}

server.listen(port, "0.0.0.0", () => {
  console.log(`[SPA Server] Serving ${rootDir} on http://0.0.0.0:${port}`);
});
