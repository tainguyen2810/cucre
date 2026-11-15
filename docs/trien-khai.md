# Triển khai cucre.vn lên server aaPanel

Hướng dẫn cho server Linux đã cài aaPanel. Ví dụ dùng thư mục code `/www/wwwroot/cucre`, thư mục ảnh `/www/cucre-uploads`, thư mục sao lưu `/www/backup/cucre`. Đổi theo server của bạn.

Các file liên quan trong repo:

| File | Dùng để |
| --- | --- |
| `ecosystem.config.js` | Cấu hình PM2 (chạy app ở `127.0.0.1:3000`) |
| `deploy/nginx-cucre.conf` | Cấu hình Nginx: reverse proxy, phục vụ `/uploads/`, cache file tĩnh, chặn file ẩn |
| `scripts/deploy.sh` | Cập nhật phiên bản mới: pull, cài thư viện, migrate, build, reload |
| `scripts/backup-mysql.sh` | Sao lưu MySQL nén gzip, giữ 14 bản |
| `scripts/create-admin.ts` | Tạo/đặt lại mật khẩu admin trên production |
| `/api/health` | Kiểm tra app + database còn sống |

---

## 1. Chuẩn bị (làm một lần)

### 1.1 Tên miền
Trỏ bản ghi DNS về IP server:
- `A  cucre.vn  →  IP server`
- `A  www      →  IP server` (hoặc CNAME về `cucre.vn`)

### 1.2 Phần mềm trên aaPanel
Vào **App Store** và cài:
- **Nginx** (bản ổn định mới nhất)
- **MySQL 8.0**
- **Node.js version manager** → cài **Node 22 LTS** (tối thiểu 20.19)
- **PM2 Manager** (hoặc cài tay: `npm i -g pm2`)

Kiểm tra trong Terminal của aaPanel:

```bash
node -v && npm -v && pm2 -v
```

### 1.3 Database
**Databases › Add database**:
- Tên DB: `cucre`, user: `cucre`, mật khẩu mạnh
- Charset: **utf8mb4** (bắt buộc để lưu tiếng Việt)

> Trên production chỉ chạy `prisma migrate deploy`, không cần quyền tạo database tạm như khi chạy local.

### 1.4 Lấy code từ GitHub
Repo là private, nên dùng **deploy key** (khóa chỉ đọc):

```bash
ssh-keygen -t ed25519 -C "cucre-server" -f ~/.ssh/cucre_deploy -N ""
cat ~/.ssh/cucre_deploy.pub
```

Dán khóa công khai vào GitHub: repo **Settings › Deploy keys › Add deploy key** (không tick "Allow write access"). Sau đó:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github-cucre
  HostName github.com
  IdentityFile ~/.ssh/cucre_deploy
EOF
git clone git@github-cucre:tainguyen2810/cucre.git /www/wwwroot/cucre
```

### 1.5 File `.env`

```bash
cd /www/wwwroot/cucre
cp .env.example .env
nano .env
```

Điền:

```ini
DATABASE_URL="mysql://cucre:MAT_KHAU_DB@localhost:3306/cucre"
AUTH_SECRET="...chuỗi ngẫu nhiên..."         # tạo bằng: openssl rand -base64 32
NEXT_PUBLIC_SITE_URL="https://cucre.vn"
UPLOAD_DIR="/www/cucre-uploads"
NEXT_PUBLIC_ZALO_URL="https://zalo.me/..."   # link Zalo OA/nhóm, có thể điền sau
```

> Mật khẩu DB có ký tự đặc biệt (`@ : / # ?`) thì phải mã hóa URL, ví dụ `@` → `%40`.
> Biến bắt đầu bằng `NEXT_PUBLIC_` được gắn vào lúc build: đổi giá trị thì phải build lại (`bash scripts/deploy.sh`).

Bảo vệ file:

```bash
chmod 600 .env
mkdir -p /www/cucre-uploads && chmod 755 /www/cucre-uploads
```

### 1.6 Build và chạy lần đầu

```bash
cd /www/wwwroot/cucre
npm ci
npx prisma migrate deploy
npm run build
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup        # làm theo lệnh nó in ra để PM2 tự chạy lại khi server khởi động lại
curl http://127.0.0.1:3000/api/health
```

