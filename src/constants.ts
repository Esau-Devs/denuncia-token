// src/constants.ts

/**
 * Nombre de la cookie utilizada para almacenar el token de sesión.
 * Este nombre debe coincidir EXACTAMENTE con SESSION_COOKIE_NAME del backend.
 * 
 * En tu backend de Python debería estar definido como:
 * SESSION_COOKIE_NAME = "session_token"
 */
export const ACCESS_TOKEN_COOKIE_NAME = "session_token";

/**
 * URL del backend de FastAPI
 */
export const API_BASE_URL = 'https://backend-api-638220759621.us-west1.run.app';

/**
 * Ruta para verificar el estado de la sesión en el backend.
 */
export const AUTH_VERIFY_URL = `${API_BASE_URL}/api/auth/verify-session`;