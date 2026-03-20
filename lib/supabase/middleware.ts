import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && (!user || user.email !== process.env.SUPER_ADMIN_EMAIL)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect teacher routes
  const isTeacherRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/students") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/schedule") ||
    request.nextUrl.pathname.startsWith("/gradebook") ||
    request.nextUrl.pathname.startsWith("/practice") ||
    request.nextUrl.pathname.startsWith("/economy") ||
    request.nextUrl.pathname.startsWith("/standards");

  if (isTeacherRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect parent routes (except join page)
  const isParentRoute = request.nextUrl.pathname.startsWith("/family") &&
    !request.nextUrl.pathname.startsWith("/family/join");

  if (isParentRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const isAuthRoute = request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup";

  if (isAuthRoute && user) {
    // Check if user is a parent
    const { data: guardianRows } = await supabase
      .from("parent_guardians")
      .select("id")
      .eq("user_id", user.id)
      .not("accepted_at", "is", null)
      .limit(1);

    if (guardianRows && guardianRows.length > 0) {
      const url = request.nextUrl.clone();
      url.pathname = "/family";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
