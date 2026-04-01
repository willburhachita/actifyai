import { NextResponse, type NextRequest } from "next/server";
import { auth0 } from "@/lib/auth/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    // Auth routes
    "/auth/:path*",
    // Protected app routes
    "/app/:path*",
  ],
};
