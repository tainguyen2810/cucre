#!/usr/bin/env bash
# Cập nhật cucre.vn lên phiên bản mới nhất trên nhánh main.
# Chạy trên server:  cd /www/wwwroot/cucre && bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Lấy code mới"
git fetch --quiet origin main
git reset --hard origin/main

echo "==> Cài thư viện (tự sinh Prisma client)"
npm ci --no-audit --no-fund

echo "==> Áp migration database"
npx prisma migrate deploy

echo "==> Build"
npm run build

echo "==> Khởi động lại"
mkdir -p logs
if pm2 describe cucre >/dev/null 2>&1; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "==> Kiểm tra"
sleep 3
curl -fsS http://127.0.0.1:3000/api/health && echo && echo "Xong."
