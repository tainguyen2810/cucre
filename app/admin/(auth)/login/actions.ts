"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn } from "@/lib/auth";
import { clearLoginFailures, loginBlocked, recordLoginFailure } from "@/lib/admin/auth";
import { clientIp } from "@/lib/request";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const key = clientIp(await headers()) ?? "unknown";
  if (loginBlocked(key)) return { error: "Sai quá nhiều lần. Thử lại sau 15 phút." };

  const callbackUrl = String(formData.get("callbackUrl") || "/admin");
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
    });
    clearLoginFailures(key);
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      recordLoginFailure(key);
      return { error: "Email hoặc mật khẩu không đúng." };
    }
    clearLoginFailures(key);
    throw error; // chuyển hướng khi đăng nhập thành công
  }
}
