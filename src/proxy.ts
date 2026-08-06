import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRouter =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/sign-up'

  if (isAuthRouter && user) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL))
  }

  const { searchParams, pathname } = new URL(request.url)

  if (!searchParams.get('noteId') && pathname === '/' && user) {
    const urlFN = `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-newest-note?userId=${user.id}`
    const { newestNoteId } = await fetch(urlFN).then((res) => res.json())

    if (newestNoteId) {
      const url = request.nextUrl.clone()
      url.searchParams.set('noteId', newestNoteId)
      return NextResponse.redirect(url)
    }

    const urlNN = `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-new-note?userId=${user.id}`
    const { noteId } = await fetch(urlNN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json())

    const url = request.nextUrl.clone()
    url.searchParams.set('noteId', noteId)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
