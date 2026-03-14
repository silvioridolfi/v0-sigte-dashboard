import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas — no requieren autenticación
  const PUBLIC_ROUTES = ["/login"]
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // Crear cliente de Supabase con las cookies del request
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar sesión
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Sin sesión → redirigir a /login
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aplicar a todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon, íconos
     * - api routes internas de Next.js
     */
    "/((?!_next/static|_next/image|favicon|icon|apple-icon|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
}
