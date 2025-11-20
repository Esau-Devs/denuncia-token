import { defineMiddleware, sequence } from 'astro/middleware';
import { ACCESS_TOKEN_COOKIE_NAME } from './constants';

const URLAPI = 'https://backend-api-638220759621.us-central1.run.app';
const AUTH_VERIFY_URL = `${URLAPI}/api/auth/verify-session`;
const LOGIN_PATH = '/';
const PROTECTED_PATHS = ['/home'];
const AUTH_PATHS = ['/', '/registrar'];
const PUBLIC_PATHS = ['/PreguntasFrecuentes', '/privacidad', '/terminos', '/contactanos'];

/**
 * Verifica si el token de sesión es válido llamando al backend de FastAPI
 */
const verifySession = async (token: string | undefined): Promise<boolean> => {
    if (!token) {
        return false;
    }

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    try {
        const response = await fetch(AUTH_VERIFY_URL, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        });

        return response.ok;

    } catch (error) {
        console.error('❌ Error al verificar sesión:', error instanceof Error ? error.message : String(error));
        return false;
    }
};

const authMiddleware = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;

    // Permitir rutas API sin verificación
    if (pathname.startsWith('/api/')) {
        return next();
    }

    // Permitir rutas públicas sin verificación
    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
    if (isPublicPath) {
        console.log(`✅ Acceso permitido a ruta pública: ${pathname}`);
        return next();
    }

    const isAuthPath = AUTH_PATHS.includes(pathname);
    const isProtected = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
    const isKnownRoute = isAuthPath || isProtected;

    const sessionToken = context.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
    const isAuthenticated = await verifySession(sessionToken);

    // Manejar rutas desconocidas
    if (!isKnownRoute) {
        if (isAuthenticated) {
            return context.redirect('/home', 302);
        } else {
            return context.redirect(LOGIN_PATH, 302);
        }
    }

    // Usuario autenticado
    if (isAuthenticated) {
        if (isAuthPath) {
            console.log(`✅ Usuario autenticado redirigido de ${pathname} a /home`);
            return context.redirect('/home', 302);
        }
        console.log(`✅ Acceso permitido a ${pathname}`);
        return next();
    }

    // Usuario no autenticado
    if (isProtected) {
        console.log(`❌ Acceso denegado a ${pathname} - Redirigiendo a login`);
        return context.redirect(LOGIN_PATH, 302);
    }

    console.log(`✅ Acceso permitido a ruta de autenticación: ${pathname}`);
    return next();
});

export const onRequest = sequence(authMiddleware);