// Cấu hình PM2 cho cucre.vn.  Chạy:  pm2 start ecosystem.config.js  ·  cập nhật: pm2 reload cucre
// Dùng 1 tiến trình (fork): đủ cho lượng truy cập ban đầu và giữ bộ đếm chặn đăng nhập sai trong bộ nhớ.
module.exports = {
  apps: [
    {
      name: "cucre",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "800M",
      env: { NODE_ENV: "production" },
      time: true,
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
    },
  ],
};
