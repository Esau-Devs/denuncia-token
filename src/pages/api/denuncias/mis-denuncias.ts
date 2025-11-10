// src/pages/api/denuncias/mis-denuncias.ts
import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME } from '../../../constants';

export const GET: APIRoute = async ({ request, cookies }) => {
    const accessToken = cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No autenticado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Hacer petición al backend agregando el token
        const backendResponse = await fetch(
            'https://backend-api-638220759621.us-west1.run.app/denuncias/mis-denuncias',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // --- 🎯 CAMBIOS CLAVE A PARTIR DE AQUÍ ---

        // Intentar leer el cuerpo como texto primero. Esto previene un crash
        // si el servidor devuelve un 404/500 con HTML o texto plano.
        const responseText = await backendResponse.text();
        let data;

        try {
            // Si la respuesta tiene contenido, intentamos parsear JSON
            data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            // Si el parseo falla (no era JSON), la data es el texto de error.
            if (!backendResponse.ok) {
                data = { error: `Error del backend (${backendResponse.status})`, details: responseText };
            } else {
                // Si sí fue 200 pero el JSON era inválido, lanzamos un error en el proxy.
                throw new Error("Respuesta inválida (JSON esperado)");
            }
        }

        return new Response(JSON.stringify(data), {
            status: backendResponse.status, // Propagamos el status original (200, 401, 404, 500, etc.)
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // Este bloque captura errores de red (e.g., el backend no está disponible)
        // o el error de parseo si es una respuesta inesperada.
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error("Error al hacer proxy al backend:", errorMessage);

        return new Response(JSON.stringify({
            error: 'Fallo al comunicarse con el servidor de denuncias',
            details: errorMessage
        }), {
            status: 502, // 502 Bad Gateway es apropiado para fallos de proxy
            headers: { 'Content-Type': 'application/json' }
        });
    }
};