import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME, API_BASE_URL } from '../../../constants';

const AUTH_LOGIN_URL = `${API_BASE_URL}/api/auth/login`;

/**
 * Maneja la solicitud de inicio de sesión.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {

    try {
        // 1. Obtener datos del cuerpo
        const body = await request.json();
        const { dui, password } = body;

        const fastApiResponse = await fetch(AUTH_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dui, password }),
        });




        const data = await fastApiResponse.json();


        // 3. Verificar éxito y extraer token
        if (fastApiResponse.ok && data.token) {
            const accessToken = data.token;


            cookies.set(
                ACCESS_TOKEN_COOKIE_NAME,
                accessToken,
                {
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    sameSite: 'none',
                    maxAge: 3600,
                }
            );

            console.log('✅ [LOGIN API] Cookie establecida exitosamente');



            return redirect('/home', 302);
        }

        // Autenticación fallida
        console.log('\n❌ [LOGIN API] Autenticación fallida');


        return new Response(JSON.stringify(data), {
            status: fastApiResponse.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {

        console.error('   Error:', error instanceof Error ? error.message : String(error));
        console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');


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