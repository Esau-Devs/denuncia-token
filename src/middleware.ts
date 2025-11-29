import { defineMiddleware, sequence } from 'astro/middleware';
import { ACCESS_TOKEN_COOKIE_NAME } from './constants';

const URLAPI = 'https://backend-api-638220759621.us-west1.run.app';
const AUTH_VERIFY_URL = `${URLAPI}/api/auth/verify-session`; // ✅ SIN /api
const LOGIN_PATH = '/';
const PROTECTED_PATHS = ['/home'];
const AUTH_PATHS = ['/', '/registrar'];
const PUBLIC_PATHS = ['/PreguntasFrecuentes', '/privacidad', '/terminos', '/contactanos'];

const verifySession = async (token: string | undefined): Promise<boolean> => {
    if (!token) {
        console.log('🔍 [VERIFY] No hay token para verificar');
        return false;
    }

    console.log(`🔍 [VERIFY] Verificando token: ${token.substring(0, 30)}...`);

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    try {
        const response = await fetch(AUTH_VERIFY_URL, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        });

        console.log(`🔍 [VERIFY] Respuesta del servidor: ${response.status} ${response.ok ? '✅' : '❌'}`);
        return response.ok;

    } catch (error) {
        console.error('❌ [VERIFY] Error al verificar sesión:', error instanceof Error ? error.message : String(error));
        return false;
    }
};

const authMiddleware = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;

    console.log('\n' + '='.repeat(70));
    console.log(`🔍 [MIDDLEWARE] Procesando ruta: ${pathname}`);
    console.log('='.repeat(70));

    // Permitir rutas API sin verificación
    if (pathname.startsWith('/api/')) {
        console.log(`✅ [MIDDLEWARE] Ruta API - pasando directamente`);
        console.log('='.repeat(70) + '\n');
        return next();
    }

    // Permitir rutas públicas sin verificación
    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
    if (isPublicPath) {
        console.log(`✅ [MIDDLEWARE] Ruta pública - acceso permitido: ${pathname}`);
        console.log('='.repeat(70) + '\n');
        return next();
    }

    const isAuthPath = AUTH_PATHS.includes(pathname);
    const isProtected = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
    const isKnownRoute = isAuthPath || isProtected;

    console.log(`📊 [MIDDLEWARE] Análisis de ruta:`);
    console.log(`   • isAuthPath: ${isAuthPath}`);
    console.log(`   • isProtected: ${isProtected}`);
    console.log(`   • isKnownRoute: ${isKnownRoute}`);

    const sessionToken = context.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    console.log(`🍪 [MIDDLEWARE] Buscando cookie: '${ACCESS_TOKEN_COOKIE_NAME}'`);
    console.log(`🍪 [MIDDLEWARE] Cookie encontrada: ${sessionToken ? '✅ SÍ' : '❌ NO'}`);

    if (sessionToken) {
        console.log(`🍪 [MIDDLEWARE] Token (primeros 30 chars): ${sessionToken.substring(0, 30)}...`);
        console.log(`🍪 [MIDDLEWARE] Token length: ${sessionToken.length} caracteres`);
    }

    const isAuthenticated = await verifySession(sessionToken);
    console.log(`🔐 [MIDDLEWARE] Usuario autenticado: ${isAuthenticated ? '✅ SÍ' : '❌ NO'}`);

    // Manejar rutas desconocidas
    if (!isKnownRoute) {
        console.log(`⚠️  [MIDDLEWARE] Ruta desconocida detectada`);
        if (isAuthenticated) {
            console.log(`🔄 [MIDDLEWARE] Usuario autenticado → Redirigiendo a /home`);
            console.log('='.repeat(70) + '\n');
            return context.redirect('/home', 302);
        } else {
            console.log(`🔄 [MIDDLEWARE] Usuario NO autenticado → Redirigiendo a ${LOGIN_PATH}`);
            console.log('='.repeat(70) + '\n');
            return context.redirect(LOGIN_PATH, 302);
        }
    }

    // Usuario autenticado
    if (isAuthenticated) {
        if (isAuthPath) {
            console.log(`🔄 [MIDDLEWARE] Usuario autenticado intentando acceder a ruta de auth (${pathname})`);
            console.log(`🔄 [MIDDLEWARE] Redirigiendo de ${pathname} a /home`);
            console.log('='.repeat(70) + '\n');
            return context.redirect('/home', 302);
        }
        console.log(`✅ [MIDDLEWARE] Usuario autenticado - Acceso permitido a ${pathname}`);
        console.log('='.repeat(70) + '\n');
        return next();
    }

    // Usuario no autenticado
    if (isProtected) {
        console.log(`❌ [MIDDLEWARE] Ruta protegida sin autenticación`);
        console.log(`🔄 [MIDDLEWARE] Redirigiendo de ${pathname} a ${LOGIN_PATH}`);
        console.log('='.repeat(70) + '\n');
        return context.redirect(LOGIN_PATH, 302);
    }

    console.log(`✅ [MIDDLEWARE] Acceso permitido a ruta de autenticación: ${pathname}`);
    console.log('='.repeat(70) + '\n');
    return next();
});

export const onRequest = sequence(authMiddleware);