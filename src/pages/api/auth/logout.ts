
// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME } from '../../../constants';

/**
 * Maneja el cierre de sesión del usuario.
 * Elimina la cookie HttpOnly establecida por Astro.
 */
export const POST: APIRoute = async ({ cookies, redirect }) => {
    console.log('\n🚪 [LOGOUT API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚪 [LOGOUT API] Petición de logout recibida');
    console.log(`🚪 [LOGOUT API] Timestamp: ${new Date().toISOString()}`);

    try {
        // Verificar si la cookie existe antes de eliminarla
        const currentCookie = cookies.get(ACCESS_TOKEN_COOKIE_NAME);

        if (currentCookie) {
            console.log(`✅ [LOGOUT API] Cookie '${ACCESS_TOKEN_COOKIE_NAME}' encontrada`);
            console.log(`   Token preview: ${currentCookie.value.substring(0, 20)}...`);
        } else {
            console.log(`⚠️  [LOGOUT API] Cookie '${ACCESS_TOKEN_COOKIE_NAME}' no encontrada`);
            console.log('   El usuario ya estaba deslogueado o la cookie expiró');
        }

        // Eliminar la cookie de sesión
        console.log(`\n🗑️  [LOGOUT API] Eliminando cookie '${ACCESS_TOKEN_COOKIE_NAME}'`);
        cookies.delete(ACCESS_TOKEN_COOKIE_NAME, {
            path: '/',
        });

        console.log('✅ [LOGOUT API] Cookie eliminada exitosamente');
        console.log('➡️  [LOGOUT API] Redirigiendo a página de login (/)');
        console.log('🚪 [LOGOUT API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Redirigir al login
        return redirect('/', 302);

    } catch (error) {
        console.error('\n💥 [LOGOUT API] Error durante el logout:');
        console.error('   Error:', error instanceof Error ? error.message : String(error));
        console.log('🚪 [LOGOUT API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Aun con error, intentar redirigir al login
        return redirect('/', 302);
    }
};