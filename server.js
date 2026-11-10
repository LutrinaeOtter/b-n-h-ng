/** Tiny zero-dependency local server for IndexedDB support on localhost.
 * Run: node server.js  (then visit http://127.0.0.1:4173)
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname);
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.csv':'text/csv; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.md':'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end('Method Not Allowed'); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); res.end('Bad Request'); return; }
  const destination = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!destination.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.stat(destination, (err, stats) => {
    if (err || !stats.isFile()) { res.writeHead(404); res.end('Not Found'); return; }
    res.writeHead(200, { 'Content-Type':mime[path.extname(destination).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(destination).pipe(res);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`\n  ✦ GDU StockHub chạy tại http://127.0.0.1:${port}\n  Nhấn Ctrl+C để dừng máy chủ.\n`);
});
