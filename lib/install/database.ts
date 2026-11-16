import mariadb, { type Connection } from "mariadb";

export type DbInput = { host: string; port: number; database: string; user: string; password: string };

export function buildDatabaseUrl(d: DbInput) {
  return `mysql://${encodeURIComponent(d.user)}:${encodeURIComponent(d.password)}@${d.host}:${d.port}/${encodeURIComponent(d.database)}`;
}

export type DbCheck = { ok: boolean; message: string; version?: string; charset?: string; tables?: number };

/** Thử kết nối và kiểm tra phiên bản, bảng mã (cần utf8mb4 cho tiếng Việt), số bảng hiện có */
export async function checkDatabase(d: DbInput): Promise<DbCheck> {
  let conn: Connection | undefined;
  try {
    conn = await mariadb.createConnection({ host: d.host, port: d.port, user: d.user, password: d.password, database: d.database, connectTimeout: 8000 });
    const [info] = await conn.query("SELECT VERSION() AS version, @@character_set_database AS charset");
    const [count] = await conn.query("SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = ?", [d.database]);
    const charset = String(info.charset);
    const version = String(info.version);
    const tables = Number(count.n);
    if (!charset.startsWith("utf8mb4")) {
      return { ok: false, version, charset, tables, message: `Kết nối được, nhưng database dùng bảng mã ${charset}. Hãy tạo lại database với utf8mb4 để lưu tiếng Việt đúng.` };
    }
    return { ok: true, version, charset, tables, message: `Kết nối thành công · ${version} · ${charset}${tables ? ` · đã có ${tables} bảng` : " · database trống"}` };
  } catch (error) {
    const e = error as { code?: string; message?: string };
    const hint: Record<string, string> = {
      ER_ACCESS_DENIED_ERROR: "Sai tên đăng nhập hoặc mật khẩu database.",
      ER_BAD_DB_ERROR: "Database chưa tồn tại. Tạo database trong aaPanel › Databases trước.",
      ECONNREFUSED: "Không kết nối được tới máy chủ MySQL (kiểm tra host/port, MySQL đã chạy chưa).",
      ENOTFOUND: "Không tìm thấy host database.",
      ER_DBACCESS_DENIED_ERROR: "User không có quyền truy cập database này.",
    };
    return { ok: false, message: hint[e.code ?? ""] ?? `Không kết nối được: ${e.message ?? String(error)}` };
  } finally {
    await conn?.end().catch(() => {});
  }
}
