import type { APIRoute } from 'astro';
import { ACCESS_TOKEN_COOKIE_NAME } from '../../../constants'; // Usamos la constante

// 🚨 Asegúrate de que esta URL base sea correcta
const BACKEND_URL_BASE = 'https://backend-api-638220759621.us-west1.run.app';

export const GET: APIRoute = async ({ request, cookies }) => {
    // 1. Obtener el token de la cookie (si el frontend usa credentials: 'same-origin')
    const accessToken = cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

    if (!accessToken) {
        return new Response(JSON.stringify({ error: 'No autenticado' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 2. Hacer petición al backend, PROXYANDO la solicitud
        const backendResponse = await fetch(
            `${BACKEND_URL_BASE}/usuario/me`, // 🚨 Usar la URL correcta del backend
            {
                // Usar el token de la cookie para crear el header de Autorización para el Backend
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 3. Lógica para manejar la respuesta (ya es robusta, la mantendremos)
        const responseText = await backendResponse.text();
        let data;

        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            if (!backendResponse.ok) {
                data = { error: `Error del backend (${backendResponse.status})`, details: responseText };
            } else {
                throw new Error("Respuesta inválida (JSON esperado)");
            }
        }

        // 4. Propagar la respuesta al frontend
        return new Response(JSON.stringify(data), {
            status: backendResponse.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // ... (Tu manejo de error 502 Bad Gateway)
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        console.error("Error al hacer proxy al backend:", errorMessage);

        return new Response(JSON.stringify({
            error: 'Fallo al comunicarse con el servidor de denuncias',
            details: errorMessage
        }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};