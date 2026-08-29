import { NextRequest, NextResponse } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const user = process.env.SITE_AUTH_USER ?? "";
  const password = process.env.SITE_AUTH_PASSWORD;

  if (!password) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const requestUser = decoded.slice(0, separatorIndex);
  const requestPassword = decoded.slice(separatorIndex + 1);

  return requestUser === user && requestPassword === password;
}

export function middleware(request: NextRequest) {
  if (isAuthorized(request)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Event Radar"'
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/cron).*)"]
};
