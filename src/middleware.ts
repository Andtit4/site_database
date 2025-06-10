import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tableau des routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/assets/', '/images/']

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('token')?.value
  const url = request.nextUrl.clone()
  
  // Débogage
  console.log('Middleware intercepte URL:', url.pathname);
  console.log('Token présent:', !!authToken);
  
  // Extraire la langue de l'URL (par défaut 'fr')
  const pathParts = url.pathname.split('/')
  const lang = pathParts.length > 1 ? pathParts[1] : 'fr'
  
  // Vérifier si l'utilisateur accède à une route publique
  // Inclure les routes avec la langue (ex: /fr/auth/login)
  const isPublicRoute = publicRoutes.some(route => 
    url.pathname.includes(route) || 
    url.pathname.includes(`/${lang}${route}`) ||
    url.pathname.includes(`/auth/`)
  )
  
  // Si la route est publique, permettre l'accès
  if (isPublicRoute) {
    console.log('Route publique, accès autorisé');
    return NextResponse.next()
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!authToken) {
    console.log('Utilisateur non authentifié, redirection vers login');

    // Rediriger vers la page de connexion avec la bonne langue
    return NextResponse.redirect(new URL(`/${lang}/auth/login`, request.url))
  }

  // Si l'utilisateur est authentifié, permettre l'accès à toutes les routes
  console.log('Utilisateur authentifié, accès autorisé');
  return NextResponse.next()
}

// Configurer les routes sur lesquelles le middleware s'applique
export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf aux routes statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
