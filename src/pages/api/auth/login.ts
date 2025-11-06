import type { APIRoute } from 'astro';
// Asumiendo que estos valores están definidos en src/constants
// Por favor, verifica que tienes un archivo src/constants.ts con:
// export const API_BASE_URL = "http://localhost:8000"; 
// export const ACCESS_TOKEN_COOKIE_NAME = "access_token";
import { ACCESS_TOKEN_COOKIE_NAME, API_BASE_URL } from '../../../constants';

// Define la URL del endpoint de login en tu backend de FastAPI
const AUTH_LOGIN_URL = `${API_BASE_URL}/api/auth/login`;

/**
 * Maneja la solicitud de inicio de sesión.
 * 1. Recibe el DUI y la contraseña del componente React.
 * 2. Llama al backend de FastAPI para autenticar.
 * 3. Si es exitoso, extrae el token de la respuesta de FastAPI.
 * 4. Establece el token como una cookie HttpOnly, Secure y SameSite=None en el navegador.
 * 5. Redirige al usuario a la página de inicio (/home).
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    try {
        // 1. Obtener datos del cuerpo de la solicitud (enviados por React)
        const { dui, password } = await request.json();

        // 2. Llamar al backend de FastAPI
        const fastApiResponse = await fetch(AUTH_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dui, password }),
        });

        const data = await fastApiResponse.json();

        // 3. Manejar el éxito y la autenticación
        if (fastApiResponse.ok && data.token) {
            // CRÍTICO: El token ahora viene en la clave 'token' (revisado en auth_router.py)
            const accessToken = data.token;

            // 4. 🔥 ACCIÓN CRÍTICA: Establecer la cookie de sesión segura en Astro
            // Esto es crucial para el flujo de autenticación server-side (Astro Middleware)
            // HttpOnly: Previene acceso por JS (seguridad).
            // Secure: Solo se envía sobre HTTPS.
            // SameSite=None: Permite enviar la cookie en llamadas de CORS (necesario para el backend de FastAPI).
            // maxAge: 1 hora de validez (3600 segundos).
            cookies.set(
                ACCESS_TOKEN_COOKIE_NAME,
                accessToken,
                {
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'none', // Necesario para FastAPI/CORS
                    maxAge: 3600, // 1 hora
                }
            );

            // 5. Redirigir al usuario al home (Status 302)
            // La respuesta será interceptada por el componente React para forzar la navegación.
            return redirect('/home', 302);
        }

        // Manejar fallas de autenticación (e.g., 401 Unauthorized)
        // Devolvemos el error de FastAPI para que React lo muestre.
        return new Response(JSON.stringify(data), {
            status: fastApiResponse.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('[ASTRO API FATAL] Error en el procesamiento del login:', error);

        // Devolver un error genérico en caso de fallas de red o JSON inválido.
        return new Response(JSON.stringify({
            detail: 'Error interno del servidor. Inténtalo de nuevo.',
            error: error instanceof Error ? error.message : String(error),
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
