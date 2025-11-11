import React from 'react'
import { useFetchDenuncias } from '../../hooks/useFetchDenuncias';

export const BentoOne = () => {
    const { denuncias } = useFetchDenuncias();
    const totalResueltas = denuncias.filter(d => d.estado === "resuelta").length;
    const totalPendientes = denuncias.filter(d => d.estado === "pendiente").length;
    const totalEnProceso = denuncias.filter(d => d.estado === "en proceso").length;


    const handleLogout = async () => {



        console.log('\n🚪 [LOGOUT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚪 [LOGOUT] Iniciando proceso de cierre de sesión');
        console.log(`🚪 [LOGOUT] Timestamp: ${new Date().toISOString()}`);



        try {
            // 🔑 IMPORTANTE: Usar la ruta API de Astro, no el backend directamente
            // Astro es quien estableció la cookie, así que Astro debe eliminarla
            const apiUrl = '/api/auth/logout';

            console.log(`📤 [LOGOUT] Enviando petición a: ${apiUrl}`);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // 🔑 IMPORTANTE: No seguir redirecciones automáticamente
                redirect: 'manual',
                credentials: 'same-origin',
            });

            console.log(`📨 [LOGOUT] Respuesta recibida - Status: ${response.status}`);
            console.log(`📨 [LOGOUT] Response type: ${response.type}`);

            // Verificar si fue exitoso (302 redirect o opaqueredirect)
            if (response.type === 'opaqueredirect' || response.status === 0 || response.status === 302) {
                console.log('✅ [LOGOUT] Logout exitoso - Cookie eliminada');
                console.log('➡️  [LOGOUT] Redirigiendo a página de login');
                console.log('🚪 [LOGOUT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                // Forzar navegación al login
                setTimeout(() => {
                    window.location.href = '/';
                }, 100);

                return;
            }

            // Si no fue exitoso, intentar leer la respuesta
            console.log('⚠️  [LOGOUT] Respuesta inesperada del servidor');

            // Aún así, redirigir al login por seguridad
            console.log('➡️  [LOGOUT] Redirigiendo a login por seguridad');
            console.log('🚪 [LOGOUT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            setTimeout(() => {
                window.location.href = '/';
            }, 100);

        } catch (err) {
            console.error('\n💥 [LOGOUT] Error durante el logout:');
            console.error('   Error:', err instanceof Error ? err.message : String(err));
            console.log('🚪 [LOGOUT] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            // Aún con error, redirigir al login
            console.log('➡️  [LOGOUT] Redirigiendo a login (fallback)');
            setTimeout(() => {
                window.location.href = '/';
            }, 100);

            // Opcional: mostrar error al usuario
            if (setError) {
                setError('Error al cerrar sesión. Redirigiendo...');
            }
        } finally {

        }
    };
    return (
        <div
            className="col-span-2 lg:col-span-1 md:row-span-2 bg-white shadow-lg rounded-xl p-6 md:p-8 hover:shadow-xl transition-shadow"
        >
            <div className="flex items-start gap-4 mb-6">
                <div
                    className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-[#2a3b5d] to-[#0c3b87] flex items-center justify-center flex-shrink-0"
                >
                    <span className="text-white text-2xl font-bold">MG</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h2
                        className="text-xl font-semibold text-gray-900 mb-2"
                    >
                        María González
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        <span
                            className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">Activo</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <span className="font-medium">ID:</span>
                    <span className="text-gray-600">01482303-1</span>
                </div>

                <div className="flex items-center gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                    </svg>
                    <div className="flex lg:flex-row gap-2">
                        <span className="font-medium">Miembro desde:</span>
                        <span className="text-gray-600"> Enero 2024</span>
                    </div>
                </div>
            </div>

            <div
                className="mt-6 pt-6 border-t border-gray-200 grid md:grid-cols-2 grid-cols-1 gap-4"
            >
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent"
                    >
                        {denuncias.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Total Denuncias
                    </p>
                </div>
                <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                    <p className="text-3xl font-bold text-gray-600">{totalResueltas}</p>
                    <p className="text-xs text-gray-500 mt-1">Resueltas</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent"
                    >
                        {totalPendientes}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                </div>
                <div className="text-center p-3 bg-[#e8f0fe] rounded-lg">
                    <p
                        className="text-3xl font-bold bg-gradient-to-r from-[#2a3b5d] to-[#0c3b87] bg-clip-text text-transparent">
                        {totalEnProceso}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">En Proceso</p>
                </div>
            </div>

            {/* Botón de cerrar sesión */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={handleLogout}
                    className="group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-[#2a3b5d] hover:to-[#0c3b87] hover:text-white transition-all duration-300 cursor-pointer"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        ></path>
                    </svg>
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </div>
    )
}
