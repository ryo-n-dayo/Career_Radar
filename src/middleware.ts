import { NextRequest, NextResponse } from "next/server";

/** タイミング差で正解パスワードを推測されないよう、長さに依らず全文字を比較する */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function hasBasicAuth(request: NextRequest, expectedUser: string, expectedPassword: string): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  let decoded: string;
  try {
    decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const requestUser = decoded.slice(0, separatorIndex);
  const requestPassword = decoded.slice(separatorIndex + 1);

  return safeEqual(requestUser, expectedUser) && safeEqual(requestPassword, expectedPassword);
}

function unauthorized(realm: string): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${realm}"` }
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 管理画面 ───
  // ADMIN_PASSWORD 未設定なら 401 ではなく 404 を返して機能ごと無効化する。
  // 設定漏れのまま公開サイトに管理画面が露出する事故を防ぐため。
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const adminUser = process.env.ADMIN_USER ?? "";
    if (!hasBasicAuth(request, adminUser, adminPassword)) {
      return unauthorized("Event Radar Admin");
    }
    return NextResponse.next();
  }

  // ─── サイト全体（ステージング保護用・任意） ───
  // 一般公開時は SITE_AUTH_PASSWORD を未設定にする。
  const sitePassword = process.env.SITE_AUTH_PASSWORD;
  if (!sitePassword) {
    return NextResponse.next();
  }

  const siteUser = process.env.SITE_AUTH_USER ?? "";
  if (!hasBasicAuth(request, siteUser, sitePassword)) {
    return unauthorized("Event Radar");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron).*)"]
};
