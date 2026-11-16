#!/usr/bin/env bash
# Chuẩn bị cucre.vn trên server mới rồi mở wizard cài đặt trên trình duyệt.
# Dùng sau khi đã clone code:  cd /www/wwwroot/cucre && bash scripts/bootstrap.sh
set -euo pipefail
cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Chưa có Node.js. Cài Node 22 trong aaPanel › App Store › Node.js version manager."; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 20 ] || { echo "Cần Node 20.19+ (đang có $(node -v))."; exit 1; }
command -v pm2 >/dev/null || { echo "==> Cài PM2"; npm i -g pm2; }

echo "==> Cài thư viện"
npm ci --no-audit --no-fund
echo "==> Build"
npm run build
echo "==> Chạy bằng PM2"
mkdir -p logs
if pm2 describe cucre >/dev/null 2>&1; then pm2 reload ecosystem.config.js --update-env; else pm2 start ecosystem.config.js; fi
pm2 save
sleep 3
curl -s -o /dev/null http://127.0.0.1:3000/cai-dat || true   # tạo mã cài đặt

cat <<MSG

Xong phần chuẩn bị. Tiếp theo:
  1. aaPanel › Website › Add site cho tên miền, rồi bật Reverse proxy tới http://127.0.0.1:3000
  2. Mở  http://<ten-mien>/cai-dat  trên trình duyệt
  3. Mã cài đặt:  $(cat .setup-token 2>/dev/null || echo "(chạy: cat $(pwd)/.setup-token)")
  4. Để PM2 tự chạy lại khi server khởi động lại:  pm2 startup  (làm theo lệnh nó in ra)
MSG
