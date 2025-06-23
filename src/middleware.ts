import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Tableau des routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/assets/', '/images/']

// Fonction pour vérifier si un token JWT est expiré
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp && payload.exp < currentTime;
  } catch (error) {
    console.error('Middleware: Erreur lors de la vérification d\'expiration du token:', error);
    return true; // En cas d'erreur, considérer le token comme expiré
  }
}

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

  // Vérifier si le token est expiré
  if (isTokenExpired(authToken)) {
    console.log('Middleware: Token expiré, redirection vers login');
    
    // Créer une réponse de redirection avec suppression du cookie
    const response = NextResponse.redirect(new URL(`/${lang}/auth/login`, request.url))
    
    // Supprimer le cookie de token expiré
    response.cookies.set('token', '', { expires: new Date(0), path: '/' })
    
    return response
  }

  // Si l'utilisateur est authentifié avec un token valide, permettre l'accès à toutes les routes
  console.log('Utilisateur authentifié avec token valide, accès autorisé');
  return NextResponse.next()
}

// Configurer les routes sur lesquelles le middleware s'applique
export const config = {
  matcher: [
    // Appliquer à toutes les routes sauf aux routes statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
