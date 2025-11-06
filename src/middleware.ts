import { defineMiddleware, sequence } from 'astro/middleware';
// La ruta de importación es './constants' (asumiendo que está en src/)
import { ACCESS_TOKEN_COOKIE_NAME } from './constants'; // ✅ CORRECCIÓN: Re-habilitamos la importación.
// 🔥 ELIMINAMOS la definición local que forzaba el nombre: const SESSION_COOKIE_NAME = "session_token";
const URLAPI = 'https://backend-api-638220759621.us-central1.run.app';
// Define la ruta donde se verifica el estado de la sesión
const AUTH_VERIFY_URL = `${URLAPI}/api/auth/verify-session`;

// 🔑 CORRECCIÓN: La ruta de login es la raíz, la marcamos como /
const LOGIN_PATH = '/';

// Rutas protegidas que requieren sesión (SOLO RUTAS INTERNAS)
// Si el usuario no está autenticado, cualquier acceso a estas rutas se redirigirá a LOGIN_PATH ('/')
const PROTECTED_PATHS = ['/home'];

// Rutas de autenticación (Estas deben ser bloqueadas si el usuario ya está autenticado)
// Ahora incluye la raíz '/' como la página de login
const AUTH_PATHS = ['/', '/registrar'];

/**
 * Realiza una llamada al backend de FastAPI para validar el token HttpOnly.
 * * CRÍTICO: Si la cookie no está siendo enviada correctamente a FastAPI,
 * este middleware la lee de la petición entrante y la reenvía como
 * un encabezado de Autorización (el workaround).
 */
const verifySession = async (token: string | undefined): Promise<boolean> => {
    // 💡 DIAGNÓSTICO 1: Comprobar si el token fue extraído de la cookie
    if (!token) {
        console.log('[AUTH DEBUG] Token no encontrado en la cookie.');
        return false;
    }

    // 💡 Creamos los encabezados para la petición a FastAPI
    const headers = new Headers();

    // 💡 WORKAROUND: Forzamos el envío del token en el encabezado Authorization.
    const authHeaderValue = `Bearer ${token}`;
    headers.set('Authorization', authHeaderValue);

    // 🚨 DIAGNÓSTICO 2: Confirmar que el encabezado va a ser enviado (parcialmente)
    console.log(`[AUTH DEBUG] Verificando sesión en: ${AUTH_VERIFY_URL}`);
    console.log(`[AUTH DEBUG] Token encontrado. Longitud: ${token.length}.`);
    // No mostrar el token completo por seguridad, pero confirmamos su presencia

    try {
        const response = await fetch(AUTH_VERIFY_URL, {
            method: 'GET',
            headers: headers, // 💡 Usamos los nuevos encabezados
            credentials: 'include',
        });

        // 🚨 DIAGNÓSTICO 3: Revisar el estado de la respuesta del backend
        if (!response.ok) {
            console.error(
                `[AUTH ERROR] Verificación de sesión fallida. Estado HTTP: ${response.status} (${response.statusText})`
            );
            // Intenta leer el cuerpo del error si existe
            try {
                const errorBody = await response.json();
                console.error('[AUTH ERROR] Cuerpo de respuesta (FastAPI):', errorBody);
            } catch (e) {
                // El cuerpo no es JSON, ignora
            }
            return false;
        }

        console.log('[AUTH SUCCESS] Sesión verificada correctamente (200 OK).');
        return true;
    } catch (error) {
        // Ignoramos errores de red/conexión (FastAPI no está corriendo, o problema de CORS/red).
        console.error('[AUTH FATAL] Error al verificar la sesión (fallo de red/conexión con FastAPI):', error);
        return false;
    }
};


const authMiddleware = defineMiddleware(async (context, next) => {
    const pathname = context.url.pathname;


    // Comprobar si la ruta es una ruta de autenticación (/, /registrar)
    const isAuthPath = AUTH_PATHS.includes(pathname);

    // Comprobar si la ruta es protegida o es una sub-ruta de una ruta protegida
    const isProtected = PROTECTED_PATHS.some(path =>
        // Coincidencia exacta O comienza con la ruta protegida + barra (ej. /home/denuncias)
        pathname === path || pathname.startsWith(`${path}/`)
    );
    const isKnownRoute = isAuthPath || isProtected;
    // Usamos la constante para obtener la cookie de la Petición ENTRANTE del cliente
    // ¡Aquí es donde obtenemos el token HttpOnly!
    // ✅ CAMBIO: Usamos la constante importada
    const sessionToken = context.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;


    // Verificar si la sesión es válida (llama al backend, usando el token de la cookie en el encabezado)
    const isAuthenticated = await verifySession(sessionToken);


    if (!isKnownRoute) {
        if (isAuthenticated) {
            // Usuario autenticado en ruta inexistente → redirigir al home
            return context.redirect('/home', 302);
        } else {
            // Usuario NO autenticado en ruta inexistente → redirigir al login
            return context.redirect(LOGIN_PATH, 302);
        }
    }

    // --- LÓGICA DE MANEJO DE SESIÓN ---

    // Caso A: Usuario Autenticado
    if (isAuthenticated) {
        // Si está logueado e intenta ir a las rutas de autenticación ('/' o /registrar), lo redirigimos a /home.
        if (isAuthPath) {
            return context.redirect('/home', 302);
        }
        // Si está logueado y va a cualquier otra ruta, lo dejamos pasar.
        return next();
    }

    // Caso B: Usuario NO Autenticado

    // Si NO está logueado y está intentando acceder a una ruta protegida (/home o sub-rutas), lo redirigimos a LOGIN_PATH (que ahora es '/').
    if (isProtected) {
        return context.redirect(LOGIN_PATH, 302);
    }

    // Si NO está logueado y está en una ruta de autenticación ('/' o /registrar), lo dejamos pasar.
    return next();
});

// La función onRequest debe exportar la secuencia de middleware.
export const onRequest = sequence(authMiddleware);