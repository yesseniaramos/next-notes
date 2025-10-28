import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )


  const isAuthRouter = 
  request.nextUrl.pathname === '/login' || 
  request.nextUrl.pathname === '/sign-up';

  if (isAuthRouter) {
    const { 
      data : { user } 
    } = await supabase.auth.getUser();

    if(user) {
      return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL));
    }
  }
 
  const { searchParams, pathname } = new URL(request.url);

  if ( !searchParams.get("noteId") && pathname === "/") {
    const { 
      data : { user } 
    } = await supabase.auth.getUser();

    if(user) {
      const urlFN = `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-newest-note?userId=${user.id}`;
      const { newestNoteId } = await fetch(urlFN).then((res) => res.json());

      if(newestNoteId) {
        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", newestNoteId);
        return NextResponse.redirect(url);
      }
      else {
        const urlNN = `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-new-note?userId=${user.id}`
        const { noteId } = await fetch(urlNN, 
          {
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            }
          }
        ).then((res) => res.json());

        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", noteId);
         return NextResponse.redirect(url);
      }
    }
  }
  

  

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  /*const {
    data: { user },
  } = await supabase.auth.getUser()
  */

  return supabaseResponse
}