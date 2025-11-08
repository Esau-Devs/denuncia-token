// src/pages/api/denuncias/crear.ts
import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME, API_BASE_URL } from '../../../constants';

const DENUNCIAS_CREATE_URL = `${API_BASE_URL}/denuncias/crear`;

/**
 * Proxy para crear denuncias.
 * Recibe FormData del frontend y lo reenvía al backend con el token.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
    console.log('\n📝 [DENUNCIA API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 [DENUNCIA API] Nueva petición para crear denuncia');
    console.log(`📝 [DENUNCIA API] Timestamp: ${new Date().toISOString()}`);

    try {
        // 1. Obtener el token de la cookie
        console.log(`\n🍪 [DENUNCIA API] Buscando cookie: ${ACCESS_TOKEN_COOKIE_NAME}`);
        const token = cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

        if (!token) {
            console.error('❌ [DENUNCIA API] Token no encontrado en la cookie');
            console.log('   El usuario no está autenticado');
            console.log('📝 [DENUNCIA API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return new Response(JSON.stringify({
                detail: 'No autenticado. Debes iniciar sesión.'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        console.log('✅ [DENUNCIA API] Token encontrado en cookie');
        console.log(`   Token preview: ${token.substring(0, 20)}...`);

        // 2. Obtener el FormData de la petición original
        console.log('\n📦 [DENUNCIA API] Extrayendo FormData...');
        const formData = await request.formData();

        // Log de los campos recibidos
        console.log('📋 [DENUNCIA API] Campos recibidos:');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`   ${key}: ${value.name} (${value.type}, ${(value.size / 1024).toFixed(2)} KB)`);
            } else {
                console.log(`   ${key}: ${value}`);
            }
        }

        // 3. Crear headers con el token
        const headers = new Headers();
        headers.set('Authorization', `Bearer ${token}`);

        console.log('\n📡 [DENUNCIA API] Reenviando petición al backend...');
        console.log(`   URL: ${DENUNCIAS_CREATE_URL}`);
        console.log('   Con Authorization header');

        // 4. Reenviar la petición al backend de FastAPI
        const startTime = Date.now();
        const backendResponse = await fetch(DENUNCIAS_CREATE_URL, {
            method: 'POST',
            headers: headers,
            body: formData, // Reenviar el FormData tal cual
        });
        const endTime = Date.now();

        console.log(`⏱️  [DENUNCIA API] Respuesta del backend en ${endTime - startTime}ms`);
        console.log(`📨 [DENUNCIA API] Status: ${backendResponse.status} (${backendResponse.statusText})`);

        // 5. Leer la respuesta del backend
        const responseData = await backendResponse.json();

        if (!backendResponse.ok) {
            console.error('❌ [DENUNCIA API] Error del backend:');
            console.error('   Status:', backendResponse.status);
            console.error('   Detalle:', JSON.stringify(responseData, null, 2));
            console.log('📝 [DENUNCIA API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return new Response(JSON.stringify(responseData), {
                status: backendResponse.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // 6. Denuncia creada exitosamente
        console.log('✅ [DENUNCIA API] Denuncia creada exitosamente');
        console.log(`   ID: ${responseData.denuncia_id || 'N/A'}`);
        console.log('📝 [DENUNCIA API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return new Response(JSON.stringify(responseData), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('\n💥 [DENUNCIA API] Error fatal:');
        console.error('   Error:', error instanceof Error ? error.message : String(error));
        console.log('📝 [DENUNCIA API] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return new Response(JSON.stringify({
            detail: 'Error interno del servidor',
            error: error instanceof Error ? error.message : String(error),
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};