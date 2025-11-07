import { defineMiddleware, sequence } from 'astro/middleware';
import { ACCESS_TOKEN_COOKIE_NAME } from './constants';

const URLAPI = 'https://backend-api-638220759621.us-central1.run.app';
const AUTH_VERIFY_URL = `${URLAPI}/api/auth/verify-session`;
const LOGIN_PATH = '/';
const PROTECTED_PATHS = ['/home'];
const AUTH_PATHS = ['/', '/registrar'];

/**
 * Verifica si el token de sesión es válido llamando al backend de FastAPI
 */
const verifySession = async (token: string | undefined, pathname: string): Promise<boolean> => {
    console.log('\n🔐 [MIDDLEWARE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔐 [MIDDLEWARE] Verificando sesión para ruta: ${pathname}`);

    if (!token) {
        console.log('❌ [MIDDLEWARE] Token NO encontrado en la cookie');
        console.log(`   Cookie buscada: ${ACCESS_TOKEN_COOKIE_NAME}`);
        console.log('🔐 [MIDDLEWARE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return false;
    }

    console.log('✅ [MIDDLEWARE] Token encontrado en cookie');
    console.log(`   Longitud del token: ${token.length} caracteres`);
    console.log(`   Primeros 10 caracteres: ${token.substring(0, 10)}...`);

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);

    console.log(`📡 [MIDDLEWARE] Llamando a: ${AUTH_VERIFY_URL}`);
    console.log('📡 [MIDDLEWARE] Con encabezado Authorization');

    try {
        const startTime = Date.now();
        const response = await fetch(AUTH_VERIFY_URL, {
            method: 'GET',
            headers: headers,
            credentials: 'include',
        });
        const endTime = Date.now();

        console.log(`⏱️  [MIDDLEWARE] Respuesta recibida en ${endTime - startTime}ms`);
        console.log(`📨 [MIDDLEWARE] Status HTTP: ${response.status} (${response.statusText})`);

        if (!response.ok) {
            console.error('❌ [MIDDLEWARE] Verificación FALLIDA');

            try {
                const errorBody = await response.json();
                console.error('📄 [MIDDLEWARE] Cuerpo del error:', JSON.stringify(errorBody, null, 2));
            } catch (e) {
                console.error('📄 [MIDDLEWARE] No se pudo parsear cuerpo del error');
            }

            console.log('🔐 [MIDDLEWARE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return false;
        }

        console.log('✅ [MIDDLEWARE] Sesión VERIFICADA correctamente (200 OK)');
        console.log('🔐 [MIDDLEWARE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return true;

    } catch (error) {
        console.error('💥 [MIDDLEWARE] Error FATAL al verificar sesión:');
        console.error('   Error:', error instanceof Error ? error.message : String(error));
        console.error('   Posibles causas:');
        console.error('   - Backend de FastAPI no está corriendo');
        console.error('   - Problema de red/conectividad');
        console.error('   - Error de CORS');
        console.log('🔐 [MIDDLEWARE] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return false;
    }
};

const authMiddleware = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;

    console.log('\n🌐 [MIDDLEWARE] ═══════════════════════════════════════════');
    console.log(`🌐 [MIDDLEWARE] Nueva petición: ${context.request.method} ${pathname}`);
    console.log(`🌐 [MIDDLEWARE] Timestamp: ${new Date().toISOString()}`);

    // 🔥 CRÍTICO: Excluir rutas API del middleware
    // Las rutas /api/* son endpoints internos y deben pasar sin verificación
    if (pathname.startsWith('/api/')) {
        console.log('🔓 [MIDDLEWARE] Ruta API detectada - permitiendo acceso directo');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return next();
    }

    // Verificar tipo de ruta
    const isAuthPath = AUTH_PATHS.includes(pathname);
    const isProtected = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
    const isKnownRoute = isAuthPath || isProtected;

    console.log('📋 [MIDDLEWARE] Clasificación de ruta:');
    console.log(`   ¿Es ruta de autenticación? ${isAuthPath ? '✅' : '❌'}`);
    console.log(`   ¿Es ruta protegida? ${isProtected ? '✅' : '❌'}`);
    console.log(`   ¿Es ruta conocida? ${isKnownRoute ? '✅' : '❌'}`);

    // Intentar obtener la cookie
    console.log(`\n🍪 [MIDDLEWARE] Buscando cookie: ${ACCESS_TOKEN_COOKIE_NAME}`);
    const sessionToken = context.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (sessionToken) {
        console.log('✅ [MIDDLEWARE] Cookie encontrada en la petición');
    } else {
        console.log('❌ [MIDDLEWARE] Cookie NO encontrada en la petición');
        console.log('   (Intentando acceder sin cookie de sesión)');
    }

    // Verificar autenticación
    const isAuthenticated = await verifySession(sessionToken, pathname);
    console.log(`\n🔒 [MIDDLEWARE] Estado de autenticación: ${isAuthenticated ? '✅ AUTENTICADO' : '❌ NO AUTENTICADO'}`);

    // Manejar rutas desconocidas
    if (!isKnownRoute) {
        console.log('⚠️  [MIDDLEWARE] Ruta desconocida detectada');
        if (isAuthenticated) {
            console.log('➡️  [MIDDLEWARE] Redirigiendo usuario autenticado a /home');
            console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
            return context.redirect('/home', 302);
        } else {
            console.log('➡️  [MIDDLEWARE] Redirigiendo usuario no autenticado a /');
            console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
            return context.redirect(LOGIN_PATH, 302);
        }
    }

    // Usuario AUTENTICADO
    if (isAuthenticated) {
        console.log('✅ [MIDDLEWARE] Usuario autenticado procesando ruta...');

        if (isAuthPath) {
            console.log('➡️  [MIDDLEWARE] Usuario autenticado intentando acceder a ruta de auth');
            console.log('   Redirigiendo a /home (ya está logueado)');
            console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
            return context.redirect('/home', 302);
        }

        console.log('✅ [MIDDLEWARE] Permitiendo acceso a ruta protegida');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return next();
    }

    // Usuario NO AUTENTICADO
    console.log('❌ [MIDDLEWARE] Usuario NO autenticado procesando ruta...');

    if (isProtected) {
        console.log('➡️  [MIDDLEWARE] Intentando acceder a ruta protegida sin autenticación');
        console.log('   Redirigiendo a / (login)');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return context.redirect(LOGIN_PATH, 302);
    }

    console.log('✅ [MIDDLEWARE] Permitiendo acceso a ruta de autenticación');
    console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
    return next();
});

export const onRequest = sequence(authMiddleware);