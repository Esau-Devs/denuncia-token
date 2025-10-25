// src/constants.ts

/**
 * Nombre de la cookie utilizada por FastAPI para almacenar el token de sesión.
 * Este nombre debe coincidir EXACTAMENTE con el nombre de la cookie configurada en tu backend.
 * Por convención, FastAPI y Astro esperan que sea "session_token" si sigues la guía típica.
 */
export const ACCESS_TOKEN_COOKIE_NAME = 'session_token';

// Puedes añadir aquí otras constantes si las necesitas (por ejemplo, rutas de API).
// export const API_BASE_URL = 'http://localhost:8000/api';
