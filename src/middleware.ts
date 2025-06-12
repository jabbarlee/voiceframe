import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"];

  // Skip middleware for public routes, API routes, and static files
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = req.cookies.get("session")?.value;

  if (!sessionCookie) {
    console.log("No session cookie found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // For protected routes, verify session via API call
  try {
    const verifyResponse = await fetch(new URL("/api/auth/verify", req.url), {
      method: "GET",
      headers: {
        Cookie: req.headers.get("cookie") || "",
      },
    });

    if (!verifyResponse.ok) {
      console.log("Session verification failed, redirecting to login");
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("session");
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.log("Session verification error:", error);
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