Kết quả đúng: `{"ok":true,"db":"ok",...}`.

> **Không chạy `npm run db:seed` trên production**: lệnh này xóa toàn bộ dữ liệu nội dung để nạp dữ liệu mẫu (đã có chặn khi `NODE_ENV=production`).

### 1.7 Tạo tài khoản quản trị

```bash
ADMIN_PASSWORD='mat-khau-that-manh' npm run admin:create -- ban@cucre.vn
```

Chạy lại cùng email để đặt lại mật khẩu khi quên.

### 1.8 Nginx và SSL
1. **Website › Add site**: domain `cucre.vn` và `www.cucre.vn`, PHP: **Pure static**.
2. Mở **Config** của site, thay nội dung bằng `deploy/nginx-cucre.conf` (giữ lại phần SSL nếu aaPanel đã thêm). Sửa đường dẫn `/www/cucre-uploads/` nếu khác.
3. **SSL › Let's Encrypt**: chọn cả 2 tên miền → Apply. Bật **Force HTTPS**.
4. Mở https://cucre.vn và https://cucre.vn/admin/login để kiểm tra.

Nếu server không có IPv6 mà Nginx báo lỗi `[::]:80`, xóa dòng `listen [::]:80;`.

### 1.9 Cron (aaPanel › Cron)

| Tên | Loại | Lịch | Lệnh |
| --- | --- | --- | --- |
| Hết hạn deal/mã | Shell Script | Mỗi giờ, phút 5 | `cd /www/wwwroot/cucre && npm run job:expire >> logs/cron.log 2>&1` |
| Sao lưu DB | Shell Script | Hằng ngày 03:15 | `bash /www/wwwroot/cucre/scripts/backup-mysql.sh >> /www/wwwroot/cucre/logs/backup.log 2>&1` |
| Sao lưu ảnh | Backup Directory | Hằng tuần | Thư mục `/www/cucre-uploads` |

Nên tải bản sao lưu ra ngoài server định kỳ (aaPanel hỗ trợ đẩy lên Google Drive, S3...).

---

## 2. Cập nhật phiên bản mới

Sau khi code mới được gộp vào nhánh `main`:

```bash
cd /www/wwwroot/cucre && bash scripts/deploy.sh
```

Script sẽ: lấy code mới nhất, `npm ci`, `prisma migrate deploy`, build, `pm2 reload`, rồi gọi `/api/health`. Nếu build lỗi, script dừng lại và bản đang chạy vẫn giữ nguyên.

> `deploy.sh` dùng `git reset --hard origin/main`: mọi thay đổi sửa tay trong thư mục code trên server sẽ bị ghi đè. Cấu hình riêng chỉ để trong `.env` (không bị ghi đè).

---

## 3. Khôi phục từ bản sao lưu

```bash
gunzip -c /www/backup/cucre/cucre-20261115-0315.sql.gz | mysql -u cucre -p cucre
```

---

## 4. Theo dõi và xử lý sự cố

| Việc | Lệnh |
| --- | --- |
| Trạng thái app | `pm2 status` |
| Xem log | `pm2 logs cucre --lines 100` (hoặc `logs/pm2-error.log`) |
| Khởi động lại | `pm2 restart cucre` |
| App còn sống? | `curl https://cucre.vn/api/health` – dùng cho UptimeRobot/BetterStack |
| Log Nginx | `/www/wwwlogs/cucre.vn.error.log` |

Lỗi thường gặp:
- **502 Bad Gateway**: app chưa chạy → `pm2 status`, xem `pm2 logs cucre`.
- **Ảnh tải lên không hiện**: sai `UPLOAD_DIR` trong `.env` hoặc sai `alias` trong Nginx; hai đường dẫn phải trùng nhau.
- **Đăng nhập admin báo lỗi cấu hình**: thiếu `AUTH_SECRET` trong `.env`.
- **Lỗi font chữ tiếng Việt trong DB (dấu hỏi chấm)**: database không phải `utf8mb4`.

---

## 5. Sau khi lên mạng
- Khai báo https://cucre.vn trong **Google Search Console**, gửi `https://cucre.vn/sitemap.xml`.
- Theo dõi uptime bằng `/api/health`.
