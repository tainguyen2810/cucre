#!/usr/bin/env bash
# Sao lưu database cucre.vn mỗi ngày, giữ 14 bản gần nhất.
# Cron aaPanel (Shell Script, 03:15 hằng ngày):  bash /www/wwwroot/cucre/scripts/backup-mysql.sh
# Đổi nơi lưu: BACKUP_DIR=/www/backup/cucre  ·  Đổi số bản giữ lại: KEEP_DAYS=30
set -euo pipefail
cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/www/backup/cucre}"
KEEP_DAYS="${KEEP_DAYS:-14}"

# Đọc DATABASE_URL từ .env: mysql://USER:PASS@HOST:PORT/DB
URL=$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
[[ "$URL" =~ ^mysql://([^:]+):([^@]*)@([^:/]+)(:([0-9]+))?/([^?]+) ]] || { echo "Không đọc được DATABASE_URL trong .env"; exit 1; }
DB_USER=$(printf '%b' "${BASH_REMATCH[1]//%/\\x}")
DB_PASS=$(printf '%b' "${BASH_REMATCH[2]//%/\\x}")
DB_HOST="${BASH_REMATCH[3]}"
DB_PORT="${BASH_REMATCH[5]:-3306}"
DB_NAME="${BASH_REMATCH[6]}"

mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/${DB_NAME}-$(date +%Y%m%d-%H%M).sql.gz"

# Truyền mật khẩu qua file tạm (không lộ trên danh sách tiến trình)
CNF=$(mktemp)
trap 'rm -f "$CNF"' EXIT
chmod 600 "$CNF"
printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n' "$DB_USER" "$DB_PASS" "$DB_HOST" "$DB_PORT" > "$CNF"

mysqldump --defaults-extra-file="$CNF" --single-transaction --quick --routines --default-character-set=utf8mb4 "$DB_NAME" | gzip -9 > "$FILE"
chmod 600 "$FILE"

find "$BACKUP_DIR" -name "${DB_NAME}-*.sql.gz" -mtime +"$KEEP_DAYS" -delete
echo "[$(date '+%F %T')] Đã sao lưu: $FILE ($(du -h "$FILE" | cut -f1))"
