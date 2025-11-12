import { defineMiddleware, sequence } from 'astro/middleware';
import { ACCESS_TOKEN_COOKIE_NAME } from './constants';

const URLAPI = 'https://backend-api-638220759621.us-central1.run.app';
const AUTH_VERIFY_URL = `${URLAPI}/api/auth/verify-session`;
const LOGIN_PATH = '/';
const HOME_PATH = '/home';
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
    }

    // Verificar autenticación
    const isAuthenticated = await verifySession(sessionToken, pathname);
    console.log(`\n🔒 [MIDDLEWARE] Estado de autenticación: ${isAuthenticated ? '✅ AUTENTICADO' : '❌ NO AUTENTICADO'}`);

    // 🎯 NUEVA LÓGICA SIMPLIFICADA

    // Si está AUTENTICADO
    if (isAuthenticated) {
        console.log('✅ [MIDDLEWARE] Usuario autenticado detectado');

        // Si intenta acceder a rutas de auth (login/registrar), redirigir a home
        if (isAuthPath) {
            console.log('➡️  [MIDDLEWARE] Usuario autenticado en ruta de auth → Redirigiendo a /home');
            console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
            return context.redirect(HOME_PATH, 302);
        }

        // Si es una ruta conocida y válida (protegida), permitir acceso
        if (isProtected) {
            console.log('✅ [MIDDLEWARE] Permitiendo acceso a ruta protegida');
            console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
            return next();
        }

        // Si es cualquier otra ruta desconocida, redirigir a home
        console.log('⚠️  [MIDDLEWARE] Ruta desconocida con usuario autenticado → Redirigiendo a /home');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return context.redirect(HOME_PATH, 302);
    }

    // Si NO está AUTENTICADO
    console.log('❌ [MIDDLEWARE] Usuario NO autenticado detectado');

    // Si intenta acceder a ruta protegida, redirigir a login
    if (isProtected) {
        console.log('➡️  [MIDDLEWARE] Intento de acceso a ruta protegida sin auth → Redirigiendo a /');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return context.redirect(LOGIN_PATH, 302);
    }

    // Si es ruta de auth (login/registrar), permitir acceso
    if (isAuthPath) {
        console.log('✅ [MIDDLEWARE] Permitiendo acceso a ruta de autenticación');
        console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
        return next();
    }

    // Cualquier otra ruta desconocida sin autenticación → login
    console.log('⚠️  [MIDDLEWARE] Ruta desconocida sin autenticación → Redirigiendo a /');
    console.log('🌐 [MIDDLEWARE] ═══════════════════════════════════════════\n');
    return context.redirect(LOGIN_PATH, 302);
});

export const onRequest = sequence(authMiddleware);