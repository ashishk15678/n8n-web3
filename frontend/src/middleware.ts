import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api-error";
import { getSessionCookie } from "better-auth/cookies";

// List of public routes that don't require authentication
const publicRoutes = ["/signin", "/signout", "/callback", "/session"];

// List of protected routes that require authentication
const protectedRoutes = [
  "/api/projects",
  "/api/admin",
  "/projects",
  "/admin-dashboard",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes
  if (pathname.startsWith("/api")) {
    // Allow public API routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // Check authentication for protected API routes
    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
      try {
        const sessionCookie = getSessionCookie(request);
        if (!sessionCookie) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 }
          );
        }

        // Add CORS headers for API routes
        const response = NextResponse.next();
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );

        return response;
      } catch (error) {
        return handleApiError(error);
      }
    }
  }

  // Handle frontend routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    try {
      const sessionCookie = getSessionCookie(request);
      if (!sessionCookie) {
        // Redirect to sign in page
        const signInUrl = new URL("/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(signInUrl);
      }
    } catch (error) {
      console.error("Auth error:", error);
      // On error, redirect to sign in page
      const signInUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes and protected frontend routes
    "/api/:path*",
    "/projects/:path*",
    "/admin-dashboard/:path*",
  ],
};
