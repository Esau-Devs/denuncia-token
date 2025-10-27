import { defineMiddleware, sequence } from 'astro/middleware';
// La ruta de importación es './constants' (asumiendo que está en src/)
import { ACCESS_TOKEN_COOKIE_NAME } from './constants';

// Define la ruta donde se verifica el estado de la sesión
const AUTH_VERIFY_URL = 'http://localhost:8000/api/auth/verify-session';

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
    if (!token) {

        return false;
    }

    // 💡 Creamos los encabezados para la petición a FastAPI
    const headers = new Headers();

    // 💡 WORKAROUND: Forzamos el envío del token en el encabezado Authorization.
    const authHeaderValue = `Bearer ${token}`;
    headers.set('Authorization', authHeaderValue);

    // 🚨 NUEVO DIAGNÓSTICO: Confirmar que el encabezado va a ser enviado


    try {
        const response = await fetch(AUTH_VERIFY_URL, {
            method: 'GET',
            headers: headers, // 💡 Usamos los nuevos encabezados
            // NOTA: credentials: 'include' ya no es CRUCIAL aquí porque enviamos el token
            // en el encabezado, pero lo mantenemos como fallback para la cookie.
            credentials: 'include',
        });


        if (!response.ok) {
            console.error("Error en la verificación de sesión:", response.statusText);
            return false;
        }
        return response.ok;



    } catch (error) {
        // Ignoramos errores de red/conexión.
        console.error("Error al verificar la sesión con FastAPI:", error);
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