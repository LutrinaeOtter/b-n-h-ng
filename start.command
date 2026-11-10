#!/bin/bash
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  (sleep 1; open 'http://127.0.0.1:4173') &
  node server.js
elif command -v python3 >/dev/null 2>&1; then
  (sleep 1; open 'http://127.0.0.1:4173') &
  python3 -m http.server 4173 --bind 127.0.0.1
else
  echo 'Cần Node.js hoặc Python 3 để lưu dữ liệu bằng IndexedDB ổn định.'
  open index.html
  read -rp 'Nhấn Enter để đóng...'
fi
