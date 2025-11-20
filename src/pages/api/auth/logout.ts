
// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME } from '../../../constants';

/**
 * Maneja el cierre de sesión del usuario.
 * Elimina la cookie HttpOnly establecida por Astro.
 */
export const POST: APIRoute = async ({ cookies, redirect }) => {



    try {

        cookies.delete(ACCESS_TOKEN_COOKIE_NAME, {
            path: '/',
        });



        // Redirigir al login
        return redirect('/', 302);

    } catch (error) {
        console.error('\n💥 [LOGOUT API] Error durante el logout:');
        console.error('   Error:', error instanceof Error ? error.message : String(error));


        // Aun con error, intentar redirigir al login
        return redirect('/', 302);
    }
};