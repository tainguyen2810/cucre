"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, CircleAlert, CircleCheck, CircleX, Copy, Loader2 } from "lucide-react";
import { install, runSystemChecks, testDatabase, verifyToken, type InstallResult } from "./actions";
import { Field, TextInput } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Check as SysCheck } from "@/lib/install/system";

const STEPS = ["Mã cài đặt", "Kiểm tra máy chủ", "Database", "Website & admin", "Kết nối thêm", "Cài đặt"];

type Form = {
  host: string; port: string; database: string; user: string; password: string;
  siteUrl: string; uploadDir: string; zaloUrl: string;
  adminEmail: string; adminPassword: string; adminPassword2: string;
  accesstradeKey: string; telegramToken: string; telegramChatId: string; turnstileSiteKey: string; turnstileSecretKey: string;
};

function Status({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  if (ok === null) return null;
  return (
    <p role="status" className={cn("flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm", ok ? "bg-ok-bg text-ok" : "bg-brand-soft text-brand-hover")}>
      {ok ? <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden /> : <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <span>{children}</span>
    </p>
  );
}

function CopyBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">{label}</p>
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1 rounded-md border border-line-strong px-2.5 text-xs font-bold hover:bg-canvas"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />} {copied ? "Đã chép" : "Chép"}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto rounded-lg bg-ink p-3 text-xs leading-relaxed text-white">{text}</pre>
    </div>
  );
}

