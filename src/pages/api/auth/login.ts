import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME, API_BASE_URL } from '../../../constants';

const AUTH_LOGIN_URL = `${API_BASE_URL}/api/auth/login`;

/**
 * Maneja la solicitud de inicio de sesión.
 */
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    console.log('\n🔐 [LOGIN API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [LOGIN API] Nueva petición de login recibida');
    console.log(`🔐 [LOGIN API] Timestamp: ${new Date().toISOString()}`);

    try {
        // 1. Obtener datos del cuerpo
        const body = await request.json();
        const { dui, password } = body;

        console.log('📋 [LOGIN API] Datos recibidos del frontend:');
        console.log(`   DUI: ${dui}`);
        console.log(`   Password: ${'*'.repeat(password?.length || 0)}`);

        // 2. Llamar al backend de FastAPI
        console.log(`\n📡 [LOGIN API] Llamando a FastAPI: ${AUTH_LOGIN_URL}`);
        const startTime = Date.now();

        const fastApiResponse = await fetch(AUTH_LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dui, password }),
        });

        const endTime = Date.now();
        console.log(`⏱️  [LOGIN API] Respuesta de FastAPI recibida en ${endTime - startTime}ms`);
        console.log(`📨 [LOGIN API] Status HTTP: ${fastApiResponse.status} (${fastApiResponse.statusText})`);

        const data = await fastApiResponse.json();
        console.log('📄 [LOGIN API] Respuesta de FastAPI:', JSON.stringify(data, null, 2));

        // 3. Verificar éxito y extraer token
        if (fastApiResponse.ok && data.token) {
            const accessToken = data.token;

            console.log('\n✅ [LOGIN API] Autenticación exitosa en FastAPI');
            console.log(`🔑 [LOGIN API] Token recibido (longitud: ${accessToken.length})`);
            console.log(`   Primeros 15 caracteres: ${accessToken.substring(0, 15)}...`);

            // 4. Establecer cookie HttpOnly
            console.log(`\n🍪 [LOGIN API] Estableciendo cookie: ${ACCESS_TOKEN_COOKIE_NAME}`);
            console.log('🍪 [LOGIN API] Configuración de cookie:');
            console.log('   httpOnly: true (no accesible desde JS)');
            console.log('   secure: true (solo HTTPS)');
            console.log('   sameSite: none (permite CORS)');
            console.log('   path: / (disponible en toda la app)');
            console.log('   maxAge: 3600 segundos (1 hora)');

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

            // 5. Redirigir a /home
            console.log('\n➡️  [LOGIN API] Preparando redirección a /home (302)');
            console.log('🔐 [LOGIN API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return redirect('/home', 302);
        }

        // Autenticación fallida
        console.log('\n❌ [LOGIN API] Autenticación fallida');
        console.log(`   Status: ${fastApiResponse.status}`);
        console.log(`   Detalle: ${data.detail || 'No especificado'}`);
        console.log('🔐 [LOGIN API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return new Response(JSON.stringify(data), {
            status: fastApiResponse.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('\n💥 [LOGIN API] Error FATAL en el procesamiento:');
        console.error('   Error:', error instanceof Error ? error.message : String(error));
        console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
        console.log('🔐 [LOGIN API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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