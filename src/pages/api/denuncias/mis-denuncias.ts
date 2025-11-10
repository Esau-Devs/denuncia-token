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

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' }
    });
};