export function Wizard({ tokenVerified, defaults, appDir }: { tokenVerified: boolean; defaults: { siteUrl: string; uploadDir: string }; appDir: string }) {
  const [step, setStep] = useState(tokenVerified ? 1 : 0);
  const [pending, start] = useTransition();
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checks, setChecks] = useState<SysCheck[] | null>(null);
  const [dbOk, setDbOk] = useState(false);
  const [result, setResult] = useState<InstallResult | null>(null);
  const [f, setF] = useState<Form>({
    host: "localhost", port: "3306", database: "cucre", user: "cucre", password: "",
    siteUrl: defaults.siteUrl, uploadDir: defaults.uploadDir, zaloUrl: "",
    adminEmail: "", adminPassword: "", adminPassword2: "",
    accesstradeKey: "", telegramToken: "", telegramChatId: "", turnstileSiteKey: "", turnstileSecretKey: "",
  });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    if (["host", "port", "database", "user", "password"].includes(k)) setDbOk(false);
  };
  const go = (n: number) => {
    setMsg(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const db = { host: f.host, port: f.port, database: f.database, user: f.user, password: f.password };

  useEffect(() => {
    if (step === 1 && !checks) start(async () => {
      const r = await runSystemChecks(defaults.uploadDir);
      if (r.message) { setMsg({ ok: false, text: r.message }); setStep(0); }
      else setChecks(r.checks ?? []);
    });
  }, [step, checks, defaults.uploadDir]);

  const requiredFailed = checks?.some((c) => c.required && !c.ok);

  return (
    <div className="flex flex-col gap-6">
      {/* Thanh bước */}
      <ol className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0" aria-label="Các bước cài đặt">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold", i === step ? "bg-ink text-white" : i < step ? "bg-ok-bg text-ok" : "bg-placeholder text-muted")}>
            <span className="tabular-nums">{i < step ? "✓" : i + 1}</span> {s}
          </li>
        ))}
      </ol>

      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 md:p-6">
        {step === 0 && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await verifyToken(token);
                if (r.ok) go(1);
                else setMsg({ ok: false, text: r.message ?? "Sai mã" });
              });
            }}
          >
            <h2 className="text-xl font-extrabold">Nhập mã cài đặt</h2>
            <p className="text-sm text-muted">Để chắc chắn chỉ chủ server mới cài được web, mở Terminal của aaPanel và chạy một trong hai lệnh sau để lấy mã:</p>
            <CopyBlock label="Lệnh lấy mã" text={`cat ${appDir}/.setup-token\n# hoặc xem trong log:\npm2 logs cucre --lines 50`} />
            <Field label="Mã cài đặt (24 ký tự)" htmlFor="token">
              <TextInput id="token" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" spellCheck={false} className="font-mono" required />
            </Field>
            {msg ? <Status ok={msg.ok}>{msg.text}</Status> : null}
            <Button type="submit" disabled={pending} className="self-start">{pending ? "Đang kiểm tra…" : "Tiếp tục"}</Button>
          </form>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-extrabold">Kiểm tra máy chủ</h2>
            {!checks ? (
              <p className="flex items-center gap-2 text-muted"><Loader2 className="size-4 animate-spin" aria-hidden /> Đang kiểm tra…</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-start gap-2 text-sm">
                    {c.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden /> : c.required ? <CircleX className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />}
                    <span><b>{c.label}:</b> <span className="text-muted">{c.detail}</span></span>
                  </li>
                ))}
              </ul>
            )}
            {requiredFailed ? <Status ok={false}>Cần xử lý các mục đánh dấu đỏ rồi tải lại trang.</Status> : null}
            <Button disabled={!checks || requiredFailed} onClick={() => go(2)} className="self-start">Tiếp tục</Button>
          </div>
        )}

        {step === 2 && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const r = await testDatabase(db);
                setDbOk(r.ok);
                setMsg({ ok: r.ok, text: r.message });
              });
            }}
          >
            <h2 className="text-xl font-extrabold">Kết nối database MySQL</h2>
            <p className="text-sm text-muted">Tạo database trước trong <b>aaPanel › Databases › Add database</b> (bảng mã <b>utf8mb4</b>), rồi điền thông tin vào đây.</p>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <Field label="Host" htmlFor="host"><TextInput id="host" value={f.host} onChange={set("host")} required /></Field>
              <Field label="Cổng" htmlFor="port"><TextInput id="port" value={f.port} onChange={set("port")} inputMode="numeric" required /></Field>
            </div>
            <Field label="Tên database" htmlFor="database"><TextInput id="database" value={f.database} onChange={set("database")} required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="User" htmlFor="user"><TextInput id="user" value={f.user} onChange={set("user")} autoComplete="off" required /></Field>
              <Field label="Mật khẩu" htmlFor="password"><TextInput id="password" type="password" value={f.password} onChange={set("password")} autoComplete="new-password" /></Field>
            </div>
            {msg ? <Status ok={msg.ok}>{msg.text}</Status> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant={dbOk ? "light" : "dark"} disabled={pending}>{pending ? "Đang thử…" : "Kiểm tra kết nối"}</Button>
              <Button type="button" disabled={!dbOk} onClick={() => go(3)}>Tiếp tục</Button>
              <Button type="button" variant="light" onClick={() => go(1)}>Quay lại</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (f.adminPassword !== f.adminPassword2) return setMsg({ ok: false, text: "Hai lần nhập mật khẩu admin không khớp." });
              if (f.adminPassword.length < 10) return setMsg({ ok: false, text: "Mật khẩu admin tối thiểu 10 ký tự." });
              start(async () => {
                const r = await runSystemChecks(f.uploadDir);
                const up = r.checks?.find((c) => c.label === "Thư mục ảnh upload");
                if (!up?.ok) return setMsg({ ok: false, text: `Không dùng được thư mục ảnh: ${up?.detail ?? r.message}` });
                go(4);
              });
            }}
          >
            <h2 className="text-xl font-extrabold">Website & tài khoản quản trị</h2>
            <Field label="Địa chỉ web" htmlFor="siteUrl" hint="Dùng cho sitemap, link chia sẻ. Đổi sau được trong .env (SITE_URL)."><TextInput id="siteUrl" type="url" value={f.siteUrl} onChange={set("siteUrl")} required /></Field>
            <Field label="Thư mục lưu ảnh upload" htmlFor="uploadDir" hint="Nằm ngoài thư mục code. Nginx sẽ phục vụ thư mục này ở /uploads/."><TextInput id="uploadDir" value={f.uploadDir} onChange={set("uploadDir")} required className="font-mono text-sm" /></Field>
            <Field label="Link Zalo (không bắt buộc)" htmlFor="zaloUrl" hint="Nút “Nhận deal qua Zalo” ở đầu trang"><TextInput id="zaloUrl" type="url" value={f.zaloUrl} onChange={set("zaloUrl")} placeholder="https://zalo.me/..." /></Field>
            <hr className="border-line" />
            <Field label="Email admin" htmlFor="adminEmail"><TextInput id="adminEmail" type="email" value={f.adminEmail} onChange={set("adminEmail")} autoComplete="username" required /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mật khẩu admin (≥ 10 ký tự)" htmlFor="adminPassword"><TextInput id="adminPassword" type="password" value={f.adminPassword} onChange={set("adminPassword")} autoComplete="new-password" required minLength={10} /></Field>
              <Field label="Nhập lại mật khẩu" htmlFor="adminPassword2"><TextInput id="adminPassword2" type="password" value={f.adminPassword2} onChange={set("adminPassword2")} autoComplete="new-password" required /></Field>
            </div>
            {msg ? <Status ok={msg.ok}>{msg.text}</Status> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>{pending ? "Đang kiểm tra…" : "Tiếp tục"}</Button>
              <Button type="button" variant="light" onClick={() => go(2)}>Quay lại</Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-extrabold">Kết nối thêm <span className="text-base font-semibold text-muted">(bỏ qua được, điền sau trong .env)</span></h2>
            <Field label="Accesstrade API key" htmlFor="accesstradeKey" hint="Tự nhập mã giảm giá (luôn chờ bạn duyệt)"><TextInput id="accesstradeKey" value={f.accesstradeKey} onChange={set("accesstradeKey")} autoComplete="off" /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Telegram bot token" htmlFor="telegramToken" hint="Lấy từ @BotFather"><TextInput id="telegramToken" value={f.telegramToken} onChange={set("telegramToken")} autoComplete="off" /></Field>
              <Field label="Telegram kênh" htmlFor="telegramChatId" hint="@ten_kenh hoặc -100…"><TextInput id="telegramChatId" value={f.telegramChatId} onChange={set("telegramChatId")} autoComplete="off" /></Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Turnstile site key" htmlFor="turnstileSiteKey" hint="Chống spam form (Cloudflare, miễn phí)"><TextInput id="turnstileSiteKey" value={f.turnstileSiteKey} onChange={set("turnstileSiteKey")} autoComplete="off" /></Field>
              <Field label="Turnstile secret key" htmlFor="turnstileSecretKey"><TextInput id="turnstileSecretKey" value={f.turnstileSecretKey} onChange={set("turnstileSecretKey")} autoComplete="off" /></Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => go(5)}>Tiếp tục</Button>
              <Button variant="light" onClick={() => go(3)}>Quay lại</Button>
            </div>
          </div>
        )}

        {step === 5 && !result?.ok && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-extrabold">Xác nhận và cài đặt</h2>
            <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[180px_1fr]">
              <dt className="text-muted">Database</dt><dd className="font-mono">{f.user}@{f.host}:{f.port}/{f.database}</dd>
              <dt className="text-muted">Địa chỉ web</dt><dd>{f.siteUrl}</dd>
              <dt className="text-muted">Thư mục ảnh</dt><dd className="font-mono">{f.uploadDir}</dd>
              <dt className="text-muted">Admin</dt><dd>{f.adminEmail}</dd>
              <dt className="text-muted">Kết nối thêm</dt><dd>{[f.accesstradeKey && "Accesstrade", f.telegramToken && "Telegram", f.turnstileSiteKey && "Turnstile", f.zaloUrl && "Zalo"].filter(Boolean).join(", ") || "Chưa có"}</dd>
            </dl>
            <p className="text-sm text-muted">Wizard sẽ: tạo bảng dữ liệu, tạo tài khoản admin, lưu file <code>.env</code>, rồi tự khởi động lại web. Sau đó trang này bị khóa.</p>
            {result && !result.ok ? (
              <div className="flex flex-col gap-2">
                <Status ok={false}>{result.message}</Status>
                <ul className="flex flex-col gap-1 text-sm">
                  {result.steps?.map((s) => (
                    <li key={s.label} className="flex flex-col"><span className="flex items-center gap-1.5 font-semibold">{s.ok ? <CircleCheck className="size-4 text-ok" aria-hidden /> : <CircleX className="size-4 text-brand" aria-hidden />}{s.label}</span>{s.detail ? <pre className="ml-6 overflow-x-auto text-xs whitespace-pre-wrap text-muted">{s.detail}</pre> : null}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await install({ db, siteUrl: f.siteUrl, uploadDir: f.uploadDir, zaloUrl: f.zaloUrl, adminEmail: f.adminEmail, adminPassword: f.adminPassword, accesstradeKey: f.accesstradeKey, telegramToken: f.telegramToken, telegramChatId: f.telegramChatId, turnstileSiteKey: f.turnstileSiteKey, turnstileSecretKey: f.turnstileSecretKey });
                    setResult(r);
                  })
                }
              >
                {pending ? "Đang cài đặt… (có thể mất 1 phút)" : "Cài đặt ngay"}
              </Button>
              <Button variant="light" disabled={pending} onClick={() => go(4)}>Quay lại</Button>
            </div>
          </div>
        )}

        {step === 5 && result?.ok && <Done result={result} adminEmail={f.adminEmail} />}
      </section>
    </div>
  );
}

