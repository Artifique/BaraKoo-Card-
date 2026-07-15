// Middleware Next.js pour le contrôle d'accès au Dashboard Admin
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("baarako_session")
  const { pathname } = request.nextUrl

  // 1. Protection des pages d'administration (/admin et sous-pages)
  if (pathname.startsWith("/admin")) {
    if (!session || !session.value) {
      // Pas de cookie de session -> redirection vers la page de connexion
      const loginUrl = new URL("/login", request.url)
      // Conserver la page demandée pour redirection après connexion
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Redirection des utilisateurs déjà connectés accédant à /login
  if (pathname === "/login") {
    if (session && session.value) {
      // Déjà connecté -> redirection automatique vers le tableau de bord
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

// Définition des routes à intercepter par le middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/login"
  ]
}