function Done({ result, adminEmail }: { result: InstallResult; adminEmail: string }) {
  const [ready, setReady] = useState(!result.restarting);
  useEffect(() => {
    if (!result.restarting) return;
    let stop = false;
    const tick = async () => {
      await new Promise((r) => setTimeout(r, 2500));
      while (!stop) {
        try {
          const res = await fetch("/api/health", { cache: "no-store" });
          if (res.ok) return setReady(true);
        } catch {}
        await new Promise((r) => setTimeout(r, 2000));
      }
    };
    tick();
    return () => {
      stop = true;
    };
  }, [result.restarting]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <CircleCheck className="size-7 text-ok" aria-hidden />
        <h2 className="text-xl font-extrabold">Cài đặt xong!</h2>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {result.steps?.map((s) => (
          <li key={s.label} className="flex items-start gap-1.5"><CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden /><span className="min-w-0 break-words [overflow-wrap:anywhere]"><b>{s.label}</b>{s.detail ? <span className="text-muted"> – {s.detail}</span> : null}</span></li>
        ))}
      </ul>
      {result.restarting ? (
        ready ? <Status ok>Web đã khởi động lại với cấu hình mới.</Status> : <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin" aria-hidden /> Đang khởi động lại web…</p>
      ) : (
        <Status ok={false}>Web không chạy bằng PM2 nên không tự khởi động lại. Hãy khởi động lại app (pm2 restart cucre hoặc chạy lại lệnh start) để nạp cấu hình.</Status>
      )}

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-extrabold">Việc còn lại trên aaPanel</h3>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
          <li><b>Website › cucre.vn › Config</b>: thay bằng cấu hình Nginx bên dưới (phục vụ ảnh, cache, chặn file ẩn).</li>
          <li><b>SSL › Let&apos;s Encrypt</b>: chọn tên miền → Apply → bật <b>Force HTTPS</b>.</li>
          <li><b>Cron</b>: thêm các tác vụ bên dưới (loại Shell Script).</li>
          <li>Khai báo website với Google Search Console, gửi <code>/sitemap.xml</code>.</li>
        </ol>
        {result.nginx ? <CopyBlock label="Cấu hình Nginx" text={result.nginx} /> : null}
        {result.cron ? <CopyBlock label="Tác vụ cron" text={result.cron} /> : null}
      </div>
      <a href="/admin/login" aria-disabled={!ready} className={cn("inline-flex min-h-12 items-center justify-center self-start rounded-lg px-5 font-bold text-white", ready ? "bg-brand hover:bg-brand-hover" : "pointer-events-none bg-line-strong")}>
        Vào trang quản trị ({adminEmail})
      </a>
    </div>
  );
}
